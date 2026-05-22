import React, { useState, useEffect } from "react";

import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs, { Dayjs } from "dayjs";

import { useGetCurrentYearHolidaysQuery, type IHoliday } from "../../store/apis/holidayManagement.api";
import {
  useGetMyLeavesQuery,
  useCreateLeaveMutation,
  usePullbackLeaveMutation,
  useGetMyLeaveBalanceQuery,
} from "../../store/apis/leave.api";
import type { ILeaveBalanceUI } from "../../types/leave.api.types";
import { useAuth } from "../../store/hooks/useAuth";
import {
  ConfirmationModal,
  Modal,
  Select,
  DatePicker,
  Button,
} from "../common";
import LeaveTableSection from "./components/LeaveTableSection";
import {
  getWorkflowStatusColor,
  getWorkflowStatusFallbackLabel,
  isPendingWorkflowStatus,
  WORKFLOW_APPROVED_STATUSES,
  WORKFLOW_REJECTED_STATUSES,
  WORKFLOW_CANCELLED_STATUSES,
  WorkflowStatusCode,
  LeaveTypesEnum,
  LeaveTypeLabel,
  Leaves,
} from "../../utils/constants";
import { ILeaveRequest as LeaveRequestType } from "../../types/leave.types";
import { LeaveTableSectionSkeleton } from "./Skeleton";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import Badge from "../common/Badge";
import { getWorkflowStatusVariant } from "../../utils/badgeVariants";
import { TextArea } from "../common/TextArea";
import type { ApiError } from "../../store/utils/apiError";
import type { ILeave } from "../../types/leave.api.types";

type LeaveRequest = LeaveRequestType;

interface LeaveBalance {
  [key: string]: number;
}

