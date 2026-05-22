import React, { ReactNode, useMemo } from "react";
import { FileText, Eye, RotateCcw } from "lucide-react";
import { ConfigurableTable } from "../../common";
import { TableColumn } from "../../common/Table";
import Pagination from "../../common/Pagination";
import { ILeaveRequest } from "../../../types/leave.types";
import { Leaves } from "../../../utils/constants";
import Badge from "../../common/Badge";
import { getWorkflowStatusVariant } from "../../../utils/badgeVariants";
import { SimpleTooltip } from "../../common";

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
  requests: ILeaveRequest[];
  loading?: boolean;
  onViewDetails: (request: ILeaveRequest) => void;
  onPullback: (request: ILeaveRequest) => void;
  canPullback: (request: ILeaveRequest) => boolean;
  getLeaveTypeLabel?: (type: Leaves) => string;
  getStatusLabel: (request: ILeaveRequest) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => ReactNode;
  formatDate: (date: string) => string;
  pagination?: LeaveTablePaginationProps;
}

const LeaveTableSection: React.FC<LeaveTableSectionProps> = ({
  title = "Leave History ",
  requests,
  loading = false,
  onViewDetails,
  onPullback,
  canPullback,
  getLeaveTypeLabel,
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
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime(),
      ),
    [requests],
  );

  const columns = useMemo<TableColumn<ILeaveRequest>[]>(() => {
    const cellBase = "text-sm text-slate-900 whitespace-nowrap";

    return [
      {
        key: "leaveType",
        title: "Leave Type",
        label: "Leave Type",
        required: true,
        className: "min-w-[150px]",
        render: (_, request) => (
          <div className="flex items-center">
            <FileText className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-sm font-bold text-slate-900">
              {request.leaveTypeName}
            </span>
          </div>
        ),
      },
      {
        key: "period",
        title: "Period",
        label: "Leave Period",
        required: true,
        className: cellBase,
        render: (_, request) => (
          <div className="text-sm text-slate-900">
            {formatDate(request.startDate)} - {formatDate(request.endDate)}
          </div>
        ),
      },
      {
        key: "days",
        title: "Days",
        label: "No. of Days",
        className: cellBase,
        align: "left",
        render: (_, request) => (
          <span className="text-sm text-slate-900">
            {request.days} {request.isHalfDay ? "half" : "full"} day
            {request.days !== 1 ? "s" : ""}
          </span>
        ),
      },

      {
        key: "status",
        title: "Status",
        label: "Status",
        className: cellBase,
        render: (_, request) => (
          <Badge
            variant={getWorkflowStatusVariant(request.status)}
            size="middle"
            icon={getStatusIcon(request.status)}
          >
            {getStatusLabel(request)}
          </Badge>
        ),
      },
      {
        key: "appliedDate",
        title: "Applied Date",
        label: "Applied Date",
        className: `${cellBase} text-sm text-slate-900`,
        render: (_, request) => formatDate(request.appliedDate),
      },
      {
        key: "reason",
        title: "Reason",
        label: "Reason",
        render: (_, request) => {
          const reasonText = request.reason || "—";

          return (
            <div className="flex items-center w-[220px]">
              <SimpleTooltip label={reasonText} side="top">
                <span className="text-sm text-slate-900 block max-w-[220px] truncate cursor-pointer">
                  {reasonText}
                </span>
              </SimpleTooltip>
            </div>
          );
        },
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
              label="View"
              side="top"
              className="inline-block"
              tooltipClassName=" text-xs shadow-md border-0"
            >
              <button
                onClick={() => onViewDetails(request)}
                aria-label="View leave details"
                className="inline-flex items-center text-primary-600 hover:text-primary-900"
              >
                <Eye className="w-4 h-4" />
              </button>
            </SimpleTooltip>

            {canPullback(request) && (
              <SimpleTooltip
                label="Pull back"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-md border-0"
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
    canPullback,
    formatDate,
    getLeaveTypeLabel,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
    onPullback,
    onViewDetails,
  ]);

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-visible">
      <ConfigurableTable
        columns={columns}
        data={sortedRequests}
        loading={loading}
        emptyMessage="No leave requests found"
        rowKey="id"
        bordered={false}
        hoverable={true}
        configOptions={{ persistenceKey: "my-leaves-history" }}
        renderColumnSelector={(selector) => (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {selector}
          </div>
        )}
      />
      {pagination && pagination.totalItems > 0 && (
        <div className="border-t border-slate-100">
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

export default LeaveTableSection;
