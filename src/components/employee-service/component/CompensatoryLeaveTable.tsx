import React, { ReactNode, useMemo } from "react";
import { Eye, RotateCcw, Calendar } from "lucide-react";
import { ConfigurableTable, SimpleTooltip, Pagination } from "../../common";
import type { TableColumn } from "../../common/Table";
import type { CompOffItem } from "../../../store/apis/compOff.api";
import Badge from "../../common/Badge";
import { getCompOffStatusVariant } from "../../../utils/badgeVariants";
import { capitalizeWords } from "../../../utils/nameUtils";
import { TimesheetManagementSkeleton } from "../../timesheet/Skeleton";

interface LeaveTablePaginationProps {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

interface LeaveTableSectionProps {
  title?: string;
  requests: CompOffItem[];
  loading?: boolean;
  onViewDetails: (request: CompOffItem) => void;
  onPullback: (request: CompOffItem) => void;
  canPullback: (request: CompOffItem) => boolean;
  getStatusLabel: (request: CompOffItem) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => ReactNode;
  formatDate: (date: string) => string;
  pagination?: LeaveTablePaginationProps;
}

const CompensatoryLeaveTable: React.FC<LeaveTableSectionProps> = ({
  title = "Comp-Off History",
  requests,
  loading = false,
  onViewDetails,
  onPullback,
  canPullback,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  formatDate,
  pagination,
}) => {
  const sortedRequests = useMemo(
    () =>
      [...requests].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [requests],
  );

  const columns = useMemo<TableColumn<CompOffItem>[]>(() => {
    const cellBase = "text-sm text-slate-900 whitespace-nowrap";

    return [
      {
        key: "fullName",
        title: "Name",
        label: "Name",
        required: true,
        className: "min-w-[140px] " + cellBase,
        render: (_, request) => (
          <span className="text-sm text-slate-900 capitalize">
            {request.fullName || "—"}
          </span>
        ),
      },
      {
        key: "leaveDate",
        title: "Leave Date",
        label: "Leave Date",
        className: cellBase,
        render: (_, request) => (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-900">
              {formatDate(request.leaveDate)}
            </span>
          </div>
        ),
      },
      {
        key: "workingPeriod",
        title: "Working Period",
        label: "Working Period",
        className: "min-w-[170px]",
        render: (_, { isFirstHalf, isSecondHalf }) => (
          <span className="text-sm text-slate-900">
            {isFirstHalf && isSecondHalf
              ? "Full Day"
              : isFirstHalf
                ? "First Half"
                : isSecondHalf
                  ? "Second Half"
                  : "None"}
          </span>
        ),
      },
      {
        key: "comment",
        title: "Comment",
        label: "Comment",
        className: cellBase,
        align: "left",
        render: (_, request) => (
          <div className="flex items-center w-[150px]">
            <SimpleTooltip label={request.comment} side="top">
              <span className="text-sm text-slate-900 max-w-[150px] block overflow-hidden text-ellipsis whitespace-nowrap ">
                {request.comment}
              </span>
            </SimpleTooltip>
          </div>
        ),
      },
      {
        key: "status",
        title: "Status",
        label: "Status",
        className: cellBase,
        render: (_, request) => (
          <Badge
            variant={getCompOffStatusVariant(request?.status)}
            size="middle"
            icon={getStatusIcon(request?.status)}
          >
            {request.statusLabel ?? capitalizeWords(request?.status)}
          </Badge>
        ),
      },
      {
        key: "appliedDate",
        title: "Applied Date",
        label: "Applied Date",
        className: `${cellBase} text-sm text-slate-900`,
        render: (_, request) => formatDate(request.createdAt),
      },
      {
        key: "actions",
        title: "Actions",
        label: "Actions",
        required: true,
        align: "center",
        render: (_, request) => (
          <div className="flex items-center justify-center space-x-3">
            <SimpleTooltip
              label="View "
              side="top"
              className="inline-block"
              tooltipClassName=" text-xs shadow-soft border-0"
            >
              <button
                onClick={() => onViewDetails(request)}
                aria-label="View "
                className="inline-flex items-center text-primary-600 hover:text-primary-900"
              >
                <Eye className="w-4 h-4 text-primary-600" />
              </button>
            </SimpleTooltip>

            {canPullback(request) && (
              <SimpleTooltip
                label="Pull back"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-soft border-0"
              >
                <button
                  onClick={() => onPullback(request)}
                  aria-label="Pull back"
                  className="inline-flex items-center text-primary-600 hover:text-primary-800"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </SimpleTooltip>
            )}
          </div>
        ),
      },
    ];
  }, [
    formatDate,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
    onPullback,
    onViewDetails,
  ]);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200">
      <ConfigurableTable<CompOffItem>
        columns={columns}
        data={sortedRequests}
        loading={loading}
        skeleton={<TimesheetManagementSkeleton rows={5} />}
        emptyMessage="No leave requests found"
        rowKey="id"
        configOptions={{
          persistenceKey: `employee-comp-off-history-table`,
        }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {selector}
          </div>
        )}
      />
      {pagination && pagination.totalItems > 0 && (
        <div className="p-6 pt-0 mt-4">
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={
              pagination.onItemsPerPageChange
                ? pagination.onItemsPerPageChange
                : (_value: number) => undefined
            }
            itemsPerPageOptions={
              pagination.itemsPerPageOptions || [5, 10, 20, 50, 100]
            }
          />
        </div>
      )}
    </div>
  );
};

export default CompensatoryLeaveTable;
