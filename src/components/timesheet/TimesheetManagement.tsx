import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Trash2,
  Users,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { MasterConfigCategory } from "../../constants";
import {
  useGetTimesheetsQuery,
  useActOnTimesheetMutation,
} from "../../store/apis/timesheet.api";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import type { ApiError } from "../../store/utils/apiError";

import { TimesheetEntry } from "../../types/timesheet";
import { TimesheetQueryStatus } from "../../types/timesheet.api.types";
import { DEBOUNCE_DELAYS, useDebounce } from "../../utils/debounce";
import { Pagination, SimpleTooltip, ConfigurableTable } from "../common";
import FilterWrapper from "../common/FilterWrapper";
import type { TableColumn } from "../common/Table";
import TimesheetFiltersBar from "./TimesheetFiltersBar";
import TimesheetViewModal from "./TimesheetViewModal";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { useAuth } from "../../store/hooks/useAuth";
import {
  RoleTypeEnum,
  getWorkflowStatusFallbackLabel,
  isPendingWorkflowStatus,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
  TIMESHEET_STATUS,
  VIEW_MODE,
  ViewMode,
  FILTER_ALL,
} from "../../utils/constants";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { TimesheetManagementSkeleton } from "./Skeleton";
import RejectionModal from "../leave/modals/RejectionModal";
import Badge from "../common/Badge";
import { getTimesheetStatusVariant, getWorkflowStatusVariant } from "../../utils/badgeVariants";
import { convertToHourMinute } from "../../utils/convertToHourMinute";
import { capitalizeWords } from "../../utils/nameUtils";
import { getWorkflowStatusIcon } from "../attendance/regularization-management/tableColumns";

dayjs.extend(utc);
dayjs.extend(timezone);

