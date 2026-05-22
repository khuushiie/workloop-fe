import React, { useState, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  MinusCircle,
  Users,
  CircleAlert,
} from "lucide-react";

import * as XLSX from "xlsx";

import { apiAxios } from "../../services/api";
import {
  IAttendanceRegularization,
  RegularizationType,
  IRegularizationFilters,
  ALL_REGULARIZATION_STATUSES,
} from "../../types/regularization.types";
import {
  getWorkflowStatusFallbackLabel,
  isApprovedWorkflowStatus,
  WorkflowStatusCode,
  WORKFLOW_PENDING_STATUSES,
  WORKFLOW_APPROVED_STATUSES,
  WORKFLOW_REJECTED_STATUSES,
  WORKFLOW_CANCELLED_STATUSES,
} from "../../utils/constants";
import FilterWrapper from "../common/FilterWrapper";
import { Button, DatePicker, Pagination, Select, SimpleTooltip } from "../common";
import { useTimezone } from "../../hooks/useTimezone";
import { RegularizationTableSkeleton } from "../attendance/Skeleton";
import Badge from "../common/Badge";
import { getWorkflowStatusVariant } from "../../utils/badgeVariants";
import ExcelIcon from "../../icons/ExcelIcon";
import { ConfigurableTable } from "../common";
import { TableColumn } from "../common/Table";
import {
  useGetRegularizationReportQuery,
  useGetRegularizationStatsQuery,
  IRegularizationReportFilters,
} from "../../store/apis/attendanceRegularization.api";

/** Unwrap list from master-config/filters API response (array or { data, pagination }) */
function getListFromFiltersResponse(response: unknown): unknown[] {
  if (!response || typeof response !== "object") return [];
  const r = response as Record<string, unknown>;
  if (r.pagination && Array.isArray(r.data)) return r.data;
  if (Array.isArray(response)) return response;
  return [];
}

function formatStatusLabel(str: string): string {
  const withSpaces = str.replace(/_/g, " ");
  return withSpaces.length > 0 ? withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1) : withSpaces;
}

