import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import {
  FileText,
  Calendar,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import {
  useLazyGetCalendarDataQuery,
  useLazyGetTodayStatusByDateQuery,
  IBreak,
} from "../../store/apis/attendance.api";
import {
  Modal,
  ConfirmationModal,
  DatePicker,
  Select,
  Button,
  SimpleTooltip,
  ConfigurableTable,
} from "../common";
import { TableColumn } from "../common/Table";
import {
  getWorkflowStatusColor,
  getWorkflowStatusFallbackLabel,
  isPendingWorkflowStatus,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
  WorkflowStatusCode,
} from "../../utils/constants";
import { useTimezone } from "../../hooks/useTimezone";
import { RegularizationTableSkeleton } from "./Skeleton";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import Badge from "../common/Badge";
import { getWorkflowStatusVariant } from "../../utils/badgeVariants";
import { getWorkflowStatusIcon } from "./regularization-management/tableColumns";
import { TextArea } from "../common/TextArea";
import { useAuth } from "../../store/hooks/useAuth";
import {
  ICreateRegularizationPayload,
  IRegularizationRequest,
  useCreateRegularizationMutation,
  useGetMyRegularizationRequestsQuery,
  usePullbackRegularizationMutation,
} from "../../store/apis/attendanceRegularization.api";
import { IMasterConfigOption, useGetMasterConfigByCategoryQuery } from "../../store/apis/masterConfig.api";

/** Parse YYYY-MM-DD to { month: 1-12, year } for v2 calendar API */
function getMonthYearFromDate(dateStr: string): { month: number; year: number } {
  const [yearStr, monthStr] = dateStr.split("-");
  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10);
  return { month, year };
}

