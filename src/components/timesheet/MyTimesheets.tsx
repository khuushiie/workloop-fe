import React, { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Clock,
  CheckCircle,
  Calendar,
  Users,
  Trash2,
  Eye,
  SquarePen,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// APIs
import {
  useGetMyTimesheetsQuery,
  useGetTimesheetStatsQuery,
  useDeleteTimesheetMutation,
  useSubmitTimesheetMutation,
} from "../../store/apis/timesheet.api";

// Types & Utils
import { TimesheetEntry, TimesheetFilters } from "../../types/timesheet";
import {
  getWorkflowStatusFallbackLabel,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
} from "../../utils/constants";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { getTimesheetStatusVariant } from "../../utils/badgeVariants";
import { convertToHourMinute } from "../../utils/convertToHourMinute";
import { capitalizeWords } from "../../utils/nameUtils";

// Components
import AddTimesheetModal from "./AddTimesheetModal";
import TimesheetViewModal from "./TimesheetViewModal";
import ConfirmationModal from "../common/ConfirmationModal";
import FilterWrapper from "../common/FilterWrapper";
import TimesheetFiltersBar from "./TimesheetFiltersBar";
import Pagination from "../common/Pagination";
import Badge from "../common/Badge";
import { Button, SimpleTooltip, ConfigurableTable } from "../common";
import { TableColumn } from "../common/Table";
import { StatCardSkeleton, TimesheetTableSkeleton } from "./Skeleton";

dayjs.extend(utc);
dayjs.extend(timezone);

const MyTimesheets: React.FC = () => {
  const userTimezone = dayjs.tz.guess();

  // --- STATE ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<TimesheetEntry | null>(null);
  const [filters, setFilters] = useState<TimesheetFilters>({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [timesheetToDelete, setTimesheetToDelete] = useState<string | null>(null);

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTimesheet, setViewingTimesheet] = useState<TimesheetEntry | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const canManage = useHasPermission(PERMISSIONS.MY_TIMESHEETS_MANAGE);

  // --- QUERIES ---
  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      limit: itemsPerPage,
      ...(filters.status && { status: filters.status as any }),
      ...(filters.search && { search: filters.search }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.department && { department: filters.department }),
      ...(filters.fromDate && { startDate: filters.fromDate }),
      ...(filters.toDate && { endDate: filters.toDate }),
    };
  }, [filters, currentPage, itemsPerPage]);

  const { data: timesheetRes, isLoading: listLoading } = useGetMyTimesheetsQuery(queryParams);
  const { data: stats, isLoading: statsLoading } = useGetTimesheetStatsQuery();

  const timesheets: TimesheetEntry[] = timesheetRes?.data ?? [];
  const totalItems = timesheetRes?.total ?? 0;
  const loading = listLoading || statsLoading;

  // --- MUTATIONS ---
  const [
    deleteTimesheet,
    { isLoading: isDeleting, isSuccess: deleteSuccess, isError: deleteError },
  ] = useDeleteTimesheetMutation();

  const [
    submitTimesheet,
    { isLoading: isSubmitting, isSuccess: submitSuccess, isError: submitError },
  ] = useSubmitTimesheetMutation();

  // --- HANDLERS ---
  const handleFilterChange = (key: keyof TimesheetFilters, value: string) => {
    if ((key === "fromDate" || key === "toDate") && value) {
      const selectedDate = dayjs(value);
      const today = dayjs();
      const oneYearAgo = today.subtract(1, "year");
      const oneYearFromNow = today.add(1, "year");

      if (selectedDate.isBefore(oneYearAgo)) {
        toast.error("Date cannot be more than 1 year in the past");
        return;
      }
      if (selectedDate.isAfter(oneYearFromNow)) {
        toast.error("Date cannot be more than 1 year in the future");
        return;
      }
    }

    if (key === "fromDate" && value && filters.toDate) {
      const fromDate = dayjs(value);
      const toDate = dayjs(filters.toDate);
      if (fromDate.isAfter(toDate)) {
        toast.error("From date cannot be after To date");
        return;
      }
    }

    if (key === "toDate" && value && filters.fromDate) {
      const fromDate = dayjs(filters.fromDate);
      const toDate = dayjs(value);
      if (toDate.isBefore(fromDate)) {
        toast.error("To date cannot be before From date");
        return;
      }
    }

    const normalizedValue = value === "All Status" || value === "" ? undefined : value;
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: normalizedValue,
    }));
  };

  // --- EFFECTS ---
  useEffect(() => {
    if (deleteSuccess) {
      toast.success("Timesheet deleted successfully");
      setShowDeleteModal(false);
      setTimesheetToDelete(null);
    }
  }, [deleteSuccess]);

  useEffect(() => {
    if (deleteError) {
      toast.error("Failed to delete timesheet");
    }
  }, [deleteError]);

  useEffect(() => {
    if (submitSuccess) {
      toast.success("Timesheet submitted for approval");
    }
  }, [submitSuccess]);

  useEffect(() => {
    if (submitError) {
      toast.error("Failed to submit timesheet");
    }
  }, [submitError]);

  const handleEdit = (timesheet: TimesheetEntry) => {
    setEditingTimesheet(timesheet);
    setShowAddModal(true);
  };

  const handleView = (timesheet: TimesheetEntry) => {
    setViewingTimesheet(timesheet);
    setShowViewModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setTimesheetToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (!timesheetToDelete) return;
    deleteTimesheet(timesheetToDelete);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setTimesheetToDelete(null);
  };

  const handleSubmit = (id: string) => {
    submitTimesheet(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).tz(userTimezone).format("DD/MM/YYYY");
  };

  const formatTime = (timeString: string) => {
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    return dayjs(timeString).format("HH:mm");
  };

  const statCards = Array.from({ length: 4 });

  // --- COLUMN CONFIGURATION ---
  const columns: TableColumn<TimesheetEntry>[] = useMemo(() => [
    {
      key: "date",
      title: "DATE",
      label: "Date",
      required: true,
      render: (_: any, r: TimesheetEntry) => (
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm text-slate-900">{formatDate(r.date)}</span>
        </div>
      ),
    },
    {
      key: "tasks",
      title: "TASKS",
      label: "Tasks",
      render: (_: any, r: TimesheetEntry) => (
        <div className="space-y-1">
          {r.tasks.length > 0 ? (
            <div>
              <div className="font-bold text-slate-900">
                {capitalizeWords(r.tasks[0].name)}
              </div>
              <div className="text-sm text-slate-500">
                {formatTime(r.tasks[0].startTime)} -{" "}
                {formatTime(r.tasks[0].endTime)} (
                {convertToHourMinute(r.tasks[0]?.hours || 0)} hr)
              </div>
              {r.tasks.length > 1 && (
                <div className="mt-1 text-xs text-slate-500">
                  +{r.tasks.length - 1} more
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-slate-500">No tasks</span>
          )}
        </div>
      ),
    },
    {
      key: "hours",
      title: "HOURS",
      label: "Hours",
      render: (_: any, r: TimesheetEntry) => (
        <div>
          <div className="font-bold text-slate-900">
            {convertToHourMinute(r?.totalHours || 0)} hr
          </div>
          <div className="text-sm text-slate-500">
            {r.tasks.length} task{r.tasks.length !== 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "STATUS",
      label: "Status",
      render: (_: any, r: TimesheetEntry) => (
        <Badge
          variant={getTimesheetStatusVariant(r.status)}
          size="middle"
          icon={
            isApprovedWorkflowStatus(r.status) ? (
              <CheckCircle className="w-3 h-3" />
            ) : isRejectedWorkflowStatus(r.status) ? (
              <Trash2 className="w-3 h-3" />
            ) : (
              <Clock className="w-3 h-3" />
            )
          }
        >
          {r.statusLabel ||
            getWorkflowStatusFallbackLabel(
              r.status,
              r.currentApproverName
            )}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "ACTIONS",
      label: "Actions",
      required: true,
      render: (_: any, r: TimesheetEntry) => (
        <div className="flex items-center gap-2">
          {r.status !== "draft" && (
            <SimpleTooltip
              label="View"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-md border-0"
            >
              <button
                onClick={() => handleView(r)}
                aria-label="View"
                className="text-primary-600 hover:text-primary-800 transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          )}

          {r.status === "draft" && canManage && (
            <>
              <SimpleTooltip
                label="Edit"
                side="top"
                className="inline-block"
                tooltipClassName="text-xs shadow-md border-0"
              >
                <button
                  onClick={() => handleEdit(r)}
                  aria-label="Edit"
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <SquarePen className="w-4 h-4" />
                </button>
              </SimpleTooltip>

              <SimpleTooltip
                label="Submit"
                side="top"
                className="inline-block"
                tooltipClassName="text-xs shadow-md border-0"
              >
                <button
                  onClick={() => handleSubmit(r.id)}
                  aria-label="Submit"
                  className="text-green-600 hover:text-green-800 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </SimpleTooltip>

              <SimpleTooltip
                label="Delete"
                side="top"
                className="inline-block"
                tooltipClassName="text-xs shadow-md border-0"
              >
                <button
                  onClick={() => handleDeleteClick(r.id)}
                  aria-label="Delete"
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            </>
          )}
        </div>
      ),
    },
  ], [userTimezone, canManage]); // Dependencies for useMemo

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-0">
            My Timesheets
          </h1>
        </div>
        {canManage && (
          <div className="md:self-center">
            <Button
              onClick={() => setShowAddModal(true)}
              appearance="primary"
              size="middle"
            >
              <Plus className="w-4 h-4 flex-shrink-0" />
              <span>Add Timesheet</span>
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          statCards.map((_, index) => <StatCardSkeleton key={index} />)
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Total Hours
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-0 ">
                    {convertToHourMinute(stats?.totalHours || 0)}hr
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Approved Hours
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-0">
                    {convertToHourMinute(stats?.approvedHours || 0)}hr
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    This Month
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-0">
                    {convertToHourMinute(stats?.thisMonthHours || 0)}hr
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-soft border border-slate-200">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600 mb-2">Entries</p>
                  <p className="text-2xl font-bold text-slate-900 mb-0">
                    {stats?.totalEntries || 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters */}
      <FilterWrapper>
        <TimesheetFiltersBar
          setFilters={setFilters}
          setCurrentPage={setCurrentPage}
          value={filters}
          users={[]}
          onChange={handleFilterChange}
          showStatus={true}
          showUser={false}
          showDepartment={false}
          showDateRange={true}
          showSearch={true}
        />
      </FilterWrapper>

      {/* Timesheet Table - Using Generic Component */}
      <div className="bg-white rounded-lg shadow-soft border border-slate-200 overflow-hidden">
        {loading ? (
          <TimesheetTableSkeleton rows={5} />
        ) : (
          <>
            <ConfigurableTable
              columns={columns}
              data={timesheets}
              loading={loading}
              emptyMessage="No timesheets found"
              rowKey="id"
              configOptions={{ persistenceKey: "my-timesheets-table" }}
              renderColumnSelector={(selector) => (
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Timesheet Entries</h3>
                  <div className="flex items-center gap-2">{selector}</div>
                </div>
              )}
            />

            {/* Pagination - always visible */}
            <div className="border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[5, 10, 20, 50]}
                className="border-0 shadow-none"
              />
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Timesheet Modal */}
      {showAddModal && (
        <AddTimesheetModal
          editingTimesheet={editingTimesheet}
          onClose={() => {
            setShowAddModal(false);
            setEditingTimesheet(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingTimesheet(null);
          }}
        />
      )}

      {/* View Timesheet Modal */}
      {showViewModal && viewingTimesheet && (
        <TimesheetViewModal
          timesheet={viewingTimesheet}
          onClose={() => {
            setShowViewModal(false);
            setViewingTimesheet(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyTimesheets;