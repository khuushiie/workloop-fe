import React, { useCallback, useMemo, useState } from "react";
import { AlertCircle, ListChecks } from "lucide-react";
import {
  useGetLeaveBalanceReportQuery,
  useLazyGetLeaveBalanceReportDownloadQuery,
} from "../../store/apis/leave.api";
import { useHasPermission } from "../../store/hooks/useRbac";
import type { ILeaveBalanceReportItem } from "../../types/leave.api.types";
import { PAGE_SIZE_OPTIONS } from "../../utils/constants";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { getLeaveStatusVariant } from "../../utils/badgeVariants";
import { DEBOUNCE_DELAYS } from "../../utils/debounce";
import {
  Button,
  ConfigurableTable,
  DepartmentFilter,
  OverflowTooltip,
  Pagination,
  SearchInput,
  SimpleTooltip,
} from "../common";
import type { TableColumn } from "../common/Table";
import Badge from "../common/Badge";
import FilterWrapper from "../common/FilterWrapper";
import ExcelIcon from "../../icons/ExcelIcon";
import TrendingUpIcon from "../../icons/TrendingUpIcon";
import { EmployeeLeaveOverviewSkeleton } from "./Skeleton";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function getErrorMessage(error: unknown, isError: boolean): string {
  if (!isError || !error) return "";
  if (typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string } }).data;
    if (data?.message) return data.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Failed to load leave overview data.";
}

function PermissionDeniedMessage(): React.ReactElement {
  return (
    <div className="p-6">
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" aria-hidden />
        <span>You do not have permission to view the leave overview.</span>
      </div>
    </div>
  );
}

/** Normalize leave type label to key for getLeaveStatusVariant (e.g. "Flexi Weekend" -> "flexi_weekend") */
function leaveLabelToVariantKey(label: string): string {
  return label.toLowerCase().split(/\s+/).join("_");
}

const LEAVE_OVERVIEW_COLUMNS: TableColumn<ILeaveBalanceReportItem>[] = [
  {
    key: "employee",
    title: "Employee",
    label: "Employee",
    required: true,
    render: (_, record) => (
      <div className="flex items-center">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-primary-600">
            {record.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </span>
        </div>
        <div className="ml-4 min-w-0">
          <div className="text-sm font-medium text-slate-900 truncate">
            {record.fullName}
          </div>
          <div className="flex gap-1 text-sm text-slate-500 truncate">
            {record.employeeId} ·{" "}
            <OverflowTooltip
              text={record.workEmail}
              className="cursor-default text-right"
              rootClassName="w-full min-w-0"
              side="bottom"
            >
              {record.workEmail}
            </OverflowTooltip>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "department",
    title: "Department",
    render: (_, record) => (
      <span className="text-sm text-slate-900">
        {record.departmentName || "N/A"}
      </span>
    ),
  },
  {
    key: "leaveBalances",
    title: "Leave Balances",
    label: "Leave Balances",
    required: true,
    render: (_, record) => (
      <div className="flex flex-wrap gap-1">
        {(record.leaveBalances ?? []).map((b) => (
          <Badge
            key={b.label}
            variant={getLeaveStatusVariant(leaveLabelToVariantKey(b.label))}
            size="middle"
          >
            {b.label}: {b.value}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    key: "pending",
    title: "Pending Requests",
    render: (_, record) => {
      const count = record.pendingRequests ?? 0;
      if (count === 0) {
        return <span className="text-sm text-slate-500">None</span>;
      }
      return (
        <Badge variant="yellow" size="middle">
          {count} request{count === 1 ? "" : "s"}
        </Badge>
      );
    },
  },
  {
    key: "totalBalance",
    title: "Total Balance",
    render: (_, record) => {
      const total = record.totalBalance ?? 0;
      if (total > 0) {
        return (
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-slate-900">
              {total} days
            </span>
            <span className="text-green-500 flex items-center" aria-hidden>
              <TrendingUpIcon size={16} className="text-green-500" />
            </span>
          </div>
        );
      }
      return (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-slate-900">0 days</span>
          <Badge variant="red" size="small">
            Zero
          </Badge>
        </div>
      );
    },
  },
];

const LeaveOverview: React.FC = () => {
  const canView = useHasPermission(PERMISSIONS.REPORTS_LEAVE_BALANCE_VIEW);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search.trim() || undefined,
      department: department.trim() || undefined,
    }),
    [page, limit, search, department],
  );

  const {
    data: reportPayload,
    isLoading,
    isError,
    error,
  } = useGetLeaveBalanceReportQuery(canView ? queryParams : undefined, {
    skip: !canView,
  });

  const [downloadCsv, { isLoading: isDownloading }] =
    useLazyGetLeaveBalanceReportDownloadQuery();

  const handleDownloadCsv = useCallback(async () => {
    try {
      const blob = await downloadCsv({
        search: search.trim() || undefined,
        department: department.trim() || undefined,
      }).unwrap();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `leave-balance-report-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download leave balance report:", err);
    }
  }, [downloadCsv, search, department]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(DEFAULT_PAGE);
  }, []);

  const handleDepartmentChange = useCallback((value: string) => {
    setDepartment(value);
    setPage(DEFAULT_PAGE);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleItemsPerPageChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(DEFAULT_PAGE);
  }, []);

  const data = reportPayload?.data ?? [];
  const total = reportPayload?.total ?? 0;
  const errorMessage = getErrorMessage(error, isError);

  if (!canView) {
    return <PermissionDeniedMessage />;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Leave Overview
        </h1>
      </div>

      {errorMessage && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      )}

      <FilterWrapper>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            label="Search"
            placeholder="Search employee by name.."
            debounceDelay={DEBOUNCE_DELAYS.SEARCH}
            className="max-w-lg"
          />
          <DepartmentFilter
            value={department}
            onChange={handleDepartmentChange}
            label="Department"
          />
        </div>
      </FilterWrapper>

      {isLoading ? (
        <EmployeeLeaveOverviewSkeleton />
      ) : (
        <>
          <ConfigurableTable
            columns={LEAVE_OVERVIEW_COLUMNS}
            data={data}
            loading={isLoading}
            emptyMessage="No employee data available for the selected filters."
            rowKey={(record) => `${record.employeeId}-${record.workEmail}`}
            size="lg"
            striped
            hoverable
            bordered={false}
            configOptions={{ persistenceKey: "leave-balance-report-table" }}
            renderColumnSelector={(selector) => (
              <div className="p-3 border-b border-slate-200">
                <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 whitespace-nowrap flex items-center">
                    <ListChecks
                      className="w-6 h-6 mr-1 text-primary-600 flex-shrink-0"
                      aria-hidden
                    />
                    Employee Leave Overview
                  </h2>
                  <div className="flex items-center gap-3">
                    <SimpleTooltip
                      label={isDownloading ? "Downloading CSV…" : "Download as CSV"}
                      side="top"
                    >
                      <span className="inline-flex">
                        <Button
                          appearance="ghost"
                          size="small"
                          onClick={handleDownloadCsv}
                          disabled={isDownloading}
                          loading={isDownloading}
                          icon={<ExcelIcon />}
                          aria-label={isDownloading ? "Downloading" : "Download CSV"}
                          className="!p-2"
                        />
                      </span>
                    </SimpleTooltip>
                    {selector}
                  </div>
                </div>
              </div>
            )}
          />

          {total > 0 && (
            <div className="p-4 border-t border-slate-200">
              <Pagination
                currentPage={page}
                totalItems={total}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemsPerPageOptions={[...PAGE_SIZE_OPTIONS]}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LeaveOverview;
