import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  FileText,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ApiError } from "../../store/utils/apiError";
import {
  useGetCompOffListQuery,
  useCreateCompOffMutation,
  useApproveCompOffMutation,
  useRejectCompOffMutation,
} from "../../store/apis/compOff.api";
import { useGetUsersForFilterQuery } from "../../store/apis/user.api";
import type { CompOffItem } from "../../store/apis/compOff.api";
import {
  Modal,
  Pagination,
  Select,
  SimpleTooltip,
  DatePicker,
  ConfigurableTable,
  Button,
} from "../common";
import type { TableColumn } from "../common/Table";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { useAuth } from "../../store/hooks/useAuth";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store";
import { isWeekOffDate, type WeekOffConfig } from "../../utils/weekOff";
import {
  isPendingCompOffStatus,
  COMP_OFF_APPROVED_STATUSES,
  CompOffStatusCode,
  COMP_OFF_REJECTED_STATUSES,
  COMP_OFF_CANCELLED_STATUSES,
  getCompOffStatusColor,
  COMP_OFF_PENDING_STATUSES,
} from "../../utils/constants";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import RejectionModal from "../leave/modals/RejectionModal";

import TabSelector, { TabKey } from "./component/TabSelector";
import Badge from "../common/Badge";
import { getCompOffStatusVariant } from "../../utils/badgeVariants";
import { capitalizeWords } from "../../utils/nameUtils";
import { TextArea } from "../common/TextArea";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import { FEATURE_FLAGS } from "../../utils/constants";
import GameBookingAdminTab from "./component/GameBookingAdminTab";
import DocumentApprovalAdminTab from "./component/DocumentApprovalAdminTab";
import { useGetAdminPendingDocumentsQuery } from "../../store/apis/userDocuments.api";
import { useGetBookingListQuery } from "../../store/apis/gameBooking.api";
import { WorkflowQueryStatus } from "../../utils/constants";
import { TimesheetManagementSkeleton } from "../timesheet/Skeleton";

dayjs.extend(utc);
dayjs.extend(timezone);

export interface EmployeeOption {
  label: string;
  value: string;
}