const TimesheetManagement: React.FC = () => {
  const userTimezone = dayjs.tz.guess();
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin =
    user?.role?.toLowerCase() === RoleTypeEnum.ADMIN?.toLowerCase() ||
    user?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase();

  const { data: usersData = [] } = useGetUsersForFilterQuery({
    reporteesOnly: !isAdmin, // admins see all, others see reportees
  });

  // Simplified permission checks - backend handles all role-based filtering

  const canActOnApprovals = useHasPermission(
    PERMISSIONS.TIMESHEET_MANAGEMENT_MANAGE,
  );

  const [activeAccordion, setActiveAccordion] = useState<"pending" | "history">(
    "pending",
  );

  const [pendingViewMode, setPendingViewMode] = useState<ViewMode>(
    VIEW_MODE.ALL,
  );
  const [historyViewMode, setHistoryViewMode] = useState<ViewMode>(
    VIEW_MODE.ALL,
  );

  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  interface TimesheetFilters {
    search?: string;
    userId?: string;
    department?: string;
    fromDate?: string;
    toDate?: string;
  }

  const [pendingFilters, setPendingFilters] = useState<TimesheetFilters>({});
  const [pendingSearchInput, setPendingSearchInput] = useState("");
  const debouncedPendingSearch = useDebounce(
    pendingSearchInput,
    DEBOUNCE_DELAYS.SEARCH,
  );

  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);
  const [historyFilters, setHistoryFilters] = useState<TimesheetFilters>({});
  const [historySearchInput, setHistorySearchInput] = useState("");
  const debouncedHistorySearch = useDebounce(
    historySearchInput,
    DEBOUNCE_DELAYS.SEARCH,
  );

  const [viewTimesheet, setViewTimesheet] = useState<TimesheetEntry | null>(
    null,
  );

  // Slots for portaling each table's "Columns" selector into its accordion header row.
  // Callback refs as state ensure the portal re-renders once the slot DOM node mounts.
  const [pendingColumnsSlot, setPendingColumnsSlot] =
    useState<HTMLDivElement | null>(null);
  const [historyColumnsSlot, setHistoryColumnsSlot] =
    useState<HTMLDivElement | null>(null);

  // Rejection modal state
  const [selectedTimesheet, setSelectedTimesheet] = useState<string | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: departmentList = [] } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.DEPARTMENT,
  );

  const departmentOptions: { label: string; value: string }[] = useMemo(
    () =>
      departmentList.map((d) => ({
        label: d.displayName,
        value: d.id,
      })),
    [departmentList],
  );

  /* =====================
   PENDING QUERY
===================== */

  const {
    data: pendingRes,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
  } = useGetTimesheetsQuery({
    search: debouncedPendingSearch || undefined,
    page: pendingPage,
    limit: pendingLimit,
    status: TimesheetQueryStatus.PENDING,
    userId: pendingFilters.userId,
    department: pendingFilters.department,
    startDate: pendingFilters.fromDate,
    endDate: pendingFilters.toDate,

    ...(isAdmin &&
      pendingViewMode === VIEW_MODE.REPORTEES &&
      !pendingFilters.userId && {
      reporteesOnly: true,
    }),
  });

  const [
    actOnTimesheet,
    {
      isLoading: actionLoading,
      isSuccess: actionSuccess,
      isError: actionError,
      error: actionErrorData,
    },
  ] = useActOnTimesheetMutation();

  /* =====================
   HISTORY QUERY
===================== */

  const {
    data: historyRes,
    isLoading: historyLoading,
    isFetching: historyFetching,
  } = useGetTimesheetsQuery({
    search: debouncedHistorySearch || undefined,
    page: historyPage,
    limit: historyLimit,
    status: TimesheetQueryStatus.HISTORY,
    userId: historyFilters.userId,
    department: historyFilters.department,
    startDate: historyFilters.fromDate,
    endDate: historyFilters.toDate,
    ...(isAdmin &&
      historyViewMode === VIEW_MODE.REPORTEES &&
      !historyFilters.userId && {
      reporteesOnly: true,
    }),
  });

  const pendingTimesheets = pendingRes?.data ?? [];

  const pendingTotal = pendingRes?.total ?? 0;

  const historyTimesheets = historyRes?.data ?? [];
  const historyTotal = historyRes?.total ?? 0;

  const currentUserId = user?.id;
  useEffect(() => {
    if (actionSuccess) {
      toast.success("Timesheet updated successfully");
    }
    if (actionError) {
      const err = actionErrorData as ApiError & {
        data?: { error?: string | string[] }
      };
      const rawMessage =
        err?.data?.message ||
        err?.data?.error ||
        err?.message ||
        "Something went wrong";

      const message = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;

      toast.error(message);
    }
  }, [actionSuccess, actionError, actionErrorData]);
  // Check if user can act on a timesheet
  // Backend handles filtering - if user can see a pending timesheet, they can act on it
  const canActOnTimesheet = useCallback(
    (timesheet: TimesheetEntry): boolean => {
      if (!canActOnApprovals) {
        return false;
      }
      if (timesheet.status === TIMESHEET_STATUS.DRAFT) {
        return false;
      }

      if (isAdmin) {
        return true;
      }

      if (!timesheet.currentActorIds || !currentUserId) {
        return false;
      }

      return timesheet.currentActorIds.includes(currentUserId);
    },
    [canActOnApprovals, isAdmin, currentUserId],
  );

  // Handle approve
  const handleApprove = (timesheetId: string) => {
    actOnTimesheet({
      id: timesheetId,
      body: { decision: "approved" },
    });
  };

  // Handle reject
  const handleReject = (timesheetId: string) => {
    if (!canActOnApprovals) {
      toast.error("You do not have permission to reject timesheets.");
      return;
    }
    setSelectedTimesheet(timesheetId);
    setShowRejectModal(true);
  };

  // Confirm reject
  const confirmReject = () => {
    if (!selectedTimesheet || !rejectionReason.trim()) return;

    actOnTimesheet({
      id: selectedTimesheet,
      body: {
        decision: "rejected",
        remarks: rejectionReason,
      },
    });

    setShowRejectModal(false);
    setRejectionReason("");
    setSelectedTimesheet(null);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return dayjs(dateString).tz(userTimezone).format("DD/MM/YYYY");
  };

  // Get status badge
  const getStatusBadge = (timesheet: TimesheetEntry) => {
    const status = timesheet.status;

    const isWorkflowStatus =
      isPendingWorkflowStatus(status) ||
      status?.startsWith("pending_") ||
      status?.startsWith("approved_") ||
      status?.startsWith("rejected_");

    const label = isWorkflowStatus
      ? timesheet.statusLabel ||
      getWorkflowStatusFallbackLabel(status, timesheet.currentApproverName)
      : status.charAt(0).toUpperCase() + status.slice(1);

    let Icon = Clock;
    if (isApprovedWorkflowStatus(status)) Icon = CheckCircle;
    if (isRejectedWorkflowStatus(status)) Icon = Trash2;
    return (
      <Badge
        variant={getTimesheetStatusVariant(status)}
        size="middle"
        icon={<Icon className="w-3 h-3" />}
      >
        {label}
      </Badge>
    );
  };

  // Pending columns
  const pendingColumns: TableColumn<TimesheetEntry>[] = [
    {
      key: "date",
      title: "Date",
      label: "Date",
      required: true,
      render: (_v, record) => (
        <div className="flex items-center gap-1 md:gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs md:text-sm text-slate-900">
            {formatDate(record.date)}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      title: "Employee",
      label: "Employee Name",
      required: true,
      render: (_v, record) => (
        <div>
          <div className="text-xs font-semibold md:text-sm font-bold text-slate-900">
            {capitalizeWords(record.fullName)}
          </div>
          <div className=" text-xs font-semibold md:text-sm text-slate-500">
            {record.workEmail}
          </div>
        </div>
      ),
    },
    {
      key: "tasks",
      title: "Tasks",
      label: "Task Details",
      render: (_v, record) => (
        <div className="space-y-2">
          {record.tasks.length > 0 ? (
            <div>
              <div className="text-xs md:text-sm font-bold text-slate-900">
                {record.tasks[0].name}
              </div>
              <div className="text-xs md:text-sm text-slate-500">
                {dayjs(record.tasks[0].startTime)
                  .tz(userTimezone)
                  .format("HH:mm")}{" "}
                -{" "}
                {dayjs(record.tasks[0].endTime)
                  .tz(userTimezone)
                  .format("HH:mm")}
              </div>
              {record.tasks.length > 1 && (
                <div className="mt-1 text-xs text-slate-500">
                  +{record.tasks.length - 1} more
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
      title: "Hours",
      label: "Work Hours",
      render: (_v, record) => (
        <div>
          <div className="text-xs md:text-sm font-bold text-slate-900">
            {convertToHourMinute(record?.totalHours || 0)}hr
          </div>
          <div className="text-xs md:text-sm text-slate-500">
            {record.tasks.length} task{record.tasks.length !== 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_v, record) => getStatusBadge(record),
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_v, record) => (
        <div className="flex items-center gap-2">
          <SimpleTooltip
            label="View"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-md border-0"
          >
            <button
              onClick={() => setViewTimesheet(record)}
              aria-label="View"
              className="text-primary-600 hover:text-primary-800 transition-colors"
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
            </button>
          </SimpleTooltip>

          {canActOnTimesheet(record) && canActOnApprovals && (
            <>
              <SimpleTooltip
                label="Approve"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-md border-0"
              >
                <button
                  onClick={() => handleApprove(record.id)}
                  disabled={actionLoading}
                  aria-label="Approve"
                  className={`transition-colors text-green-600 hover:text-green-800 ${actionLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              </SimpleTooltip>

              <SimpleTooltip
                label="Reject"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-md border-0"
              >
                <button
                  onClick={() => handleReject(record.id)}
                  disabled={actionLoading}
                  aria-label="Reject"
                  className={`transition-colors text-red-600 hover:text-red-800 ${actionLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  // History columns
  const historyColumns: TableColumn<TimesheetEntry>[] = [
    {
      key: "date",
      title: "Date",
      label: "Date",
      required: true,
      render: (_v, record) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-900">
            {formatDate(record.date)}
          </span>
        </div>
      ),
    },
    {
      key: "user",
      title: "Employee",
      label: "Employee",
      required: true,
      render: (_v, record) => (
        <div>
          <div className="font-bold text-slate-900">{record.fullName}</div>
          <div className="text-sm text-slate-500">{record.workEmail}</div>
        </div>
      ),
    },
    {
      key: "tasks",
      title: "Tasks",
      label: "Tasks",
      render: (_v, record) => (
        <div className="space-y-1">
          {record.tasks.length > 0 ? (
            <div>
              <div className="font-bold text-slate-900">
                {record.tasks[0].name}
              </div>
              <div className="text-sm text-slate-500">
                {dayjs(record?.tasks?.[0]?.startTime)
                  .tz(userTimezone)
                  .format("HH:mm")}{" "}
                -{" "}
                {dayjs(record?.tasks?.[0]?.endTime)
                  .tz(userTimezone)
                  .format("HH:mm")}{" "}
                ({convertToHourMinute(record?.tasks?.[0]?.hours || 0)} hr)
              </div>
              {record.tasks.length > 1 && (
                <div className="mt-1 text-xs text-slate-500">
                  +{record.tasks.length - 1} more
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
      title: "Hours",
      label: "Hours",
      render: (_v, record) => (
        <div>
          <div className="font-bold text-slate-900">
            {convertToHourMinute(record?.totalHours || 0)}hr
          </div>
          <div className="text-sm text-slate-500">
            {record.tasks.length} task{record.tasks.length !== 1 ? "s" : ""}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_v, record) => {
        const label =
          record.statusLabel ||
          getWorkflowStatusFallbackLabel(
            record.status,
            record.currentActorName
          );
        const StatusIcon = getWorkflowStatusIcon(record.status);

        return (
          <Badge
            variant={getWorkflowStatusVariant(record.status)}
            size="middle"
          >
            <StatusIcon className="w-4 h-4" />
            {label}
          </Badge>
        )
      },
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_v, record) => (
        <SimpleTooltip
          label="View"
          side="top"
          className="inline-block"
          tooltipClassName=" text-xs shadow-md border-0"
        >
          <button
            onClick={() => setViewTimesheet(record)}
            aria-label="View"
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Eye className="w-4 h-4 text-primary-600" aria-hidden="true" />
          </button>
        </SimpleTooltip>
      ),
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Timesheet Management
        </h1>
      </div>

      {/* Pending Timesheets Accordion */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        {/*
          Header is a flex row instead of a single <button> so the "Columns"
          dropdown (rendered via portal into pendingColumnsSlot) can sit on
          the same line as the title without nesting interactive elements.
        */}
        <div className="w-full px-4 py-3 border-b flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex-1 text-left text-xl font-bold text-slate-900"
            onClick={() =>
              setActiveAccordion(
                activeAccordion === "pending" ? "history" : "pending",
              )
            }
            aria-expanded={activeAccordion === "pending"}
          >
            Timesheet Approval ({pendingTotal})
          </button>
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/*
              z-30 keeps the portaled ColumnSelector dropdown beneath the
              app navbar (z-40) while remaining above page/table content.
            */}
            <div ref={setPendingColumnsSlot} className="relative z-30" />
            <button
              type="button"
              className="p-1 -mr-1 text-slate-700"
              onClick={() =>
                setActiveAccordion(
                  activeAccordion === "pending" ? "history" : "pending",
                )
              }
              aria-label={
                activeAccordion === "pending"
                  ? "Collapse timesheet approval"
                  : "Expand timesheet approval"
              }
            >
              {activeAccordion === "pending" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {activeAccordion === "pending" && (
          <div className="px-6 py-4">
            <ConfigurableTable
              columns={pendingColumns}
              data={pendingTimesheets}
              loading={pendingLoading || pendingFetching || actionLoading}
              skeleton={<TimesheetManagementSkeleton hasActions={canActOnApprovals} />}
              emptyMessage="No pending timesheets found"
              rowKey={(t) => t.id}
              maxHeight="90vh"
              configOptions={{ persistenceKey: "timesheet-pending-table" }}
              renderColumnSelector={(selector) => (
                <>
                  {/* Teleport the Columns dropdown into the accordion header row */}
                  {pendingColumnsSlot &&
                    createPortal(selector, pendingColumnsSlot)}

                  {/* View Mode Tabs - Only visible for admins */}
                  {isAdmin && (
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex border-b border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setPendingViewMode(VIEW_MODE.ALL);
                            setPendingPage(1);
                          }}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pendingViewMode === VIEW_MODE.ALL
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            All Employees
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPendingViewMode(VIEW_MODE.REPORTEES);
                            setPendingPage(1);
                          }}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pendingViewMode === VIEW_MODE.REPORTEES
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            My Reportees
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <FilterWrapper>
                    <TimesheetFiltersBar
                      setCurrentPage={setPendingPage}
                      setFilters={setPendingFilters}
                      value={{
                        search: pendingSearchInput,
                        department: pendingFilters.department,
                        userId: pendingFilters.userId,
                        fromDate: pendingFilters.fromDate,
                        toDate: pendingFilters.toDate,
                      }}
                      users={usersData}
                      departments={departmentOptions}
                      showStatus={false}
                      showUser={!(isAdmin && pendingViewMode === VIEW_MODE.REPORTEES)}
                      showDepartment={true}
                      onChange={(key, val) => {
                        if (key === "search") {
                          setPendingSearchInput(val);
                          setPendingPage(1);
                          return;
                        }
                        const v =
                          val === FILTER_ALL.EMPLOYEES ||
                            val === FILTER_ALL.DEPARTMENTS ||
                            val === ""
                            ? undefined
                            : val;
                        setPendingFilters((prev) => ({ ...prev, [key]: v }));
                        setPendingPage(1);
                      }}
                    />
                  </FilterWrapper>
                </>
              )}
            />

            <div className="mt-4">
              <Pagination
                currentPage={pendingPage}
                totalItems={pendingTotal}
                itemsPerPage={pendingLimit}
                onPageChange={(p) => setPendingPage(p)}
                onItemsPerPageChange={(l) => {
                  setPendingLimit(l);
                  setPendingPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* History Accordion */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-6">
        <div className="w-full p-4 border-b flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex-1 text-left text-xl font-bold text-slate-900"
            onClick={() =>
              setActiveAccordion(
                activeAccordion === "history" ? "pending" : "history",
              )
            }
            aria-expanded={activeAccordion === "history"}
          >
            Approval History ({historyTotal})
          </button>
          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={setHistoryColumnsSlot} className="relative z-30" />
            <button
              type="button"
              className="p-1 -mr-1 text-slate-700"
              onClick={() =>
                setActiveAccordion(
                  activeAccordion === "history" ? "pending" : "history",
                )
              }
              aria-label={
                activeAccordion === "history"
                  ? "Collapse approval history"
                  : "Expand approval history"
              }
            >
              {activeAccordion === "history" ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {activeAccordion === "history" && (
          <div className="px-6 py-4">
            <ConfigurableTable
              columns={historyColumns}
              data={historyTimesheets}
              loading={historyLoading || historyFetching}
              emptyMessage="No historical timesheets found"
              rowKey={(t) => t.id}
              maxHeight="90vh"
              configOptions={{ persistenceKey: "timesheet-history-table" }}
              renderColumnSelector={(selector) => (
                <>
                  {/* Teleport the Columns dropdown into the accordion header row */}
                  {historyColumnsSlot &&
                    createPortal(selector, historyColumnsSlot)}

                  {/* View Mode Tabs - Only visible for admins */}
                  {isAdmin && (
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex border-b border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryViewMode(VIEW_MODE.ALL);
                            setHistoryPage(1);
                          }}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyViewMode === VIEW_MODE.ALL
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            All Employees
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryViewMode(VIEW_MODE.REPORTEES);
                            setHistoryPage(1);
                          }}
                          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyViewMode === VIEW_MODE.REPORTEES
                            ? "border-primary-600 text-primary-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            My Reportees
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <FilterWrapper>
                    <TimesheetFiltersBar
                      setCurrentPage={setHistoryPage}
                      setFilters={setHistoryFilters}
                      value={{
                        search: historySearchInput,
                        department: historyFilters.department,
                        userId: historyFilters.userId,
                        fromDate: historyFilters.fromDate,
                        toDate: historyFilters.toDate,
                      }}
                      users={usersData}
                      departments={departmentOptions}
                      showStatus={true}
                      showUser={!(isAdmin && historyViewMode === VIEW_MODE.REPORTEES)}
                      showDepartment={true}
                      onChange={(key, val) => {
                        if (key === "search") {
                          setHistorySearchInput(val);
                          setHistoryPage(1);
                          return;
                        }
                        const v =
                          val === FILTER_ALL.EMPLOYEES ||
                            val === FILTER_ALL.DEPARTMENTS ||
                            val === ""
                            ? undefined
                            : val;
                        setHistoryFilters((prev) => ({ ...prev, [key]: v }));
                        setHistoryPage(1);
                      }}
                    />
                  </FilterWrapper>
                </>
              )}
            />

            <div className="mt-4">
              <Pagination
                currentPage={historyPage}
                totalItems={historyTotal}
                itemsPerPage={historyLimit}
                onPageChange={(p) => setHistoryPage(p)}
                onItemsPerPageChange={(l) => {
                  setHistoryLimit(l);
                  setHistoryPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <RejectionModal
          rejectionReason={rejectionReason}
          selectedLeave={selectedTimesheet}
          confirmReject={confirmReject}
          processing={actionLoading}
          setRejectionReason={setRejectionReason}
          setSelectedLeave={setSelectedTimesheet}
          setShowRejectModal={setShowRejectModal}
          title="Reject Timesheet"
          description="Please provide a reason for rejecting this timesheet entry."
        />
      )}

      {/* View Modal */}
      <TimesheetViewModal
        timesheet={viewTimesheet}
        onClose={() => setViewTimesheet(null)}
      />
    </div>
  );
};

export default TimesheetManagement;
