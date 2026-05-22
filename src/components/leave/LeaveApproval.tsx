import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  MinusCircle,
  Users,
  X,
  XCircle,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import {
  getWorkflowStatusFallbackLabel,
  isApprovedWorkflowStatus,
  isCancelledWorkflowStatus,
  isPendingWorkflowStatus,
  isRejectedWorkflowStatus,
  LEAVE_APPROVAL_STATUS_HISTORY,
  LEAVE_APPROVAL_STATUS_PENDING,
  RoleTypeEnum,
  VIEW_MODE,
  ViewMode,
} from "../../utils/constants";
import { MasterConfigCategory } from "../../constants";
import {
  useDecideLeaveMutation,
  useGetLeavesQuery,
} from "../../store/apis/leave.api";
import { useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";
import { Pagination, SimpleTooltip, ConfigurableTable } from "../common";
import LeaveViewModal, { LeaveViewRecord } from "./LeaveViewModal";

import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { formatDate } from "../../utils/timeUtils";

import FilterWrapper from "../common/FilterWrapper";
import LeaveFiltersBar from "./LeaveFiltersBar";
import RejectionModal from "./modals/RejectionModal";


// NEW: skeleton import
import { useAuth } from "../../store/hooks/useAuth";

import { getWorkflowStatusVariant } from "../../utils/badgeVariants";
import Badge from "../common/Badge";
import LeaveApprovalSkeleton from "./LeaveApprovalSkeleton";
import type { ILeave } from "../../types/leave.api.types";
import type { ApiError } from "../../store/utils/apiError";
import type { TableColumn } from "../common/Table";
import dayjs from "dayjs";

const mapToLeaveViewRecord = (leave: ILeave): LeaveViewRecord => ({
  ...leave,
  appliedDate: leave.createdAt,
  currentApproverName: leave.currentActorName,
  reason: leave.reason || "",
  status: leave.status as LeaveViewRecord["status"],
});

const LeaveApproval: React.FC = () => {
  const [selectedLeave, setSelectedLeave] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<"pending" | "history">(
    "pending"
  );
  const [viewLeave, setViewLeave] = useState<LeaveViewRecord | null>(null);

  const currentUser = useAuth().user;
  const currentUserId = currentUser?.id;
  const normalizedCurrentUserId = currentUserId ? String(currentUserId) : null;
  const canManageLeaveRequests = useHasPermission(
    PERMISSIONS.LEAVE_REQUESTS_MANAGE
  );
  const canViewAll =
    useHasPermission(PERMISSIONS.LEAVE_REQUESTS_VIEW) || canManageLeaveRequests;

  // Check if user is admin
  const isAdmin =
    currentUser?.role?.toLowerCase() === RoleTypeEnum.ADMIN?.toLowerCase() ||
    currentUser?.role?.toLowerCase() ===
    RoleTypeEnum.SUPER_ADMIN?.toLowerCase();
  // Department filter via RTK
  const { data: departmentList = [] } = useGetMasterConfigByCategoryQuery(
    MasterConfigCategory.DEPARTMENT
  );

  const departmentOptions = useMemo(
    () =>
      departmentList.map((d) => ({
        label: d.displayName,
        value: d.id,
      })),
    [departmentList]
  );
  // backend already filters reportees using reporteesOnly
  const users: never[] = [];

  // View mode states for admin tabs
  const [pendingViewMode, setPendingViewMode] = useState<ViewMode>(
    VIEW_MODE.ALL
  );
  const [historyViewMode, setHistoryViewMode] = useState<ViewMode>(
    VIEW_MODE.ALL
  );

  const [pendingFilters, setPendingFilters] = useState<{
    search?: string;
    userId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [historyFilters, setHistoryFilters] = useState<{
    search?: string;
    userId?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);

  // Slots for portaling each table's "Columns" selector into its accordion header row.
  // Callback refs as state ensure the portal re-renders once the slot DOM node mounts.
  const [pendingColumnsSlot, setPendingColumnsSlot] =
    useState<HTMLDivElement | null>(null);
  const [historyColumnsSlot, setHistoryColumnsSlot] =
    useState<HTMLDivElement | null>(null);

  const getWorkflowStatusIcon = (status?: string) => {
    if (!status) return MinusCircle;

    const normalized = status.toLowerCase();

    if (normalized.startsWith("pending")) return Clock;
    if (normalized.startsWith("approved")) return CheckCircle;
    if (normalized.startsWith("rejected")) return XCircle;
    if (normalized === "cancelled") return AlertCircle;

    return MinusCircle;
  };

  const formatFilterDate = (date?: string) => {
    if (!date) return undefined;
    return `${dayjs(date).format("YYYY-MM-DD")}T00:00:00`;
  };

  const pendingParams = useMemo(
    () => ({
      page: pendingPage,
      limit: pendingLimit,
      status: LEAVE_APPROVAL_STATUS_PENDING,
      department: pendingFilters.department,
      search: pendingFilters.search,
      startDate: formatFilterDate(pendingFilters.startDate),
      endDate: formatFilterDate(pendingFilters.endDate),
      reporteesOnly: isAdmin && pendingViewMode === VIEW_MODE.REPORTEES,
    }),
    [
      pendingPage,
      pendingLimit,
      pendingFilters,
      isAdmin,
      pendingViewMode,
      departmentOptions,
    ]
  );
  const historyParams = useMemo(
    () => ({
      page: historyPage,
      limit: historyLimit,
      status: LEAVE_APPROVAL_STATUS_HISTORY,
      search: historyFilters.search,
      startDate: formatFilterDate(historyFilters.startDate),
      endDate: formatFilterDate(historyFilters.endDate),
      department: historyFilters.department,
      reporteesOnly: isAdmin && historyViewMode === VIEW_MODE.REPORTEES,
    }),
    [
      historyPage,
      historyLimit,
      historyFilters,
      isAdmin,
      historyViewMode,
      departmentOptions,
    ]
  );

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isFetching: pendingFetching,
  } = useGetLeavesQuery(pendingParams);

  const {
    data: historyData,
    isLoading: historyLoading,
    isFetching: historyFetching,
  } = useGetLeavesQuery(historyParams);

  const activeAccordionRef = useRef<"pending" | "history">(activeAccordion);
  useEffect(() => {
    activeAccordionRef.current = activeAccordion;
  }, [activeAccordion]);

  const canActOnLeave = useCallback(
    (leave: ILeave) => {

      if (!canManageLeaveRequests) {
        return false;
      }

      if (
        currentUser?.role?.toLowerCase() ===
        RoleTypeEnum.ADMIN?.toLowerCase() ||
        currentUser?.role?.toLowerCase() ===
        RoleTypeEnum.SUPER_ADMIN?.toLowerCase()
      ) {
        return true;
      }

      if (!leave.currentActorIds || !normalizedCurrentUserId) {
        return false;
      }

      return leave.currentActorIds.includes(normalizedCurrentUserId);
    },
    [canManageLeaveRequests, canViewAll, normalizedCurrentUserId, currentUser]
  );

  const [decideLeave, { isLoading: actionLoading }] = useDecideLeaveMutation();

  const handleApprove = async (leaveId: string) => {
    if (!canManageLeaveRequests) {
      toast.error("You do not have permission to approve leave requests.");
      return;
    }

    try {
      await decideLeave({
        id: leaveId,
        body: { decision: "approved" },
      }).unwrap();

      toast.success("Leave approved successfully!");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || err?.message || "Something went wrong";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    }
  };

  const handleReject = (leaveId: string) => {
    if (!canManageLeaveRequests) {
      toast.error("You do not have permission to reject leave requests.");
      return;
    }
    setSelectedLeave(leaveId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!canManageLeaveRequests) {
      toast.error("You do not have permission to reject leave requests.");
      return;
    }

    if (!selectedLeave || !rejectionReason.trim()) return;

    try {
      await decideLeave({
        id: selectedLeave,
        body: {
          decision: "rejected",
          remarks: rejectionReason,
        },
      }).unwrap();

      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedLeave(null);

      toast.success("Leave rejected successfully!");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || err?.message || "Something went wrong";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          Leave Approvals
        </h1>
      </div>

      {/* Accordion: Leave Approval */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        {/*
          Header is a flex row instead of a single <button> so the "Columns"
          dropdown (rendered via portal into pendingColumnsSlot) can sit on
          the same line as the title without nesting interactive elements.
        */}
        <div className="w-full px-4 py-3 border-b flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex-1 text-left text-base md:text-xl font-bold text-slate-900"
            onClick={() =>
              setActiveAccordion(
                activeAccordion === "pending" ? "history" : "pending"
              )
            }
            aria-expanded={activeAccordion === "pending"}
          >
            Leave Approval ({pendingData?.total ?? 0})
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
                  activeAccordion === "pending" ? "history" : "pending"
                )
              }
              aria-label={
                activeAccordion === "pending"
                  ? "Collapse leave approval"
                  : "Expand leave approval"
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

            <div className="">
              <ConfigurableTable<ILeave>
                columns={[
                  {
                    key: "employeeId",
                    title: "Employee ID",
                    label: "Employee ID",
                    required: true,
                    render: (_: unknown, r: ILeave) => r.employeeId || "-",
                  },
                  {
                    key: "user",
                    title: "Employee",
                    label: "Employee Name",
                    required: true,
                    render: (_: unknown, r: ILeave) => r.userName,
                  },
                  {
                    key: "type",
                    title: "Type",
                    label: "Leave Type",
                    render: (_: unknown, r: ILeave) => r.leaveTypeName || "-",
                  },
                  {
                    key: "dates",
                    title: "Dates",
                    label: "Leave Dates",
                    required: true,
                    render: (_: unknown, r: ILeave) =>
                      `${formatDate(r.startDate)} → ${formatDate(r.endDate)}`,
                  },
                  {
                    key: "days",
                    title: "Days",
                    label: "Number of Days",
                    render: (_: unknown, r: ILeave) => r.days,
                  },
                  {
                    key: "department",
                    title: "Department",
                    label: "Department",
                    render: (_: unknown, r: ILeave) =>
                      (r as ILeave & { departmentName?: string })
                        .departmentName || "-",
                  },
                  {
                    key: "status",
                    title: "Status",
                    label: "Status",
                    render: (_: unknown, r: ILeave) => {
                      const label =
                        r.statusLabel ||
                        getWorkflowStatusFallbackLabel(
                          r.status,
                          r.currentActorName
                        );

                      const StatusIcon = getWorkflowStatusIcon(r.status);

                      return (
                        <Badge
                          variant={getWorkflowStatusVariant(r.status)}
                          size="middle"
                        >
                          <StatusIcon className="w-4 h-4" />
                          {label}
                        </Badge>
                      );
                    },
                  },
                  {
                    key: "actions",
                    title: "Actions",
                    label: "Actions",
                    required: true,
                    render: (_: unknown, r: ILeave) => (
                      <div className="flex items-center gap-0 md:gap-2">
                        <SimpleTooltip
                          label="View"
                          side="top"
                          className="inline-block"
                          tooltipClassName=" text-xs shadow-md border-0"
                        >
                          <button
                            onClick={() =>
                              setViewLeave(mapToLeaveViewRecord(r))
                            }
                            aria-label="View"
                            className="text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary-600" />
                          </button>
                        </SimpleTooltip>

                        {canActOnLeave(r) && canManageLeaveRequests && (
                          <>
                            <SimpleTooltip
                              label="Approve"
                              side="top"
                              className="inline-block"
                              tooltipClassName=" text-xs shadow-md border-0"
                            >
                              <button
                                onClick={() => handleApprove(r.id)}
                                disabled={actionLoading}
                                aria-label="Approve"
                                className={`transition-colors text-green-600 hover:text-green-800 ${processing === r.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
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
                                onClick={() => handleReject(r.id)}
                                disabled={actionLoading}
                                aria-label="Reject"
                                className={`transition-colors text-red-600 hover:text-red-800 ${processing === r.id
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
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
                ]}
                data={pendingData?.data ?? []}
                loading={pendingLoading || pendingFetching}
                skeleton={<LeaveApprovalSkeleton rows={6} />}
                emptyMessage="No pending leaves found"
                rowKey={(l: ILeave) => l.id}
                configOptions={{ persistenceKey: "leave-approval-pending" }}
                renderColumnSelector={(selector) => (
                  <>
                    {/* Teleport the Columns dropdown into the accordion header row */}
                    {pendingColumnsSlot &&
                      createPortal(selector, pendingColumnsSlot)}

                    {isAdmin && (
                      <div className="flex justify-between items-center mb-4">
                        <div className="mb-1 flex border-b border-slate-200">
                          <button
                            onClick={() => {
                              setPendingViewMode(VIEW_MODE.ALL);
                              setPendingPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pendingViewMode === VIEW_MODE.ALL
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                              }`}
                          >
                            <span className="flex items-center whitespace-nowrap gap-2 text-sm font-medium">
                              <Users className="h-4 w-4 shrink-0" />
                              All Employees
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setPendingViewMode(VIEW_MODE.REPORTEES);
                              setPendingPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${pendingViewMode === VIEW_MODE.REPORTEES
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                              }`}
                          >
                            <span className="flex items-center whitespace-nowrap gap-2 text-sm font-medium">
                              <Users className="h-4 w-4 shrink-0" />
                              My Reportees
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    <FilterWrapper>
                      <LeaveFiltersBar
                        value={pendingFilters}
                        users={users}
                        departments={departmentOptions}
                        onChange={(key, val) => {
                          const v =
                            val === "All Employees" ||
                              val === "All Departments" ||
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
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={pendingPage}
                // totalItems={pendingTotal}
                totalItems={pendingData?.total ?? 0}
                itemsPerPage={pendingLimit}
                onPageChange={(p) => {
                  setPendingPage(p);
                }}
                onItemsPerPageChange={(l) => {
                  setPendingLimit(l);
                  setPendingPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-slate-200 mt-6">
        <div className="w-full p-4 border-b flex items-center justify-between gap-3">
          <button
            type="button"
            className="flex-1 text-left text-base md:text-xl font-bold text-slate-900"
            onClick={() =>
              setActiveAccordion(
                activeAccordion === "history" ? "pending" : "history"
              )
            }
            aria-expanded={activeAccordion === "history"}
          >
            Leave History ({historyData?.total ?? 0})
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
                  activeAccordion === "history" ? "pending" : "history"
                )
              }
              aria-label={
                activeAccordion === "history"
                  ? "Collapse leave history"
                  : "Expand leave history"
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
            <div className="">
              <ConfigurableTable<ILeave>
                columns={[
                  {
                    key: "employeeId",
                    title: "Employee ID",
                    label: "Employee ID",
                    required: true,
                    render: (_: unknown, r: ILeave) => r.employeeId || "-",
                  },
                  {
                    key: "user",
                    title: "Employee",
                    label: "Employee Name",
                    required: true,
                    render: (_: unknown, r: ILeave) => r.userName,
                  },
                  {
                    key: "type",
                    title: "Type",
                    label: "Leave Type",
                    render: (_: unknown, r: ILeave) => r.leaveTypeName || "-",
                  },
                  {
                    key: "dates",
                    title: "Dates",
                    label: "Leave Dates",
                    required: true,
                    render: (_: unknown, r: ILeave) =>
                      `${formatDate(r.startDate)} → ${formatDate(r.endDate)}`,
                  },
                  {
                    key: "days",
                    title: "Days",
                    label: "Number of Days",
                    render: (_: unknown, r: ILeave) => r.days,
                  },
                  {
                    key: "department",
                    title: "Department",
                    label: "Department",
                    render: (_: unknown, r: ILeave) =>
                      (r as ILeave & { departmentName?: string })
                        .departmentName || "-",
                  },
                  {
                    key: "status",
                    title: "Status",
                    label: "Status",
                    render: (_: unknown, r: ILeave) => {
                      const label =
                        r.statusLabel ||
                        getWorkflowStatusFallbackLabel(
                          r.status,
                          r.currentActorName
                        );

                      const StatusIcon = getWorkflowStatusIcon(r.status);

                      return (
                        <Badge
                          variant={getWorkflowStatusVariant(r.status)}
                          size="middle"
                        >
                          <StatusIcon className="w-4 h-4" />
                          {label}
                        </Badge>
                      );
                    },
                  },
                  {
                    key: "actions",
                    title: "Actions",
                    label: "Actions",
                    required: true,
                    render: (_: unknown, r: ILeave) => (
                      <SimpleTooltip
                        label="View"
                        side="top"
                        className="inline-block"
                        tooltipClassName=" text-xs shadow-md border-0"
                      >
                        <button
                          onClick={() => setViewLeave(mapToLeaveViewRecord(r))}
                          aria-label="View"
                          className="flex justify-center items-center text-slate-600 hover:text-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-primary-600" />
                        </button>
                      </SimpleTooltip>
                    ),
                  },
                ]}
                data={historyData?.data ?? []}
                loading={historyLoading || historyFetching}
                skeleton={<LeaveApprovalSkeleton rows={6} />}
                emptyMessage="No historical leaves found"
                rowKey={(l: ILeave) => l.id}
                configOptions={{ persistenceKey: "leave-approval-history" }}
                renderColumnSelector={(selector) => (
                  <>
                    {/* Teleport the Columns dropdown into the accordion header row */}
                    {historyColumnsSlot &&
                      createPortal(selector, historyColumnsSlot)}

                    {isAdmin && (
                      <div className="flex justify-between items-center mb-4">
                        <div className="mb-1 flex border-b border-slate-200">
                          <button
                            onClick={() => {
                              setHistoryViewMode(VIEW_MODE.ALL);
                              setHistoryPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyViewMode === VIEW_MODE.ALL
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                              }`}
                          >
                            <span className="flex items-center whitespace-nowrap gap-2 text-sm font-medium">
                              <Users className="h-4 w-4 shrink-0" />
                              All Employees
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setHistoryViewMode(VIEW_MODE.REPORTEES);
                              setHistoryPage(1);
                            }}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyViewMode === VIEW_MODE.REPORTEES
                                ? "border-primary-600 text-primary-600"
                                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                              }`}
                          >
                            <span className="flex items-center whitespace-nowrap gap-2 text-sm font-medium">
                              <Users className="h-4 w-4 shrink-0" />
                              My Reportees
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    <FilterWrapper>
                      <LeaveFiltersBar
                        value={historyFilters}
                        users={users}
                        departments={departmentOptions}
                        onChange={(key, val) => {
                          const v =
                            val === "All Employees" ||
                              val === "All Departments" ||
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
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={historyPage}
                totalItems={historyData?.total ?? 0}
                itemsPerPage={historyLimit}
                onPageChange={(p) => {
                  setHistoryPage(p);
                }}
                onItemsPerPageChange={(l) => {
                  setHistoryLimit(l);
                  setHistoryPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectionModal
          rejectionReason={rejectionReason}
          selectedLeave={selectedLeave}
          confirmReject={confirmReject}
          processing={processing}
          setRejectionReason={setRejectionReason}
          setSelectedLeave={setSelectedLeave}
          setShowRejectModal={setShowRejectModal}
        />
      )}

      <LeaveViewModal record={viewLeave} onClose={() => setViewLeave(null)} />
    </div>
  );
};

export default LeaveApproval;