interface Holiday {
  id?: string;
  name: string;
  date: string;
  year: number;
  isMandatory: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_PAGE_SIZE = 10;

const MyLeaves: React.FC = () => {
  const { user } = useAuth();
  const [createLeave, { isLoading: creating }] = useCreateLeaveMutation();
  const [pullbackLeave, { isLoading: pullingBack }] =
    usePullbackLeaveMutation();

  const canManage = useHasPermission(PERMISSIONS.APPLY_LEAVE_MANAGE);

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance>({});

  const [availableLeaveType, setAvailableLeaveType] = useState<
    ILeaveBalanceUI["types"]
  >([]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [confirmTarget, setConfirmTarget] = useState<LeaveRequest | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );

  const [optionalLeaves, setOptionalLeaves] = useState<Holiday[]>([]); // optional leaves
  const [optionalLeave, setOptionalLeave] = useState<string>(""); //selected optional leave

  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    itemsPerPage: DEFAULT_PAGE_SIZE,
    totalItems: 0,
  });

  const {
    data: leavePayload,
    isLoading,
    isFetching,
  } = useGetMyLeavesQuery(
    {
      page: paginationState.currentPage,
      limit: paginationState.itemsPerPage,
    },
    {
      skip: !user?.id,
    },
  );

  const { data: balancePayload } = useGetMyLeaveBalanceQuery(
    {},
    {
      skip: !user?.id,
    },
  );

  // Added this useEffect to populate available leave types and balances
  useEffect(() => {
    if (!balancePayload?.types) return;
    const balances: LeaveBalance = {};

    balancePayload.types.forEach((t) => {
      balances[t.code] = t.available;
    });

    setLeaveBalances(balances);
    setAvailableLeaveType(balancePayload.types);
  }, [balancePayload]);

  const leaveRequests: LeaveRequest[] =
    leavePayload?.data?.map((r: ILeave) => ({
      ...r,
      id: r.id,
      leaveType: r.leaveType as LeaveRequest['leaveType'],
      reason: r.reason ?? '',
      status: r.status as LeaveRequest['status'],
      isHalfDay: r.isHalfDay ?? false,
      appliedDate: r.createdAt,
    })) ?? [];

  // Form state
  const [formData, setFormData] = useState({
    leaveType: "",
    leaveTypeCode: "",
    startDate: "",
    endDate: "",
    reason: "",
    isHalfDay: false,
    halfDayType: "first_half", //for now we will put it  default to first half, as there is no UI to select half day type
  });

  const showErrorToast = (message: string) => {
    toast.error(message);
  };

  const showSuccessToast = (message: string) => {
    toast.success(message);
  };

  useEffect(() => {
    if (leavePayload?.total) {
      setPaginationState((prev) => ({
        ...prev,
        totalItems: leavePayload.total,
      }));
    }
  }, [leavePayload]);

  const { data: holidaysData } = useGetCurrentYearHolidaysQuery();

  useEffect(() => {
    // getCurrentYearHolidays returns the array directly (transformResponse unwraps backend { data } and returns the list)
    const list: IHoliday[] = Array.isArray(holidaysData) ? holidaysData : [];
    const mapped: Holiday[] = list.map((h) => ({
      id: h.id,
      name: h.name,
      date: h.date,
      year: h.year,
      isMandatory: h.isMandatory,
      description: h.description,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));
    setOptionalLeaves(mapped.filter((leave) => !leave.isMandatory));
  }, [holidaysData]);

  const handleHistoryPageChange = (page: number) => {
    setPaginationState((prev) => ({ ...prev, currentPage: page }));
  };

  const handleHistoryItemsPerPageChange = (itemsPerPage: number) => {
    setPaginationState((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
    }));
  };

  const canPullback = (req: LeaveRequest): boolean => {
    if (!isPendingWorkflowStatus(req.status)) return false;
    const todayStr = new Date().toISOString().split("T")[0];
    return req.startDate > todayStr;
  };
  const onPullbackClick = (req: LeaveRequest) => {
    setConfirmTarget(req);
    setConfirmOpen(true);
  };

  const confirmPullback = async () => {
    if (!user?.id || !confirmTarget) return;
    try {
      setConfirmLoading(true);
      await pullbackLeave({
        id: confirmTarget.id,
        body: {},
      }).unwrap();
      showSuccessToast("Leave pulled back successfully.");
    } catch (error: unknown) {
      const err = error as ApiError;
      const rawMessage = err?.data?.message || err?.message || "Failed to pull back leave.";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      showErrorToast(errorMessage);
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  const handleLeaveTypeChange = (
    value: string | number | (string | number)[],
  ) => {
    if (Array.isArray(value)) return;
    const selected = availableLeaveType.find((t) => t.id === value);
    setFormData((prev) => {
      const newData = {
        ...prev,
        leaveType: value as string,
        leaveTypeCode: selected?.code || "",
        // Reset isHalfDay if switching to optional_holiday as it doesn't support half days
        isHalfDay:
          value === LeaveTypesEnum.OPTIONAL_HOLIDAY ? false : prev.isHalfDay,
      };

      // Clear dates if leave type changes to flexi_weekend and dates are not Saturdays
      if (value === "flexi_weekend") {
        if (newData.startDate) {
          const startDate = new Date(newData.startDate);
          if (startDate.getDay() !== 6) {
            // 6 = Saturday
            newData.startDate = "";
          }
        }
        if (newData.endDate) {
          const endDate = new Date(newData.endDate);
          if (endDate.getDay() !== 6) {
            // 6 = Saturday
            newData.endDate = "";
          }
        }
      }

      return newData;
    });
  };

  const handleStartDateChange = (value: Dayjs | null) => {
    const newStartDate = value ? value.format("YYYY-MM-DD") : "";

    if (value && value.day() === 0) {
      showErrorToast(
        "Leave cannot start on Sunday. Please select another start date.",
      );
      return;
    }

    setFormData((prev) => {
      if (newStartDate && prev.endDate) {
        const start = new Date(newStartDate);
        const end = new Date(prev.endDate);
        if (start > end) {
          showErrorToast("Start date cannot be after end date.");
          return {
            ...prev,
            startDate: newStartDate,
            endDate: "",
          };
        }
      }

      return {
        ...prev,
        startDate: newStartDate,
      };
    });
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    const newEndDate = value ? value.format("YYYY-MM-DD") : "";

    setFormData((prev) => {
      if (newEndDate && prev.startDate) {
        const start = new Date(prev.startDate);
        const end = new Date(newEndDate);
        if (end < start) {
          showErrorToast(
            "End date must be greater than or equal to start date.",
          );
          return prev;
        }
      }

      return {
        ...prev,
        endDate: newEndDate,
      };
    });
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

  const calculateDays = (
    startDate: string,
    endDate: string,
    isHalfDay: boolean,
  ): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isHalfDay ? diffDays * 0.5 : diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      showErrorToast("User not found. Please try again.");
      return;
    }
    if (!formData.leaveType) {
      showErrorToast("Please select a leave type.");
      return;
    }

    if (formData.startDate) {
      const startDay = new Date(formData.startDate).getDay();
      if (startDay === 0) {
        showErrorToast("Cannot make a leave request on Sunday.");
        return;
      }
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      const spansSunday = (() => {
        const cursor = new Date(start);
        while (cursor <= end) {
          if (cursor.getDay() === 0) return true;
          cursor.setDate(cursor.getDate() + 1);
        }
        return false;
      })();

      if (spansSunday) {
        showErrorToast("You cannot include Sunday(s) in the Leave Duration.");
        return;
      }

      if (end < start) {
        showErrorToast("End date must be greater than or equal to start date.");
        return;
      }
    }

    const requestedDays = calculateDays(
      formData.startDate,
      formData.endDate,
      formData.isHalfDay,
    );

    if (requestedDays <= 0) {
      showErrorToast("Please select valid start and end dates.");
      return;
    }

    if (formData.reason.trim() === "") {
      showErrorToast("Please enter a reason for the leave request.");
      return;
    }

    if (formData.leaveType === "flexi_weekend") {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      const startDay = startDate.getDay();
      const endDay = endDate.getDay();

      if (startDay !== 6) {
        showErrorToast(
          "Flexi Weekend Leave can only be applied for Saturdays. Please select a Saturday for the start date.",
        );
        return;
      }

      if (endDay !== 6) {
        showErrorToast(
          "Flexi Weekend Leave can only be applied for Saturdays. Please select a Saturday for the end date.",
        );
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const nonSaturdayDates: string[] = [];

      for (
        let d = new Date(start.getTime());
        d <= end;
        d.setDate(d.getDate() + 1)
      ) {
        if (d.getDay() !== 6) {
          nonSaturdayDates.push(d.toISOString().split("T")[0]);
        }
      }

      if (nonSaturdayDates.length > 0) {
        showErrorToast(
          `Flexi Weekend Leave can only be applied for Saturdays. The following dates in your range are not Saturdays: ${nonSaturdayDates.join(
            ", ",
          )}`,
        );
        return;
      }
    }

    if (
      formData.leaveTypeCode !== "lwp" &&
      formData.leaveTypeCode !== "wfh" &&
      formData.leaveTypeCode !== "optional_holiday"
    ) {
      const availableBalance = leaveBalances[formData.leaveTypeCode] || 0;

      if (requestedDays > availableBalance) {
        showErrorToast(
          `Insufficient leave balance. You have ${availableBalance} days available.`,
        );
        return;
      }
    }
    try {
      const leaveData = {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: requestedDays,
        reason: formData.reason,
        isHalfDay: formData.isHalfDay,

        ...(formData.isHalfDay && {
          halfDayType: formData.halfDayType as 'first_half' | 'second_half',
        }),
      };
      await createLeave(leaveData).unwrap();

      setFormData({
        leaveTypeCode: "",
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        isHalfDay: false,
        halfDayType: "first_half",
      });

      showSuccessToast(
        `Leave request submitted successfully! ${requestedDays} day(s).`,
      );
    } catch (error: unknown) {
      const err = error as ApiError;
      console.error("Error submitting leave request:", err);
      const rawMessage = err?.data?.message || err?.message || "Failed to submit leave request. Please try again.";
      const errorMessage = Array.isArray(rawMessage) ? rawMessage.join(", ") : rawMessage;
      showErrorToast(errorMessage);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusCode = status as WorkflowStatusCode;
    if (isPendingWorkflowStatus(status)) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    if (WORKFLOW_APPROVED_STATUSES.includes(statusCode)) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (WORKFLOW_REJECTED_STATUSES.includes(statusCode)) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (WORKFLOW_CANCELLED_STATUSES.includes(statusCode)) {
      return <AlertCircle className="w-4 h-4 text-slate-500" />;
    }
    return <Clock className="w-4 h-4 text-slate-400" />;
  };

  const handleOptionalLeaveChange = (value: string) => {
    setFormData({
      ...formData,
      startDate:
        optionalLeaves.find((leave) => leave.id === value)?.date || "",
      endDate: optionalLeaves.find((leave) => leave.id === value)?.date || "",
      isHalfDay: false,
    });
  };

  const getStatusColor = (status: string) => getWorkflowStatusColor(status);


  const getStatusLabel = (request: LeaveRequest) =>
    request.statusLabel ||
    getWorkflowStatusFallbackLabel(request.status, request.currentActorName);
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—"; // Return dash for missing dates

    const dateOnly = dateString.split("T")[0];
    const [year, month, day] = dateOnly
      .split("-")
      .map((num) => parseInt(num, 10));
    const localDate = new Date(year, month - 1, day);

    return localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
            Apply Leave
          </h1>
        </div>
      </div>

      {/* Apply Leave Form */}
      {canManage && (
        <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Leave Type"
                  loading={isLoading}
                  required
                  value={formData.leaveType}
                  onChange={handleLeaveTypeChange}
                  options={availableLeaveType.map((type) => ({
                    value: type.id,
                    label: `${type.label}${type.code !== "lwp" &&
                        type.code !== "wfh" &&
                        type.code !== "optional_holiday"
                        ? ` (${type.available} days available)`
                        : ""
                      }`,
                  }))}
                  placeholder="Select leave type"
                  className="w-full"
                  searchable={false}
                />
              </div>
              {formData.leaveTypeCode === "optional_holiday" ? (
                <Select
                  label="Optional Leaves"
                  required
                  value={optionalLeave}
                  onChange={(value) => {
                    setOptionalLeave(value as string);
                    handleOptionalLeaveChange(value as string);
                  }}
                  options={optionalLeaves.map((type) => {
                    return {
                      value: type.id || "",
                      label: `${type.name} - ${dayjs(type.date).format("DD/MM/YYYY")}`,
                    };
                  })}
                  placeholder="Select optional leave"
                  className="w-full"
                  searchable={false}
                />
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Half Day
                  </label>
                  <div className="flex items-center">
                    <input
                      id="isHalfDay"
                      type="checkbox"
                      name="isHalfDay"
                      checked={formData.isHalfDay}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded cursor-pointer"
                    />
                    <label
                      htmlFor="isHalfDay"
                      className="ml-2 text-sm text-slate-700 cursor-pointer"
                    >
                      Apply for half day
                    </label>
                  </div>
                </div>
              )}
            </div>

            {formData.leaveType != LeaveTypesEnum.OPTIONAL_HOLIDAY && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <DatePicker
                    label="Start Date"
                    required
                    value={
                      formData.startDate ? dayjs(formData.startDate) : null
                    }
                    onChange={handleStartDateChange}
                    placeholder="Select start date"
                    className="w-full"
                    format="DD/MM/YYYY"
                    allowClear={false}
                    disabledDates={(date) => date.day() === 0}
                  />
                  {formData.startDate &&
                    formData.leaveType === "flexi_weekend" &&
                    new Date(formData.startDate).getDay() !== 6 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>
                            Flexi Weekend Leave can only be applied for
                            Saturdays. Please select a Saturday.
                          </span>
                        </div>
                      </div>
                    )}
                </div>

                <div>
                  <DatePicker
                    label="End Date"
                    required
                    value={formData.endDate ? dayjs(formData.endDate) : null}
                    onChange={handleEndDateChange}
                    placeholder="Select end date"
                    className="w-full"
                    format="DD/MM/YYYY"
                    allowClear={false}
                    minDate={
                      formData.startDate ? dayjs(formData.startDate) : undefined
                    }
                    disabledDates={(date) => {
                      if (formData.startDate) {
                        return date.isBefore(dayjs(formData.startDate), "day");
                      }
                      return false;
                    }}
                  />
                  {formData.endDate &&
                    formData.leaveType === "flexi_weekend" &&
                    new Date(formData.endDate).getDay() !== 6 && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center text-red-700 text-sm">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span>
                            Flexi Weekend Leave can only be applied for
                            Saturdays. Please select a Saturday.
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            <div>
              <TextArea
                label="Reason"
                value={formData.reason ?? ""}
                onChange={(value: string) =>
                  setFormData({ ...formData, reason: value })
                }
                placeholder="Please provide a reason for your leave request..."
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <Button
                htmlType="submit"
                appearance="primary"
                disabled={creating}
                icon={<FileText className="w-5 h-5" />}
                className="w-full md:w-auto flex items-center justify-center md:justify-start"
              >
                {creating ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <LeaveTableSectionSkeleton />
      ) : (
        <LeaveTableSection
          title="Leave History"
          requests={leaveRequests}
          loading={isFetching}
          onViewDetails={handleViewDetails}
          onPullback={canManage ? onPullbackClick : () => { }}
          canPullback={canManage ? canPullback : () => false}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          formatDate={formatDate}
          pagination={{
            currentPage: paginationState.currentPage,
            itemsPerPage: paginationState.itemsPerPage,
            totalItems: paginationState.totalItems,
            onPageChange: handleHistoryPageChange,
            onItemsPerPageChange: handleHistoryItemsPerPageChange,
          }}
        />
      )}

      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Leave Details"
        size="md"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-900">
              <div>
                <p className="font-medium text-slate-600">Leave Type</p>
                <p>{selectedRequest.leaveTypeName}</p>
              </div>

              <div>
                <p className="font-medium text-slate-600">Period</p>
                <p>
                  {formatDate(selectedRequest.startDate)} -{" "}
                  {formatDate(selectedRequest.endDate)}
                </p>
              </div>

              <div>
                <p className="font-medium text-slate-600">Applied On</p>
                <p>{formatDate(selectedRequest.appliedDate)}</p>
              </div>
              <div>
                <p className="font-medium text-slate-600">Status</p>
                <div className="flex items-center mt-1 gap-2">
                  <Badge
                    variant={getWorkflowStatusVariant(selectedRequest.status)}
                    size="middle"
                  >
                    {getStatusIcon(selectedRequest.status)}
                    {getStatusLabel(selectedRequest)}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="font-medium text-slate-600">Days</p>
                <p>
                  {selectedRequest.days}{" "}
                  {selectedRequest.isHalfDay ? "half" : "full"} day
                  {selectedRequest.days !== 1 ? "s" : ""}
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-600 ">Reason</p>
                <p className="text-sm text-slate-900 whitespace-pre-wrap">
                  {selectedRequest.reason}
                </p>
              </div>
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
        title="Pull back leave request"
        message={
          confirmTarget
            ? `Are you sure you want to pull back your ${confirmTarget.leaveTypeName}
               
              for ${formatDate(confirmTarget.startDate)} - ${formatDate(
              confirmTarget.endDate,
            )}?`
            : ""
        }
        type="warning"
        confirmText={confirmLoading ? "Pulling back..." : "Pull back"}
        isLoading={confirmLoading}
      />
    </div>
  );
};

export default MyLeaves;
