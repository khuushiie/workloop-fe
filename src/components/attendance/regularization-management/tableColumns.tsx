import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  X,
  XCircle,
  AlertCircle,
  CircleAlert,
} from "lucide-react";
import { RegularizationType } from "../../../types/regularization.types";
import {
  getWorkflowStatusFallbackLabel,
  isApprovedWorkflowStatus,
  WorkflowStatusCode,
} from "../../../utils/constants";
import { formatISODate } from "../../../utils/timeUtils";
import { TableColumn } from "../../common/Table";
import Badge from "../../common/Badge";
import { getWorkflowStatusVariant } from "../../../utils/badgeVariants";
import { SimpleTooltip } from "../../common";
import { IRegularizationRequest } from "../../../store/apis/attendanceRegularization.api";

interface BaseColumnConfig {
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getRegularizationTypeLabel: (type: RegularizationType) => string;
  getStatusColor: (status: WorkflowStatusCode) => string;
  handleViewDetails: (request: IRegularizationRequest) => void;
}

interface PendingColumnConfig extends BaseColumnConfig {
  handleApproveClick: (request: IRegularizationRequest) => void;
  handleRejectClick: (request: IRegularizationRequest) => void;
  canActOnRequest: (request: IRegularizationRequest) => boolean;
  processing: string | null;
  selectedIds: string[];
  setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  data: IRegularizationRequest[];
}

export const getWorkflowStatusIcon = (status?: string) => {
  if (!status) return CircleAlert;

  const normalized = status.toLowerCase();

  if (normalized.startsWith("pending")) return Clock;
  if (normalized.startsWith("approved")) return CheckCircle;
  if (normalized.startsWith("rejected")) return XCircle;
  if (normalized === "cancelled") return AlertCircle;

  return CircleAlert;
};