const EmployeeSelfService: React.FC = () => {
  const userTimezone = dayjs.tz.guess();
  const { user } = useAuth();
  const weekOffConfig = useAppSelector(
    (state: RootState) => state.auth.weekOffConfig,
  );
  const canActOnApprovals = useHasPermission(
    PERMISSIONS.EMPLOYEE_SERVICE_MANAGE,
  );

  const [active, setActive] = useState<TabKey>("notification");

  const [activeAccordion, setActiveAccordion] = useState<"pending" | "history">(
    "pending",
  );
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingLimit, setPendingLimit] = useState(10);

  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(10);

  const [users, setUsers] = useState<EmployeeOption[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CompOffItem | null>(
    null,
  );

  const { data: pendingResponse, isLoading: pendingLoading } =
    useGetCompOffListQuery({
      status: COMP_OFF_PENDING_STATUSES,
      page: pendingPage,
      limit: pendingLimit,
    });
  const { data: historyResponse, isLoading: historyLoading } =
    useGetCompOffListQuery({
      status: `${COMP_OFF_APPROVED_STATUSES},${COMP_OFF_REJECTED_STATUSES}`,
      page: historyPage,
      limit: historyLimit,
    });

  const pendingCompOff = pendingResponse?.data ?? [];
  const pendingTotal = pendingResponse?.total ?? 0;
  const historyCompOff = historyResponse?.data ?? [];
  const historyTotal = historyResponse?.total ?? 0;

  const [createCompOff, { isLoading: submitting }] = useCreateCompOffMutation();
  const [approveCompOff] = useApproveCompOffMutation();
  const [rejectCompOff] = useRejectCompOffMutation();

  // Rejection modal state
  const [selectedCompOff, setSelectedCompOff] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleViewDetails = (request: CompOffItem) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const { isEnabled } = useFeatureFlags();
  const gameBookingEnabled = isEnabled(FEATURE_FLAGS.SHOW_GAME_BOOKING);

  const { data: pendingDocsResp } = useGetAdminPendingDocumentsQuery({ page: 1, limit: 1 });
  const { data: pendingBookingsResp } = useGetBookingListQuery({
    status: WorkflowQueryStatus.PENDING,
    page: 1,
    limit: 1,
  });

  const totalPendingNotifications = (pendingDocsResp?.total || 0) + (pendingBookingsResp?.total || 0) + (pendingTotal || 0);

  const mainTabs: { k: TabKey; label: string }[] = [
    {
      k: "notification",
      label: `Notifications${totalPendingNotifications > 0 ? ` (${totalPendingNotifications})` : ""}`
    },
    { k: "comp-off", label: "Comp-Off Request" },
    ...(gameBookingEnabled
      ? [{ k: "game-booking" as TabKey, label: "Game Booking" }]
      : []),
    { k: "document-approvals", label: "Document Approvals" },
  ];

  const getStatusIcon = (status: string) => {
    const statusCode = status as CompOffStatusCode;
    if (isPendingCompOffStatus(status)) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (COMP_OFF_APPROVED_STATUSES.includes(statusCode)) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (COMP_OFF_REJECTED_STATUSES.includes(statusCode)) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (COMP_OFF_CANCELLED_STATUSES.includes(statusCode)) {
      return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const getStatusColor = (status: string) => getCompOffStatusColor(status);

  const handleTabChange = (tab: TabKey) => {
    if (tab === "notification") {
      setPendingPage(1);
      setHistoryPage(1);
    }
    setActive(tab);
  };

  const { data: usersForFilter } = useGetUsersForFilterQuery({
    includeInactive: false,
  });

  useEffect(() => {
    if (!usersForFilter) return;
    const options: EmployeeOption[] = usersForFilter.map((u) => ({
      label: u.fullName || u.id,
      value: u.id,
    }));
    setUsers(options);
  }, [usersForFilter]);

  const handleApprove = async (compOffId: string) => {
    if (!canActOnApprovals) {
      toast.error("You do not have permission to approve timesheets.");
      return;
    }
    try {
      setProcessing(compOffId);
      setError("");
      await approveCompOff({ id: compOffId, actorId: user?.id || "" }).unwrap();
      setSuccess("Comp-Off approved successfully!");
      toast.success("Comp-Off approved successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to approve comp-off. Please try again.");
      toast.error("Failed to approve comp-off");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (compOffId: string) => {
    setSelectedCompOff(compOffId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (selectedCompOff && rejectionReason.trim()) {
      try {
        setProcessing(selectedCompOff);
        setError("");
        await rejectCompOff({
          id: selectedCompOff,
          actorId: user?.id || "",
          reason: rejectionReason,
        }).unwrap();
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedCompOff(null);
        setSuccess("Comp-off rejected successfully!");
        toast.success("Comp-off rejected successfully");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Failed to reject comp-off. Please try again.");
        toast.error("Failed to reject comp-off");
      } finally {
        setProcessing(null);
      }
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return dayjs(dateString).tz(userTimezone).format("DD/MM/YYYY");
  };

  // Pending columns
  const pendingColumns: TableColumn<CompOffItem>[] = [
    {
      key: "leaveDate",
      title: "Leave Date",
      label: "Leave Date",
      render: (_v, record) => (
        <div className="flex items-center gap-1 md:gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-xs md:text-sm text-slate-900">
            {formatDate(record?.leaveDate)}
          </span>
        </div>
      ),
    },
    {
      key: "employee",
      title: "Employee",
      label: "Employee",
      required: true,
      className: "min-w-[170px]",
      render: (_, record) => (
        <span className="text-sm text-slate-900 capitalize">
          {record.fullName || "—"}
        </span>
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
      align: "left",
      render: (_, record) => (
        <div className="flex items-center w-[150px]">
          <SimpleTooltip label={record?.comment} side="top">
            <span className="text-sm text-slate-900 max-w-[150px] block overflow-hidden text-ellipsis whitespace-nowrap ">
              {record?.comment}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_v, record) => (
        <Badge
          variant={getCompOffStatusVariant(record?.status)}
          size="middle"
          icon={getStatusIcon(record?.status)}
        >
          {record.statusLabel ?? capitalizeWords(record?.status)}
        </Badge>
      ),
    },
    {
      key: "appliedDate",
      title: "Applied Date",
      label: "Applied Date",
      className: `text-sm text-slate-900`,
      render: (_, record) => formatDate(record?.createdAt),
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
            tooltipClassName=" text-xs shadow-soft border-0"
          >
            <button
              onClick={() => handleViewDetails(record)}
              disabled={!!processing}
              aria-label="View"
              className={`text-primary-600 hover:text-primary-900 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Eye className="w-4 h-4 text-primary-600" aria-hidden="true" />
            </button>
          </SimpleTooltip>

          {canActOnApprovals && (
            <>
              <SimpleTooltip
                label="Approve"
                side="top"
                className="inline-block"
                tooltipClassName=" text-xs shadow-soft border-0"
              >
                <button
                  onClick={() => handleApprove(record?.id)}
                  disabled={!!processing}
                  aria-label="Approve"
                  className={`transition-colors text-green-600 hover:text-green-800 ${!!processing
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
                tooltipClassName=" text-xs shadow-soft border-0"
              >
                <button
                  onClick={() => handleReject(record.id)}
                  disabled={!!processing}
                  aria-label="Reject"
                  className={`transition-colors text-red-600 hover:text-red-800 ${!!processing
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
  ];

  // History columns
  const historyColumns: TableColumn<CompOffItem>[] = [
    {
      key: "leaveDate",
      title: "Leave Date",
      label: "Leave Date",
      render: (_v, record) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-900">
            {formatDate(record?.leaveDate)}
          </span>
        </div>
      ),
    },
    {
      key: "employee",
      title: "Employee",
      label: "Employee",
      required: true,
      className: "min-w-[170px]",
      render: (_, record) => (
        <span className="text-sm text-slate-900 capitalize">
          {record.fullName || "—"}
        </span>
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
      align: "left",
      render: (_, record) => (
        <div className="flex items-center w-[150px]">
          <SimpleTooltip label={record?.comment} side="top">
            <span className="text-sm text-slate-900 max-w-[150px] block overflow-hidden text-ellipsis whitespace-nowrap ">
              {record?.comment}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      label: "Status",
      render: (_v, record) => (
        <Badge
          variant={getCompOffStatusVariant(record?.status)}
          size="middle"
          icon={getStatusIcon(record?.status)}
        >
          {record.statusLabel ?? capitalizeWords(record?.status)}
        </Badge>
      ),
    },
    {
      key: "appliedDate",
      title: "Applied Date",
      label: "Applied Date",
      className: `text-sm text-slate-900`,
      render: (_, record) => formatDate(record?.createdAt),
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
          tooltipClassName="text-xs shadow-soft border-0"
        >
          <button
            onClick={() => handleViewDetails(record)}
            disabled={!!processing}
            aria-label="View"
            className={`relative group text-primary-600 hover:text-primary-900 transition-colors ${!!processing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Eye className="w-4 h-4 text-primary-600" aria-hidden="true" />
          </button>
        </SimpleTooltip>
      ),
    },
  ];

  const [formData, setFormData] = useState<{
    userIds: string[];
    leaveDate: string | null;
    comment: string;
    isFirstHalf: boolean;
    isSecondHalf: boolean;
  }>({
    userIds: [],
    leaveDate: null,
    comment: "",
    isFirstHalf: false,
    isSecondHalf: false,
  });

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  const handleDateChange = (value: Dayjs | null) => {
    const newDate = value ? value.format("YYYY-MM-DD") : "";

    if (value) {
      if (!isWeekOffDate(value.toDate(), weekOffConfig)) {
        showErrorToast(
          "Comp-Off can only be requested for configured week-off days.",
        );

        setFormData((prev) => ({ ...prev, leaveDate: "" }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      leaveDate: newDate,
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleReset = () => {
    setFormData({
      userIds: [],
      leaveDate: null,
      comment: "",
      isFirstHalf: false,
      isSecondHalf: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      showErrorToast("User not found. Please try again.");
      return;
    }

    if (!formData.leaveDate && formData.leaveDate == "") {
      showErrorToast("Please select a leave date.");
      return;
    }

    if (!formData.isFirstHalf && !formData.isSecondHalf) {
      showErrorToast("Please select at least one working period.");
      return;
    }

    try {
      const compOffData = {
        userIds: Array.isArray(formData.userIds)
          ? formData.userIds
          : [formData.userIds],
        leaveDate: formData.leaveDate!,
        comment: formData.comment,
        isFirstHalf: formData.isFirstHalf,
        isSecondHalf: formData.isSecondHalf,
      };

      await createCompOff(compOffData).unwrap();

      setFormData({
        userIds: [],
        leaveDate: "",
        comment: "",
        isFirstHalf: false,
        isSecondHalf: false,
      });

      showSuccessToast(`Comp-Off request submitted successfully!!.`);
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Error submitting leave request:", err);
      const rawMessage =
        err?.response?.data?.message ||
        err?.data?.message ||
        "Failed to submit leave request. Please try again.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      showErrorToast(errorMessage);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-[38] bg-surface-muted px-6 pt-6 pb-4">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Employee Self Service
          </h1>
        </div>
        <TabSelector
          tabs={mainTabs}
          active={active}
          onChange={handleTabChange}
        />
      </div>
      <div className="p-4 sm:p-6 max-w-full mx-auto">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <Trash2 className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {active === "comp-off" &&
          (canActOnApprovals ? (
            <div className="p-6 bg-white max-w-full rounded-xl shadow-soft border border-slate-200 mt-4 mx-auto">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">
                  Create Comp-Off Request
                </h1>
              </div>

              <div className="bg-white mb-8">
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Employee <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formData.userIds}
                        onChange={(vals) =>
                          setFormData({
                            ...formData,
                            userIds: vals as string[],
                          })
                        }
                        options={users}
                        placeholder="Select employee"
                        className="w-full mt-2"
                        searchable={true}
                        multiple={true}
                      />
                    </div>

                    <div>
                      <DatePicker
                        label="Leave Date"
                        required
                        value={
                          formData.leaveDate ? dayjs(formData.leaveDate) : null
                        }
                        onChange={handleDateChange}
                        placeholder="Select date"
                        className="w-full"
                        format="DD/MM/YYYY"
                        allowClear={false}
                        maxDate={dayjs().endOf("day")}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700">
                        Working Period <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center">
                          <input
                            id="firstHalfCheckbox"
                            type="checkbox"
                            name="isFirstHalf"
                            checked={formData.isFirstHalf}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                          />
                          <label
                            htmlFor="firstHalfCheckbox"
                            className="ml-2 text-sm text-slate-700 cursor-pointer"
                          >
                            1st Half
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="secondHalfCheckbox"
                            type="checkbox"
                            name="isSecondHalf"
                            checked={formData.isSecondHalf}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                          />
                          <label
                            htmlFor="secondHalfCheckbox"
                            className="ml-2 text-sm text-slate-700 cursor-pointer"
                          >
                            2nd Half
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <TextArea
                      label="Comment"
                      value={formData.comment}
                      onChange={(value) =>
                        setFormData({ ...formData, comment: value })
                      }
                      placeholder="Please provide your reason & timesheet data here..."
                      required
                    />
                  </div>

                  <div className="flex items-center gap-4 justify-end">
                    <Button
                      htmlType="button"
                      appearance="secondary"
                      size="large"
                      onClick={handleReset}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      appearance="primary"
                      size="large"
                      loading={submitting}
                      icon={<FileText className="w-5 h-5" />}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-xl shadow-soft border border-slate-200 mt-4 text-center">
              <p className="text-md text-slate-600">
                You do not have permission to create Comp-Off Requests.
              </p>
            </div>
          ))}

        {/* Comp-Off Approvals (Pending & History) - Moved here from Notification */}
        {active === "comp-off" && (
          <div className="space-y-6 mt-8">
            <div className="bg-white rounded-xl shadow-soft border border-slate-200">
              {activeAccordion !== "pending" ? (
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                  onClick={() => setActiveAccordion("pending")}
                >
                  <span className="text-xl font-bold text-slate-900">
                    Comp-Off Request Approval ({pendingTotal})
                  </span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-0">
                  <div className="max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <ConfigurableTable<CompOffItem>
                      columns={pendingColumns}
                      data={pendingCompOff}
                      loading={pendingLoading}
                      skeleton={<TimesheetManagementSkeleton rows={pendingLimit} />}
                      emptyMessage="No pending comp-off found"
                      rowKey={(c) => c.id}
                      configOptions={{ persistenceKey: "comp-off-pending-table" }}
                      spacing={0}
                      renderColumnSelector={(selector) => (
                        <div
                          className="w-full text-left px-4 py-3 border-b flex items-center justify-between gap-3 cursor-pointer"
                          onClick={() => setActiveAccordion("history")}
                        >
                          <span className="text-xl font-bold text-slate-900">
                            Comp-Off Request Approval ({pendingTotal})
                          </span>
                          <div className="flex items-center gap-4">
                            <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                            <ChevronUp className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <div className="p-6 pt-0 mt-4">
                    <Pagination
                      currentPage={pendingPage}
                      totalItems={pendingTotal}
                      itemsPerPage={pendingLimit}
                      onPageChange={setPendingPage}
                      onItemsPerPageChange={(l) => {
                        setPendingLimit(l);
                        setPendingPage(1);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-soft border border-slate-200">
              {activeAccordion !== "history" ? (
                <button
                  className="w-full text-left p-4 flex items-center justify-between"
                  onClick={() => setActiveAccordion("history")}
                >
                  <span className="text-xl font-bold text-slate-900">
                    Comp-Off Approval History ({historyTotal})
                  </span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-0">
                  <div className="max-h-[90vh] overflow-y-auto scrollbar-hide">
                    <ConfigurableTable<CompOffItem>
                      columns={historyColumns}
                      data={historyCompOff}
                      loading={historyLoading}
                      skeleton={<TimesheetManagementSkeleton rows={historyLimit} />}
                      emptyMessage="No historical comp-off found"
                      rowKey={(c) => c.id}
                      configOptions={{ persistenceKey: "comp-off-history-table" }}
                      spacing={0}
                      renderColumnSelector={(selector) => (
                        <div
                          className="w-full text-left p-4 border-b flex items-center justify-between cursor-pointer"
                          onClick={() => setActiveAccordion("pending")}
                        >
                          <span className="text-xl font-bold text-slate-900">
                            Comp-Off Approval History ({historyTotal})
                          </span>
                          <div className="flex items-center gap-4">
                            <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                            <ChevronUp className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    />
                  </div>

                  <div className="p-6 pt-0 mt-4">
                    <Pagination
                      currentPage={historyPage}
                      totalItems={historyTotal}
                      itemsPerPage={historyLimit}
                      onPageChange={setHistoryPage}
                      onItemsPerPageChange={(l) => {
                        setHistoryLimit(l);
                        setHistoryPage(1);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {active === "notification" && (
          <div className="space-y-6 mt-4">
            {/* Comp-Off Pending Accordion in Notifications */}
            <div className="bg-white rounded-xl shadow-soft border border-slate-200">
              {activeAccordion !== "pending" ? (
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3"
                  onClick={() => setActiveAccordion("pending")}
                >
                  <span className="text-xl font-bold text-slate-900">
                    Comp-Off Request Approval ({pendingTotal})
                  </span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              ) : (
                <div className="p-0">
                  <ConfigurableTable<CompOffItem>
                    columns={pendingColumns}
                    data={pendingCompOff}
                    loading={pendingLoading}
                    skeleton={<TimesheetManagementSkeleton rows={pendingLimit} />}
                    emptyMessage="No pending comp-off found"
                    rowKey={(c) => c.id}
                    configOptions={{ persistenceKey: "comp-off-pending-table-notif" }}
                    spacing={0}
                    renderColumnSelector={(selector) => (
                      <div
                        className="w-full text-left px-4 py-3 border-b flex items-center justify-between gap-3 cursor-pointer"
                        onClick={() => setActiveAccordion("history")}
                      >
                        <span className="text-xl font-bold text-slate-900">
                          Comp-Off Request Approval ({pendingTotal})
                        </span>
                        <div className="flex items-center gap-4">
                          <div onClick={(e) => e.stopPropagation()}>{selector}</div>
                          <ChevronUp className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  />
                  <div className="p-6 pt-0 mt-4">
                    <Pagination
                      currentPage={pendingPage}
                      totalItems={pendingTotal}
                      itemsPerPage={pendingLimit}
                      onPageChange={setPendingPage}
                      onItemsPerPageChange={(l) => {
                        setPendingLimit(l);
                        setPendingPage(1);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <DocumentApprovalAdminTab hideHistory={true} hideFilters={true} />
            {gameBookingEnabled && <GameBookingAdminTab hideHistory={true} hideFilters={true} />}
          </div>
        )}

        {active === "game-booking" && gameBookingEnabled && (
          <GameBookingAdminTab />
        )}

        {active === "document-approvals" && (
          <DocumentApprovalAdminTab />
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <RejectionModal
            rejectionReason={rejectionReason}
            selectedLeave={selectedCompOff}
            confirmReject={confirmReject}
            processing={processing}
            setRejectionReason={setRejectionReason}
            setSelectedLeave={setSelectedCompOff}
            setShowRejectModal={setShowRejectModal}
            title="Reject Comp-Off Request"
            description="Please provide a reason for rejecting this comp-off entry."
          />
        )}

        {/* View Modal */}
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="Comp-Off Details"
          size="md"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-900">
                <div>
                  <p className="font-medium text-slate-600 ">Employee</p>
                  <p className="text-sm text-slate-900 capitalize whitespace-pre-wrap">
                    {(() => {
                      const { firstName, lastName } =
                        selectedRequest.userId as unknown as {
                          firstName?: string;
                          lastName?: string;
                        };

                      return `${firstName || "unkown user"} ${lastName || ""
                        }`.trim();
                    })()}
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-600">Leave Date</p>
                  <p>{formatDate(selectedRequest.leaveDate)}</p>
                </div>

                <div>
                  <p className="font-medium text-slate-600">Working Period</p>
                  <p>
                    <span className="text-sm text-slate-900">
                      {selectedRequest.isFirstHalf &&
                        selectedRequest.isSecondHalf
                        ? "Full Day"
                        : selectedRequest.isFirstHalf
                          ? "First Half"
                          : selectedRequest.isSecondHalf
                            ? "Second Half"
                            : "None"}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="font-medium text-slate-600">Status</p>
                  <div
                    className={`flex w-fit px-3 py-1 items-center rounded-full whitespace-nowrap border ${getStatusColor(
                      selectedRequest.status,
                    )}`}
                  >
                    <span className="flex-shrink-0">
                      {getStatusIcon(selectedRequest.status)}
                    </span>

                    <span className="ml-2 text-xs font-semibold capitalize">
                      {selectedRequest.statusLabel ?? selectedRequest.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-slate-600">Applied On</p>
                  <p>{formatDate(selectedRequest.createdAt)}</p>
                </div>

                {selectedRequest?.actorId && (
                  <div>
                    <p className="font-medium text-slate-600 ">
                      {COMP_OFF_APPROVED_STATUSES.includes(
                        selectedRequest?.status,
                      )
                        ? "Approved By"
                        : "Rejected By"}
                    </p>
                    <p className="text-sm text-slate-900 capitalize whitespace-pre-wrap">
                      {(() => {
                        const { firstName, lastName } =
                          selectedRequest.actorId as unknown as {
                            firstName?: string;
                            lastName?: string;
                          };

                        return `${firstName || "admin"} ${lastName || ""}`.trim();
                      })()}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-slate-600 ">Comment</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">
                  {selectedRequest.comment}
                </p>
              </div>

              {selectedRequest.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="font-medium text-red-700 text-sm">
                    Rejection Reason
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    {selectedRequest.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default EmployeeSelfService;