/** Parse 12h time "9:58 AM" / "10:18 PM" to 24h { hours, minutes } */
function parse12hTime(str: string): { hours: number; minutes: number } | null {
  const match = String(str).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

/** Build UTC ISO for given time on dateStr (YYYY-MM-DD) */
function utcTimeOnDateToISO(dateStr: string, hours: number, minutes: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${dateStr}T${pad(hours)}:${pad(minutes)}:00.000Z`;
}

/**
 * Replace UTC times in backend AR error message with IST for display.
 * Backend sends break times in UTC (e.g. "09:58 AM - 10:18 AM"); we show them in IST.
 */
function convertBreakTimesInMessageToIST(
  message: string,
  dateStr: string,
  formatTime: (iso: string) => string
): string {
  if (!message || !dateStr) return message;
  try {
    // Pattern 1: (09:58 AM - 10:18 AM)
    let out = message.replace(
      /\((\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M)\)/gi,
      (_, t1, t2) => {
        const p1 = parse12hTime(t1);
        const p2 = parse12hTime(t2);
        if (!p1 || !p2) return _;
        const iso1 = utcTimeOnDateToISO(dateStr, p1.hours, p1.minutes);
        const iso2 = utcTimeOnDateToISO(dateStr, p2.hours, p2.minutes);
        return `(${formatTime(iso1)} - ${formatTime(iso2)})`;
      }
    );
    // Pattern 2: (started at 09:58 AM)
    out = out.replace(
      /\(started at (\d{1,2}:\d{2}\s*[AP]M)\)/gi,
      (_, t) => {
        const p = parse12hTime(t);
        if (!p) return _;
        const iso = utcTimeOnDateToISO(dateStr, p.hours, p.minutes);
        return `(started at ${formatTime(iso)})`;
      }
    );
    return out;
  } catch {
    return message;
  }
}

const AttendanceRegularization: React.FC = () => {
  useAuth();
  const canManage = useHasPermission(PERMISSIONS.APPLY_AR_MANAGE);
  const { formatDate, formatTime, toUTC, todayIST, dateToUTC } = useTimezone();
  const maxRegularizationDate = dayjs(todayIST());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Form state
  const [formData, setFormData] = useState<ICreateRegularizationPayload>({
    date: "",
    regularizationType: "",
    requestedCheckInTime: "09:00",
    requestedCheckOutTime: "18:00",
    reason: "",
  });

  // Modal state
  const [selectedRequest, setSelectedRequest] = useState<IRegularizationRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<IRegularizationRequest | null>(null);

  // Attendance data for form (when date is selected)
  const [formAttendanceData, setFormAttendanceData] = useState<{
    checkInTime?: string;
    checkOutTime?: string;
    breaks?: IBreak[];
  } | null>(null);
  const [loadingFormAttendance, setLoadingFormAttendance] = useState(false);

  // Attendance data for viewing details
  const [attendanceData, setAttendanceData] = useState<{
    checkInTime?: string;
    checkOutTime?: string;
    breaks?: IBreak[];
  } | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // RTK Query hooks
  const {
    data: regularizationTypesData,
    isLoading: loadingRegularizationTypes,
  } = useGetMasterConfigByCategoryQuery("attendance_regularization_reason");

  const {
    data: myRequestsData,
    isLoading: loadingMyRequests,
    refetch: refetchMyRequests,
  } = useGetMyRegularizationRequestsQuery({
    page: currentPage,
    limit: pageSize,
  });

  const [getTodayStatusByDate] = useLazyGetTodayStatusByDateQuery();

  const [createRegularization, { isLoading: submitting }] = useCreateRegularizationMutation();
  const [pullbackRegularization, { isLoading: pullbackLoading }] = usePullbackRegularizationMutation();
  const [fetchCalendarData] = useLazyGetCalendarDataQuery();


  // Extract data from RTK Query response
  const requests = myRequestsData?.data || [];
  const totalRequests = myRequestsData?.total || 0;
  const totalPages = myRequestsData?.totalPages || 1;

  // Fetch attendance for the selected date via v2 calendar (month containing that date)
  useEffect(() => {
    const fetchFormAttendance = async () => {
      if (!formData.date) {
        setFormAttendanceData(null);
        return;
      }

      try {
        setLoadingFormAttendance(true);
        const dateStr = formData.date;
        const result = await getTodayStatusByDate(dateStr).unwrap().catch(() => null);
        const dayForDate = result?.data;

        if (dayForDate && (dayForDate.checkInTime || dayForDate.checkOutTime)) {
          setFormAttendanceData({
            checkInTime: dayForDate.checkInTime ?? undefined,
            checkOutTime: dayForDate.checkOutTime ?? undefined,
            breaks: dayForDate.breaks ?? [],
          });
        } else {
          setFormAttendanceData(null);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setFormAttendanceData(null);
      } finally {
        setLoadingFormAttendance(false);
      }
    };

    fetchFormAttendance();
  }, [formData.date, getTodayStatusByDate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: Dayjs | null) => {
    setFormData((prev) => ({
      ...prev,
      date: value ? value.format("YYYY-MM-DD") : "",
    }));
  };

  const handleRegularizationTypeChange = (
    value: string | number | (string | number)[]
  ) => {
    if (Array.isArray(value)) return;
    setFormData((prev) => ({
      ...prev,
      regularizationType: String(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.regularizationType) {
      toast.error("Please select a regularization type");
      return;
    }

    try {
      // Convert IST to UTC before sending to backend
      const payload: ICreateRegularizationPayload = {
        date: dateToUTC(formData.date),
        regularizationType: formData.regularizationType,
        requestedCheckInTime: toUTC(formData.date, formData.requestedCheckInTime),
        requestedCheckOutTime: toUTC(formData.date, formData.requestedCheckOutTime),
        reason: formData.reason,
      };

      await createRegularization(payload).unwrap();
      toast.success("Regularization request submitted successfully!");

      // Reset form
      setFormData({
        date: "",
        regularizationType: "",
        requestedCheckInTime: "09:00",
        requestedCheckOutTime: "18:00",
        reason: "",
      });

      // Refetch requests
      refetchMyRequests();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }, message?: string };
      const rawMessage = error?.data?.message || error?.message || "Failed to submit regularization request";
      const displayMessage = formData.date
        ? convertBreakTimesInMessageToIST(rawMessage, formData.date, formatTime)
        : rawMessage;
      toast.error(displayMessage);
    }
  };

  const handleViewDetails = async (request: IRegularizationRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    setAttendanceData(null);

    // Fetch attendance for the request date via v2 calendar (month containing that date)
    if (request.date) {
      try {
        setLoadingAttendance(true);
        const dateStr = request.date.split("T")[0];
        const { month, year } = getMonthYearFromDate(dateStr);
        const result = await fetchCalendarData({ month, year }).unwrap().catch(() => null);
        const days = result?.data?.days as Array<{ date: string; checkInTime?: string; checkOutTime?: string }> | undefined;
        const dayForDate = Array.isArray(days)
          ? days.find((d) => (d.date && String(d.date).split("T")[0]) === dateStr)
          : undefined;

        if (dayForDate && (dayForDate.checkInTime || dayForDate.checkOutTime)) {
          setAttendanceData({
            checkInTime: dayForDate.checkInTime ?? undefined,
            checkOutTime: dayForDate.checkOutTime ?? undefined,
          });
        } else {
          setAttendanceData(null);
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        setAttendanceData(null);
      } finally {
        setLoadingAttendance(false);
      }
    }
  };

  const getStatusColor = (status: WorkflowStatusCode) =>
    getWorkflowStatusColor(status);

  const canPullback = (req: IRegularizationRequest): boolean =>
    isPendingWorkflowStatus(req.status as WorkflowStatusCode);

  const onPullbackClick = (req: IRegularizationRequest) => {
    setConfirmTarget(req);
    setConfirmOpen(true);
  };

  const confirmPullback = async () => {
    if (!confirmTarget) return;
    try {
      await pullbackRegularization(confirmTarget.id).unwrap();
      toast.success("Regularization pulled back successfully");
      refetchMyRequests();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string }, message?: string };
      toast.error(error?.data?.message || error.message || "Failed to pull back");
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const regularizationTypeOptions = React.useMemo(() => {
    if (!regularizationTypesData || !Array.isArray(regularizationTypesData)) {
      return [];
    }

    return regularizationTypesData.map((type: IMasterConfigOption) => ({
      value: type.id,
      label: type.displayName,
    }));
  }, [regularizationTypesData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const attendanceColumns: TableColumn<IRegularizationRequest>[] = useMemo(() => [
    {
      key: "dateType",
      title: "DATE & TYPE",
      label: "Date & Type",
      required: true,
      render: (_, request) => (
        <div>
          <div className="flex items-center text-sm font-medium text-slate-900">
            <Calendar className="w-4 h-4 mr-1 text-slate-400" />
            {formatDate(request.date)}
          </div>
          <div className="text-sm text-slate-500 mt-1">
            {request.regularizationTypeName}
          </div>
        </div>
      ),
    },
    {
      key: "requestedTime",
      title: "REQUESTED TIME",
      label: "Requested Time",
      render: (_, request) => (
        <div className="text-sm text-slate-900">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1 text-slate-400" />
            {formatTime(request.requestedCheckInTime)} -{" "}
            {formatTime(request.requestedCheckOutTime)}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      title: "REASON",
      label: "Reason",
      render: (_, request) => (
        <div className="flex items-center w-[220px]">
          <SimpleTooltip label={request.reason || "—"} side="top">
            <span className="text-sm text-slate-900 block max-w-[220px] truncate cursor-pointer">
              {request.reason || "—"}
            </span>
          </SimpleTooltip>
        </div>
      ),
    },
    {
      key: "status",
      title: "STATUS",
      label: "Status",
      render: (_, request) => (
        <div>
          <Badge
            variant={getWorkflowStatusVariant(request.status as WorkflowStatusCode)}
          >
            {(() => {
              const Icon = getWorkflowStatusIcon(request.status as WorkflowStatusCode);
              return <Icon className="w-4 h-4" />;
            })()}
            {request.statusLabel ||
              getWorkflowStatusFallbackLabel(
                request.status as WorkflowStatusCode,
                request.currentActorName
              )}
          </Badge>
          {isApprovedWorkflowStatus(request.status as WorkflowStatusCode) &&
            request.approvedByName && (
              <div className="text-xs text-slate-500 mt-1">
                by {request.approvedByName}
              </div>
            )}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "APPLIED DATE",
      label: "Applied Date",
      render: (_, request) => (
        <span className="text-sm text-slate-500">{formatDate(request.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      title: "ACTIONS",
      label: "Actions",
      required: true,
      render: (_, request) => (
        <div className="flex items-center space-x-3">
          <SimpleTooltip
            label="View"
            side="top"
            className="inline-block"
            tooltipClassName="text-xs shadow-soft border-0"
          >
            <button
              onClick={() => handleViewDetails(request)}
              aria-label="View"
              className="text-primary-600 hover:text-primary-900"
            >
              <Eye className="w-4 h-4" />
            </button>
          </SimpleTooltip>

          {canManage && canPullback(request) && (
            <SimpleTooltip
              label="Pull back"
              side="top"
              className="inline-block"
              tooltipClassName="text-xs shadow-soft border-0"
            >
              <button
                onClick={() => onPullbackClick(request)}
                aria-label="Pull back"
                className="text-primary-700 hover:text-primary-900"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </SimpleTooltip>
          )}
        </div>
      ),
    },
  ], [canManage, formatDate, formatTime]);

  const renderFormAttendance = () => {
    if (loadingFormAttendance) {
      return (
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span>Loading attendance data for {formatDate(formData.date)}...</span>
        </div>
      );
    }

    if (!formAttendanceData) {
      return (
        <div className="text-sm text-slate-500 italic">
          No attendance record found for {formatDate(formData.date)}
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Actual Check-in Time
            </label>
            <p className="text-sm text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-green-600" />
              {formAttendanceData.checkInTime
                ? formatTime(formAttendanceData.checkInTime)
                : "N/A"}
            </p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Actual Check-out Time
            </label>
            <p className="text-sm text-slate-900 flex items-center">
              <Clock className="w-4 h-4 mr-1 text-red-600" />
              {formAttendanceData.checkOutTime
                ? formatTime(formAttendanceData.checkOutTime)
                : "N/A"}
            </p>
          </div>
        </div>
        {formAttendanceData.breaks && formAttendanceData.breaks.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Breaks
            </label>

            <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formAttendanceData.breaks.map((brk, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 text-sm flex justify-between items-center !mt-0"
                >
                  <div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium capitalize">{brk?.type || "Break"}</span>
                      <div className="text-sm text-slate-900 flex items-center"><Clock className="w-4 h-4 mr-1 text-yellow-600" />{formatTime(brk?.startTime) || "N/A"} - {formatTime(brk?.endTime) || "N/A"}</div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500">
                    {(brk.duration ?? 0).toFixed(2)} mins
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 md:text-3xl">
          Attendance Regularization
        </h1>
      </div>

      {/* Regularization Request Form */}
      {canManage && (
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date and Type */}
              <div>
                <DatePicker
                  label="Date"
                  required
                  value={formData.date ? dayjs(formData.date) : null}
                  onChange={handleDateChange}
                  maxDate={maxRegularizationDate}
                  placeholder="Select date"
                  className="w-full"
                  format="DD/MM/YYYY"
                  allowClear={false}
                />
              </div>

              <div>
                <Select
                  label="Regularization Type"
                  required
                  value={formData.regularizationType}
                  onChange={handleRegularizationTypeChange}
                  options={regularizationTypeOptions}
                  loading={loadingRegularizationTypes}
                  placeholder="Select regularization type"
                  className="w-full"
                  searchable={false}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Time Fields */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 sm:text-sm">
                  Requested Check-in Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="requestedCheckInTime"
                  value={formData.requestedCheckInTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Requested Check-out Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="requestedCheckOutTime"
                  value={formData.requestedCheckOutTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <TextArea
              label="Reason"
              value={formData.reason ?? ""}
              onChange={(value: string) =>
                setFormData({ ...formData, reason: value })
              }
              placeholder="Please provide a detailed reason for your regularization request..."
              required
            />

            {/* Actual Check-in and Check-out Times for Selected Date */}
            {formData.date && (
              <div className="pt-4 border-t border-slate-200 space-y-4">
                {renderFormAttendance()}

                {/* Regularization Requests for Selected Date */}
                {(() => {
                  const dateRequests = requests.filter((req) => {
                    return formatDate(req.date) === formatDate(formData.date);
                  });

                  if (dateRequests.length === 0) {
                    return (
                      <div className="pt-6 border-t border-slate-200">
                        <div className="flex items-center space-x-2 mb-4">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <h3 className="text-base font-semibold text-slate-800 m-0">
                            Regularization Requests for {formatDate(formData.date)}
                          </h3>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-slate-500">
                            No regularization requests found for this date
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="pt-6 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <h3 className="text-base font-semibold text-slate-800">
                            Regularization Requests for {formatDate(formData.date)}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-full">
                            {dateRequests.length}{" "}
                            {dateRequests.length === 1 ? "request" : "requests"}
                          </span>
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                          <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50 sticky top-0 z-10">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Date & Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Requested Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Applied Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                              {dateRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                      <div className="flex items-center text-sm font-medium text-slate-900">
                                        <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                                        {formatDate(request.date)}
                                      </div>
                                      <div className="text-sm text-slate-500 mt-1">
                                        {request.regularizationTypeName}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900">
                                      <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1 text-slate-400" />
                                        {formatTime(request.requestedCheckInTime)} -{" "}
                                        {formatTime(request.requestedCheckOutTime)}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-slate-900 max-w-xs truncate">
                                      {request.reason}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                        request.status as WorkflowStatusCode
                                      )}`}
                                    >
                                      {request.statusLabel ||
                                        getWorkflowStatusFallbackLabel(
                                          request.status as WorkflowStatusCode,
                                          request.currentActorName
                                        )}
                                    </span>
                                    {isApprovedWorkflowStatus(request.status as WorkflowStatusCode) &&
                                      request.approvedByName && (
                                        <div className="text-xs text-slate-500 mt-1">
                                          by {request.approvedByName}
                                        </div>
                                      )}
                                    {isRejectedWorkflowStatus(request.status as WorkflowStatusCode) &&
                                      request.rejectionReason && (
                                        <div className="text-xs text-red-600 mt-1">
                                          {request.rejectionReason}
                                        </div>
                                      )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {formatDate(request.createdAt)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={() => handleViewDetails(request)}
                                      className="relative group text-primary-600 hover:text-primary-800 transition-colors"
                                      title="View"
                                    >
                                      <Eye className="w-4 h-4" />
                                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-soft">
                                        View
                                      </span>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                htmlType="submit"
                appearance="primary"
                disabled={submitting}
                icon={<FileText className="w-5 h-5" />}
                className="w-full md:w-auto flex items-center justify-center md:justify-start"
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* My Regularization Requests */}
      <div className="bg-white rounded-lg shadow-soft">
        {loadingMyRequests ? (
          <RegularizationTableSkeleton />
        ) : (
          <>
            <div className="p-0 border-b border-slate-200">
              <ConfigurableTable
                columns={attendanceColumns}
                data={requests}
                loading={loadingMyRequests}
                emptyMessage="No regularization requests found"
                rowKey="id"
                configOptions={{ persistenceKey: "attendance-regularization-my-requests" }}
                renderColumnSelector={(selector) => (
                  <div className="p-3 border-b border-slate-200 flex items-start md:items-center md:justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-slate-600 mr-2" />
                      <h2 className="text-base font-bold text-slate-900 md:text-lg m-0">
                        My Regularization Requests
                      </h2>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-slate-500">
                        Total: {totalRequests} requests
                      </div>
                      {selector}
                    </div>
                  </div>
                )}
              />
            </div>

            {(
              <div className="px-6 py-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 text-sm border rounded-md ${currentPage === pageNum
                              ? "bg-primary-600 text-white border-primary-600"
                              : "border-slate-300 hover:bg-slate-50"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedRequest && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Regularization Request Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Employee
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedRequest.fullName} ({selectedRequest.employeeId})
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Date
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {formatDate(selectedRequest.date)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Type
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedRequest.regularizationTypeName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Requested Time
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {formatTime(selectedRequest.requestedCheckInTime)} -{" "}
                  {formatTime(selectedRequest.requestedCheckOutTime)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Actual Time
                </label>
                {loadingAttendance ? (
                  <div className="mt-1 flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-600"></div>
                    <span className="text-xs text-slate-500">Loading...</span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-slate-900">
                    {attendanceData ? (
                      <>
                        {formatTime(attendanceData.checkInTime)} -{" "}
                        {formatTime(attendanceData.checkOutTime)}
                      </>
                    ) : (
                      <span className="text-slate-400 italic">Not available</span>
                    )}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    selectedRequest.status as WorkflowStatusCode
                  )}`}
                >
                  {selectedRequest.statusLabel ||
                    getWorkflowStatusFallbackLabel(
                      selectedRequest.status as WorkflowStatusCode,
                      selectedRequest.currentActorName
                    )}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Reason
              </label>
              <p className="mt-1 text-sm text-slate-900">{selectedRequest.reason}</p>
            </div>

            {selectedRequest.approvedByName && (
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  {isApprovedWorkflowStatus(selectedRequest.status as WorkflowStatusCode)
                    ? "Approved By"
                    : isRejectedWorkflowStatus(selectedRequest.status as WorkflowStatusCode)
                      ? "Rejected By"
                      : "Processed By"}
                </label>
                <p className="mt-1 text-sm text-slate-900">
                  {selectedRequest.approvedByName}
                </p>
              </div>
            )}
            {selectedRequest.rejectionReason && (
              <div>
                <label className="block text-sm font-semibold text-slate-700">
                  Rejection Reason
                </label>
                <p className="mt-1 text-sm text-red-600">
                  {selectedRequest.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmPullback}
        title="Pull back regularization request"
        message={
          confirmTarget
            ? `Are you sure you want to pull-back your request for ${formatDate(
              confirmTarget.date
            )} (${confirmTarget.regularizationTypeName})?`
            : ""
        }
        type="warning"
        confirmText={pullbackLoading ? "Pulling back..." : "Pull back"}
        isLoading={pullbackLoading}
      />
    </div>
  );
};

export default AttendanceRegularization;