const RegularizationReport: React.FC = () => {
  const { formatDate, formatTime } = useTimezone();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  type DepartmentOption = { label: string; value: string };
  const [departmentOptions, setDepartmentOptions] = useState<DepartmentOption[]>([]);
  type RegularizationOption = { label: string; value: string };
  const [regularizationType, setRegularizationType] =
    useState<RegularizationOption[]>();

  // Dynamically loaded Regularization Status options (with fallback)
  const DEFAULT_STATUS_OPTIONS: { value: WorkflowStatusCode; label: string }[] =
    ALL_REGULARIZATION_STATUSES.map((status) => ({
      value: status,
      label: getWorkflowStatusFallbackLabel(status),
    }));
  const [statusOptions, setStatusOptions] = useState(DEFAULT_STATUS_OPTIONS);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
  const currentYear = currentDate.getFullYear().toString();
  const [filters, setFilters] = useState<IRegularizationFilters>({
    status: undefined,
    regularizationType: undefined,
    department: "",
    month: currentMonth, // Pre-select current month
    year: currentYear, // Pre-select current year
  });

  // Build report query params
  const reportQueryParams = useMemo<IRegularizationReportFilters>(() => ({
    userId: filters.userId,
    department: filters.department || undefined,
    status: filters.status || undefined,
    regularizationType: filters.regularizationType || undefined,
    startDate: filters.startDate,
    endDate: filters.endDate,
    month: filters.month,
    year: filters.year,
    page: currentPage,
    limit: itemsPerPage,
  }), [filters, currentPage, itemsPerPage]);

  // Fetch stats (once, no filters)
  const { 
    data: statsData, 
    isLoading: statsLoading
  } = useGetRegularizationStatsQuery();

  // Fetch report (with filters and pagination)
  const { 
    data: reportData, 
    isLoading: reportLoading, 
    error: reportError,
    isFetching: reportFetching
  } = useGetRegularizationReportQuery(reportQueryParams);

  // Map RTK Query IRegularizationRequest to IAttendanceRegularization
  const mapRequestToAttendanceRegularization = (req: any): IAttendanceRegularization => ({
    _id: req.id,
    userId: req.userId || '',
    fullName: req.fullName || '',
    employeeId: req.employeeId || '',
    departmentName: req.departmentName || '',
    date: req.date || '',
    regularizationType: req.regularizationTypeName || '',
    requestedCheckInTime: req.requestedCheckInTime || '',
    requestedCheckOutTime: req.requestedCheckOutTime || '',
    actualCheckInTime: req.actualCheckInTime,
    actualCheckOutTime: req.actualCheckOutTime,
    reason: req.reason || '',
    status: req.status,
    statusLabel: req.statusLabel,
    approvedByName: req.approvedByName,
    rejectionReason: req.rejectionReason,
    appliedDate: req.appliedDate || '',
    attendanceUpdated: req.attendanceUpdated || false,
    createdAt: req.createdAt,
    updatedAt: req.updatedAt,
  });

  // Derive state from RTK Query
  const stats = statsData || { total: 0, pending: 0, approved: 0, rejected: 0, approvalRate: '0.00%' };
  const requests = (reportData?.requests || []).map(mapRequestToAttendanceRegularization);
  const totalItems = reportData?.pagination?.total || 0;
  const loading = statsLoading || reportLoading;
  const tableLoading = reportFetching;
  const error = reportError ? (reportError as any)?.data?.message || 'Failed to load report' : '';

  // Load filters (departments, statuses) once on mount. Departments use id as value for v2 API.
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const response = await apiAxios.get(
          "/v2/master-config/by-category/department"
        );
        const list = getListFromFiltersResponse(response);
        const options: DepartmentOption[] = (Array.isArray(list) ? list : [])
          .map((f: any) => {
            const id = f?._id ?? f?.id ?? f?.filterCode ?? f?.value ?? "";
            const label =
              f?.displayName ?? f?.name ?? f?.label ?? (typeof id === "string" ? id : "");
            return { value: String(id).trim(), label: String(label || id).trim() };
          })
          .filter((o) => o.value && o.label);
        const seen = new Set<string>();
        const unique = options.filter((o) => {
          if (seen.has(o.value)) return false;
          seen.add(o.value);
          return true;
        });
        setDepartmentOptions(unique);
      } catch (err) {
        console.error("Failed to fetch departments:", err);
        setDepartmentOptions([]);
      }
    };

    const loadStatuses = async () => {
      try {
        const response = await apiAxios.get(
          "/v2/master-config/by-category/regularization_status"
        );
        const list = getListFromFiltersResponse(response);
        const allowed = new Set<WorkflowStatusCode>([
          ...WORKFLOW_PENDING_STATUSES,
          ...WORKFLOW_APPROVED_STATUSES,
          ...WORKFLOW_REJECTED_STATUSES,
          ...WORKFLOW_CANCELLED_STATUSES,
        ]);

        const mapItemToStatusOption = (f: Record<string, unknown>) => {
          const codeRaw =
            f?.filterCode ??
            f?.value ??
            f?.name ??
            (typeof f === "string" ? f : undefined);
          const code =
            typeof codeRaw === "string" ? codeRaw.trim().toLowerCase() : "";
          const labelSource = (f?.displayName ?? f?.label ?? code) as string;
          const label = typeof labelSource === "string" ? labelSource : String(labelSource ?? "");
          const normalizedLabel = label?.length ? label : code;
          return {
            value: code as WorkflowStatusCode,
            label: formatStatusLabel(normalizedLabel),
          };
        };
        const mapped = (Array.isArray(list) ? list : [])
          .map((f: unknown) => mapItemToStatusOption(f as Record<string, unknown>))
          .filter((opt: { value: WorkflowStatusCode; label: string }) =>
            allowed.has(opt.value)
          );

        setStatusOptions(mapped.length ? mapped : DEFAULT_STATUS_OPTIONS);
      } catch (err) {
        console.error("Failed to fetch regularization status options:", err);
        setStatusOptions(DEFAULT_STATUS_OPTIONS);
      }
    };

    loadDepartments();
    loadStatuses();
  }, []);

  useEffect(() => {
    const loadRegularizationType = async () => {
      try {
        const response = await apiAxios.get(
          "/v2/master-config/by-category/attendance_regularization_reason"
        );

        const list = getListFromFiltersResponse(response);

        const toLabel = (raw: unknown): string => {
          if (typeof raw === "string") return raw.trim();
          if (raw === null || raw === undefined) return "";
          if (typeof raw === "object") return "";
          if (typeof raw === "number" || typeof raw === "boolean") return String(raw);
          return "";
        };
        // Value must be master config document id (ObjectId string) for v2 API query
        const toIdValue = (rec: Record<string, unknown>): string => {
          const id = rec?.id ?? rec?._id;
          if (id != null) return typeof id === "string" ? id : String(id);
          const fallback = rec?.filterCode ?? rec?.code;
          return typeof fallback === "string" ? fallback : "";
        };
        const items = (Array.isArray(list) ? list : [])
          .map((f: unknown) => {
            const rec = f as Record<string, unknown>;
            const labelRaw =
              rec?.displayName ??
              rec?.name ??
              rec?.label ??
              rec?.value ??
              (typeof f === "string" ? f : "");
            return {
              label: toLabel(labelRaw),
              value: toIdValue(rec),
            };
          })
          .filter((item) => item.label && item.value);

        const uniqueMap = new Map<string, RegularizationOption>();
        items.forEach((item) => {
          if (!uniqueMap.has(item.value)) {
            uniqueMap.set(item.value, item);
          }
        });

        setRegularizationType(Array.from(uniqueMap.values()));
      } catch (err) {
        console.error("Error Fetching Regularization Type", err);
        setRegularizationType([]);
      }
    };

    loadRegularizationType();
  }, []);

  const getRegularizationTypeLabel = (type: RegularizationType) => {
    const labels = {
      [RegularizationType.FORGOT_CHECKIN]: "Forgot Check-in",
      [RegularizationType.LATE_CHECKIN]: "Late Check-in",
      [RegularizationType.FORGOT_CHECKOUT]: "Forgot Check-out",
      [RegularizationType.EARLY_CHECKOUT]: "Early Check-out",
      [RegularizationType.MISSED_BREAK]: "Missed Break",
      [RegularizationType.SYSTEM_ERROR]: "System Error",
      [RegularizationType.OTHER]: "Other",
    };
    return labels[type] || type;
  };

  // Note: formatDate and formatTime are now provided by useTimezone hook
  // They handle UTC to IST conversion automatically

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: undefined,
      regularizationType: undefined,
      department: "",
      month: currentMonth,
      year: currentYear,
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getWorkflowStatusIcon = (status?: string) => {
    if (!status) return MinusCircle; // default icon

    if (status.startsWith("pending")) {
      return Clock;
    }

    if (status.startsWith("approved")) {
      return CheckCircle;
    }

    if (status.startsWith("rejected")) {
      return XCircle;
    }

    if (status === "cancelled") {
      return AlertCircle;
    }

    return CircleAlert;
  };

  const handleExportXLSX = () => {
    try {
      const exportRows = requests.map((req) => {
        return {
          "Employee Name": req.fullName || "",
          "Employee ID": req.employeeId || "",
          Department: req.departmentName || "",
          Date: formatDate(req.date),
          Type: getRegularizationTypeLabel(req.regularizationType),
          "Requested Check-in": req.requestedCheckInTime
            ? formatTime(req.requestedCheckInTime)
            : "-",
          "Requested Check-out": req.requestedCheckOutTime
            ? formatTime(req.requestedCheckOutTime)
            : "-",
          Reason: req.reason || "",
          Status: getWorkflowStatusFallbackLabel(req.status),
          "Applied Date": formatDate(req.appliedDate),
          "Approved By": (req as any).approvedByName || "",
          "Rejection Reason": req.rejectionReason || "",
        };
      });

      if (!exportRows.length) return;

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Regularization Report"
      );

      const filename = `Regularization_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      XLSX.writeFile(workbook, filename);
    } catch (err) {
      console.error("Error exporting XLSX:", err);
    }
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const exportToCSV = () => {
    const headers = [
      "Employee Name",
      "Employee ID",
      "Department",
      "Date",
      "Type",
      "Requested Check-in",
      "Requested Check-out",
      "Reason",
      "Status",
      "Applied Date",
      "Approved By",
      "Rejection Reason",
    ];

    const csvData = requests.map((request) => [
      request.fullName,
      request.employeeId,
      request.departmentName,
      request.date,
      getRegularizationTypeLabel(request.regularizationType),
      request.requestedCheckInTime,
      request.requestedCheckOutTime,
      request.reason,
      request.status,
      request.appliedDate,
      (request as any).approvedByName || "",
      request.rejectionReason || "",
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `regularization-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo<TableColumn<IAttendanceRegularization>[]>(() => [
    {
      key: "employee",
      title: "Employee",
      label: "Employee",
      required: true,
      dataIndex: "fullName",
      width: "30%",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">
            {record.fullName} 
          </div>
          <div className="text-sm text-slate-500">
            {record.employeeId} • {record.departmentName}
          </div>
        </div>
      )
    },
    {
      key: "dateType",
      title: "Date & Type",
      dataIndex: "date",
      width: "20%",
      render: (_, record) => (
        <div>
          <div className="flex items-center text-sm font-medium text-slate-900">
            <Calendar className="w-4 h-4 mr-1 text-slate-400" />
            {formatDate(record.date)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {getRegularizationTypeLabel(record.regularizationType)}
          </div>
        </div>
      )
    },
    {
      key: "requestedTime",
      title: "Requested Time",
      width: "20%",
      render: (_, record) => (
        <div className="text-sm text-slate-900">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-slate-400" />
            {formatTime(record.requestedCheckInTime)} - {formatTime(record.requestedCheckOutTime)}
          </div>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      required: true,
      width: "15%",
      render: (_, record) => {
        const StatusIcon = getWorkflowStatusIcon(record.status);
        const approverName = (record as any).approvedByName as string | undefined;
        const shouldShowApprover = isApprovedWorkflowStatus(record.status) && !!approverName;
        
        return (
          <div>
            <Badge
              variant={getWorkflowStatusVariant(record.status)}
              size="middle"
            >
              <StatusIcon className="w-4 h-4" />
              {getWorkflowStatusFallbackLabel(record.status)}
            </Badge>
            {shouldShowApprover && (
              <div className="text-xs text-slate-500 mt-1">
                by {approverName}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: "appliedDate",
      title: "Applied Date",
      dataIndex: "appliedDate",
      width: "15%",
      render: (_, record) => (
        <span className="text-sm text-slate-500">
          {formatDate(record.appliedDate)}
        </span>
      )
    }
  ], [formatDate, formatTime]);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Regularization Report
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 my-1">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-slate-900 my-0">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 my-1">
                  Pending
                </p>
                <p className="text-2xl font-bold text-slate-900 my-0">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600 my-1">
                  Approved
                </p>
                <p className="text-2xl font-bold text-slate-900 my-0">
                  {stats.approved}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <FilterWrapper>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto] items-end p-2">
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
            <div>
              <label htmlFor="reg-report-status" className="block text-sm font-semibold text-slate-700 mb-1">
                Status
              </label>
              <Select
                id="reg-report-status"
                value={filters?.status ?? ""}
                onChange={(val) =>
                  handleFilterChange("status", val || undefined)
                }
                options={[
                  { value: "", label: "All Statuses" },
                  ...statusOptions.map((status) => ({
                    value: status.value,
                    label: status.label,
                  })),
                ]}
                searchable
              />
            </div>

            <div>
              <label htmlFor="reg-report-type" className="block text-sm font-semibold text-slate-700 mb-1">
                Type
              </label>
              <Select
                id="reg-report-type"
                className="w-full"
                value={filters?.regularizationType ?? ""}
                onChange={(value) =>
                  handleFilterChange(
                    "regularizationType",
                    (value as RegularizationType) || undefined
                  )
                }
                options={[
                  { value: "", label: "All Types" },
                  ...(regularizationType?.map((type) => ({
                    label: type?.label,
                    value: type?.value as RegularizationType,
                  })) ?? []),
                ]}
                searchable
              />
            </div>

            <div>
              <label htmlFor="reg-report-department" className="block text-sm font-semibold text-slate-700 mb-1">
                Department
              </label>
              <Select
                id="reg-report-department"
                className="w-full"
                value={filters?.department ?? ""}
                onChange={(val) =>
                  handleFilterChange("department", val || undefined)
                }
                options={[
                  { value: "", label: "All Departments" },
                  ...(departmentOptions ?? []).map((d) => ({
                    label: d.label,
                    value: d.value,
                  })),
                ]}
                searchable
              />
            </div>
            <div>
              <label htmlFor="reg-report-month-year" className="block text-sm font-semibold text-slate-700 mb-1">
                Month & Year
              </label>
              <DatePicker
                id="reg-report-month-year"
                picker="month"
                value={filters?.month ? dayjs(filters?.month) : undefined}
                onChange={(d: Dayjs | null) => {
                  const formattedMonth = d ? d.format("YYYY-MM") : "";
                  handleFilterChange("month", formattedMonth);

                  if (d) {
                    const yearPart = d.format("YYYY");
                    handleFilterChange("year", yearPart);
                  }
                }}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="flex justify-start mt-2 items-end gap-2">
              <Button
                onClick={clearFilters}
                appearance="secondary"
                size="large"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </FilterWrapper>

      <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-8 overflow-visible">
        <ConfigurableTable
          columns={columns}
          data={requests}
          loading={loading || tableLoading}
          skeleton={<RegularizationTableSkeleton />}
          emptyMessage="No regularization requests match the current filters"
          maxHeight="90vh"
          configOptions={{ persistenceKey: "regularization-report-table" }}
          renderColumnSelector={(selector) => (
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-3 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Regularization Request ({totalItems ?? 0}) 
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <SimpleTooltip label="Export to Excel" side="bottom">
                  <button 
                    onClick={handleExportXLSX}
                    className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Export to Excel"
                  >
                    <ExcelIcon />
                  </button>
                </SimpleTooltip>
                <div className="h-6 w-px bg-slate-200 mx-1" />
                {selector}
              </div>
            </div>
          )}
        />
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          itemsPerPageOptions={[5, 10, 20, 50, 100]}
          className="mt-6"
        />
      )}
    </div>
  );
};

export default RegularizationReport;
