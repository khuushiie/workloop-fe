import React, { useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { ApiError } from "../../store/utils/apiError";
import dayjs, { Dayjs } from "dayjs";
import { useAuth } from "../../store/hooks/useAuth";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store";
import { isWeekOffDate, type WeekOffConfig } from "../../utils/weekOff";
import { ConfirmationModal, Modal, DatePicker, Button } from "../common";
import {
  isPendingCompOffStatus,
  CompOffStatusCode,
  COMP_OFF_APPROVED_STATUSES,
  COMP_OFF_REJECTED_STATUSES,
  COMP_OFF_CANCELLED_STATUSES,
  getCompOffStatusColor,
} from "../../utils/constants";
import type { CompOffItem } from "../../store/apis/compOff.api";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import CompensatoryLeaveTable from "./component/CompensatoryLeaveTable";
import TabSelector, { TabKey } from "./component/TabSelector";
import { TextArea } from "../common/TextArea";
import {
  useGetCompOffListQuery,
  useCreateCompOffMutation,
  usePullBackCompOffMutation,
} from "../../store/apis/compOff.api";
import { useFeatureFlags } from "../../contexts/FeatureFlagsContext";
import { FEATURE_FLAGS } from "../../utils/constants";
import GameBookingTab from "./component/GameBookingTab";

const DEFAULT_PAGE_SIZE = 10;

const LeaveCompOff: React.FC = () => {
  const { user } = useAuth();
  const weekOffConfig = useAppSelector(
    (state: RootState) => state.auth.weekOffConfig,
  );
  const userTimezone = dayjs.tz.guess();
  const canManage = useHasPermission(PERMISSIONS.EMPLOYEE_SELF_SERVICE_MANAGE);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<CompOffItem | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CompOffItem | null>(
    null,
  );
  const [active, setActive] = useState<TabKey>("comp-off");
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    itemsPerPage: DEFAULT_PAGE_SIZE,
  });
  const [formData, setFormData] = useState({
    leaveDate: "",
    comment: "",
    isFirstHalf: false,
    isSecondHalf: false,
  });

  const listParams = {
    userId: user?.id ?? "",
    page: paginationState.currentPage,
    limit: paginationState.itemsPerPage,
  };
  const {
    data: listResponse,
    isLoading: historyLoading,
    refetch: refetchList,
  } = useGetCompOffListQuery(listParams, {
    skip: !user?.id,
  });
  const [createCompOff, { isLoading: submitting }] = useCreateCompOffMutation();
  const [pullBackCompOff, { isLoading: pullBackLoading }] =
    usePullBackCompOffMutation();

  const compOffRequests = listResponse?.data ?? [];
  const totalItems = listResponse?.total ?? 0;

  const { isEnabled } = useFeatureFlags();
  const gameBookingEnabled = isEnabled(FEATURE_FLAGS.SHOW_GAME_BOOKING);

  const mainTabs: { k: TabKey; label: string }[] = [
    { k: "comp-off", label: "Comp-Off Request" },
    ...(gameBookingEnabled
      ? [{ k: "game-booking" as TabKey, label: "Game Booking" }]
      : []),
  ];

  const showErrorToast = (message: string) => toast.error(message);
  const showSuccessToast = (message: string) => toast.success(message);

  const handleTabChange = (tab: TabKey) => {
    if (tab === "comp-off") refetchList();
    setActive(tab);
  };

  const handleHistoryPageChange = (page: number) => {
    setPaginationState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleHistoryItemsPerPageChange = (itemsPerPage: number) => {
    setPaginationState({ currentPage: 1, itemsPerPage });
  };

  const onPullbackClick = (req: CompOffItem) => {
    setConfirmTarget(req);
    setConfirmOpen(true);
  };

  const canPullback = (req: CompOffItem): boolean => {
    if (!isPendingCompOffStatus(req.status)) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    const leaveDateStr =
      typeof req.leaveDate === "string" ? req.leaveDate.split("T")[0] : "";
    return leaveDateStr > todayStr;
  };

  const confirmPullback = async () => {
    if (!user?.id || !confirmTarget?.id) return;
    try {
      setConfirmLoading(true);
      await pullBackCompOff({
        id: confirmTarget.id,
        userId: user.id,
      }).unwrap();
      showSuccessToast("Comp-off pulled back successfully.");
      setConfirmOpen(false);
      setConfirmTarget(null);
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage =
        err?.data?.message || err?.message || "Failed to pull back.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      showErrorToast(errorMessage);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleViewDetails = (request: CompOffItem) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
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
      leaveDate: "",
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
    if (!formData.leaveDate) {
      showErrorToast("Please select a leave date.");
      return;
    }
    if (!formData.isFirstHalf && !formData.isSecondHalf) {
      showErrorToast("Please select at least one working period.");
      return;
    }
    if (formData.leaveDate && dayjs(formData.leaveDate).isAfter(dayjs())) {
      showErrorToast("You cannot select a future date.");
      return;
    }
    const commentValue = formData.comment ? formData.comment.trim() : "";
    const commentRegex = /^(?=.*[a-zA-Z]).{10,}$/;
    if (!commentRegex.test(commentValue)) {
      showErrorToast(
        "Comments must be at least 10 characters long and contain at least one letter.",
      );
      return;
    }
    try {
      const response = await createCompOff({
        userIds: [user.id],
        leaveDate: formData.leaveDate,
        comment: formData.comment,
        isFirstHalf: formData.isFirstHalf,
        isSecondHalf: formData.isSecondHalf,
      }).unwrap();
      const results = response?.results ?? [];
      const skipped = response?.skipped ?? [];
      if (skipped.length > 0) {
        showErrorToast(`Request already exists for: ${skipped.join(", ")}`);
      }
      if (results.length > 0) {
        showSuccessToast("Leave request submitted successfully!");
        setFormData({
          leaveDate: "",
          comment: "",
          isFirstHalf: false,
          isSecondHalf: false,
        });
      }
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage =
        err?.data?.message ||
        "Failed to submit leave request. Please try again.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage;
      showErrorToast(errorMessage);
    }
  };

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

  const getStatusLabel = (request: CompOffItem) =>
    request.statusLabel ?? request.status;

  const formatDate = (dateString: string) => {
    return dayjs(dateString).tz(userTimezone).format("DD/MM/YYYY");
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
      <div className="px-6 max-w-full mx-auto">
        {active === "comp-off" &&
          (canManage ? (
            <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mt-4 mb-8">
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-4">
                  Comp-Off Request
                </h1>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <DatePicker
                      label="Select Date"
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
                    <label className="text-sm font-semibold text-slate-700 ">
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
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                        />
                        <label
                          htmlFor="firstHalfCheckbox"
                          className="ml-2 text-sm text-slate-700"
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
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
                        />
                        <label
                          htmlFor="secondHalfCheckbox"
                          className="ml-2 text-sm text-slate-700"
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
                    minRows={6}
                    minLength={10}
                  />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <Button
                    htmlType="button"
                    appearance="secondary"
                    size="middle"
                    onClick={handleReset}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    appearance="primary"
                    size="middle"
                    loading={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-xl shadow-soft border border-slate-200 mt-4 text-center mb-8">
              <p className="text-md text-slate-600">
                You do not have permission to create Comp-Off Requests.
              </p>
            </div>
          ))}

        {active === "game-booking" && gameBookingEnabled && <GameBookingTab />}

        {active === "comp-off" && (
          <CompensatoryLeaveTable
            title="Comp-Off Request History"
            requests={compOffRequests}
            loading={historyLoading}
            onViewDetails={handleViewDetails}
            onPullback={canManage ? onPullbackClick : () => {}}
            canPullback={canManage ? canPullback : () => false}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
            pagination={{
              currentPage: paginationState.currentPage,
              itemsPerPage: paginationState.itemsPerPage,
              totalItems,
              onPageChange: handleHistoryPageChange,
              onItemsPerPageChange: handleHistoryItemsPerPageChange,
            }}
          />
        )}

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
                  <p className="font-medium text-slate-600">Applied On</p>
                  <p>{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-600">Status</p>
                  <div
                    className={`flex w-fit px-3 py-1 items-center rounded-full whitespace-nowrap border ${getStatusColor(selectedRequest.status)}`}
                  >
                    <span className="flex-shrink-0">
                      {getStatusIcon(selectedRequest.status)}
                    </span>

                    <span className="ml-2 text-xs font-semibold capitalize">
                      {selectedRequest.statusLabel ?? selectedRequest.status}
                    </span>
                  </div>
                </div>
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

        <ConfirmationModal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={confirmPullback}
          title="Pull back comp-off request"
          message={
            confirmTarget
              ? `Are you sure you want to pull back your comp-off request?`
              : ""
          }
          type="warning"
          confirmText={
            confirmLoading || pullBackLoading ? "Pulling back..." : "Pull back"
          }
          isLoading={confirmLoading || pullBackLoading}
        />
      </div>
    </>
  );
};

export default LeaveCompOff;