export const getPendingColumns = (
  config: PendingColumnConfig,
): TableColumn<IRegularizationRequest>[] => {
  const {
    formatDate,
    formatTime,
    handleViewDetails,
    handleApproveClick,
    handleRejectClick,
    canActOnRequest,
    processing,
    selectedIds = [],
    setSelectedIds,
    data = [],
  } = config;

  return [
    {
      key: "selection",
      title: (
        <input
          type="checkbox"
          className={`h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 ${data.filter(canActOnRequest).length > 0 ? "" : "hidden"}`}
          checked={
            data?.length > 0 &&
            data.filter(canActOnRequest).length > 0 &&
            data
              .filter(canActOnRequest)
              .every((item) => selectedIds.includes(item.id))
          }
          onChange={(e) => {
            if (e.target.checked) {
              const actionableIds = data
                .filter((item) => canActOnRequest(item))
                .map((item) => item.id);
              setSelectedIds(actionableIds);
            } else {
              setSelectedIds([]);
            }
          }}
        />
      ),
      label: "Select",
      width: 48,
      className: "px-2 text-center",
      required: true,
      isReorderable: false,
      render: (_, r) =>
        canActOnRequest(r) && (
          <input
            type="checkbox"
            className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
            checked={selectedIds.includes(r.id)}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setSelectedIds((prev) =>
                isChecked
                  ? [...prev, r.id]
                  : prev.filter((id) => id !== r.id),
              );
            }}
          />
        ),
    },
    {
      key: "employee",
      title: "Employee",
      label: "Employee",
      required: true,
      render: (_, r) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{r.fullName} • {r.departmentName}</div>
          <div className="text-sm text-slate-500">
           {r.employeeId}
          </div>
        </div>
      ),
    },
    {
      key: "dateType",
      title: "Date & Type",
      label: "Date & Type",
      required: true,
      render: (_, r) => (
        <div>
          <div className="flex items-center text-sm font-medium text-slate-900">
            <Calendar className="w-4 h-4 mr-1 text-slate-400" />
            {formatDate(r.date)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {r.regularizationTypeName}
          </div>
        </div>
      ),
    },
    {
      key: "requestedTime",
      title: "Requested Time",
      label: "Requested Time",
      render: (_, r) => (
        <div className="text-sm text-slate-900 flex items-center">
          <Clock className="w-4 h-4 mr-1 text-slate-400" />
          {formatTime(r.requestedCheckInTime)} -{" "}
          {formatTime(r.requestedCheckOutTime)}
        </div>
      ),
    },
    {
      key: "actualTime",
      title: "Actual Time",
      label: "Actual Time",
      render: (_, r) => (
        <div className="text-sm text-slate-900 flex items-center">
          <Clock className="w-4 h-4 mr-1 text-slate-400" />
          {formatTime(r.actualCheckInTime || "")} -{" "}
          {formatTime(r.actualCheckOutTime || "")}
        </div>
      ),
    },
    {
      key: "reason",
      title: "Reason",
      label: "Reason",
      dataIndex: "reason",
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_, r) => {
        const StatusIcon = getWorkflowStatusIcon(r.status);
        return (
          <Badge
            size="middle"
            variant={getWorkflowStatusVariant(r.status)}
            icon={
              isApprovedWorkflowStatus(r.status) ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <StatusIcon className="w-4 h-4" />
              )
            }
          >
            {r.statusLabel ||
              getWorkflowStatusFallbackLabel(r.status, r.currentActorName)}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, r) => (
        <div className="flex space-x-2">
          <SimpleTooltip
            label="View"
            side="top"
            className="inline-block"
            tooltipClassName=" text-xs shadow-md border-0"
          >
            <button
              onClick={() => handleViewDetails(r)}
              aria-label="View"
              className="text-primary-600 hover:text-primary-900"
            >
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>

          {canActOnRequest(r) && (
            <>
              <SimpleTooltip
                label="Approve"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-md border-0"
              >
                <button
                  onClick={() => handleApproveClick(r)}
                  disabled={processing === r.id}
                  aria-label="Approve"
                  className="text-green-600 hover:text-green-900 disabled:opacity-50"
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
                  onClick={() => handleRejectClick(r)}
                  disabled={processing === r.id}
                  aria-label="Reject"
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
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
};

export const getHistoryColumns = (
  config: Omit<
    BaseColumnConfig,
    | "handleApproveClick"
    | "handleRejectClick"
    | "canActOnRequest"
    | "processing"
  >,
): TableColumn<IRegularizationRequest>[] => {
  const {
    formatDate,
    formatTime,
    handleViewDetails,
  } = config;

  return [
    {
      key: "employee",
      title: "Employee",
      label: "Employee",
      required: true,
      render: (_, r) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{r.userName}</div>
          <div className="text-sm text-slate-500">
            {r.employeeId} • {r.department}
          </div>
        </div>
      ),
    },
    {
      key: "dateType",
      title: "Date & Type",
      label: "Date & Type",
      required: true,
      render: (_, r) => (
        <div>
          <div className="flex items-center text-sm font-medium text-slate-900">
            <Calendar className="w-4 h-4 mr-1 text-slate-400" />
            {formatDate(r.date)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {r.regularizationTypeName}
          </div>
        </div>
      ),
    },
    {
      key: "requestedTime",
      title: "Requested Time",
      label: "Requested Time",
      render: (_, r) => (
        <div className="text-sm text-slate-900 flex items-center">
          <Clock className="w-4 h-4 mr-1 text-slate-400" />
          {formatTime(r.requestedCheckInTime)} -{" "}
          {formatTime(r.requestedCheckOutTime)}
        </div>
      ),
    },
    {
      key: "actualTime",
      title: "Actual Time",
      label: "Actual Time",
      render: (_, r) => (
        <div className="text-sm text-slate-900 flex items-center">
          <Clock className="w-4 h-4 mr-1 text-slate-400" />
          {formatTime(r.actualCheckInTime || "")} -{" "}
          {formatTime(r.actualCheckOutTime || "")}
        </div>
      ),
    },
    {
      key: "reason",
      title: "Reason",
      label: "Reason",
      dataIndex: "reason",
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_, r) => {
        // Use r.status (the workflow status code), NOT r.regularizationTypeCode
        // which is the request type and would never match the "pending"/"approved"/"rejected"
        // prefix the variant/icon helpers expect — causing every badge to render gray.
        const Icon = getWorkflowStatusIcon(r.status);
        return (
          <div>
            <Badge size="middle" variant={getWorkflowStatusVariant(r.status)}>
              <Icon className="w-4 h-4" />
              {r.statusLabel ||
                getWorkflowStatusFallbackLabel(r.status, r.currentActorName)}
            </Badge>
          </div>
        );
      },
    },
    {
      key: "appliedDate",
      title: "Applied Date",
      label: "Applied Date",
      render: (_, r) => (
        <div className="text-sm text-slate-500">
          {formatISODate(r.appliedDate)}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      label: "Actions",
      required: true,
      render: (_, r) => (
        <SimpleTooltip
          label="View"
          side="top"
          className="inline-block"
          tooltipClassName="text-xs shadow-md border-0"
        >
          <button
            onClick={() => handleViewDetails(r)}
            aria-label="View"
            className="text-primary-600 hover:text-primary-900"
          >
            <Eye className="w-4 h-4" />
          </button>
        </SimpleTooltip>
      ),
    },
  ];
};
