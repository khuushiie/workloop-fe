import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Calendar, FileText } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { apiService } from "../../services/api";
import { IUserDetail } from "../../types/user.api.types";
import { capitalizeWords, getFirstName, getLastName } from "../../utils/nameUtils";
import { useHasPermission } from "../../store/hooks/useRbac";
import { PERMISSIONS } from "../../utils/rbac/permissions";
import { Select, DatePicker, Button } from "../common";
import { TextArea } from "../common/TextArea";

interface LeaveBalance {
  [key: string]: number;
}

const LeaveCreation: React.FC = () => {
  const canManageLeaveRequests = useHasPermission(
    PERMISSIONS.LEAVE_REQUESTS_MANAGE
  );
  const currentUser = apiService.getCurrentUser();
  const canSelectEmployees = canManageLeaveRequests;

  const [formData, setFormData] = useState({
    employeeId: canSelectEmployees ? "" : currentUser?.id || "",
    leaveType: "",
    startDate: "",
    endDate: "",
    reason: "",
    isHalfDay: false,
  });

  const [employees, setEmployees] = useState<IUserDetail[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mandatoryHolidayDates, setMandatoryHolidayDates] = useState<
    Set<string>
  >(new Set());
  const [holidayDetails, setHolidayDetails] = useState<
    Map<string, { name: string; isMandatory: boolean }>
  >(new Map());
  const [existingLeaves, setExistingLeaves] = useState<any[]>([]);

  const [leaveOptions, setLeaveOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // alias normalization
  const normalizeLeaveType = (code: string) => {
    const map: Record<string, string> = { lwp: "lwp" };
    const key = (code || "").toLowerCase();
    return map[key] ?? key;
  };

  // Calculate days between start and end date
  const calculateDays = (
    startDate: string,
    endDate: string,
    isHalfDay: boolean
  ): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates

    // Ensure minimum of 0.5 days for half day
    const calculatedDays = isHalfDay ? Math.max(diffDays * 0.5, 0.5) : diffDays;
    return Math.round(calculatedDays * 10) / 10; // Round to 1 decimal place
  };

  // Fetch employees and leave balances on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (canSelectEmployees) {
          // Admin: fetch all employees
          const employeesData = await apiService.getEmployees({
            status: "active",
          });
          setEmployees(
            Array.isArray(employeesData)
              ? employeesData
              : employeesData?.data || []
          );
        } else {
          // Regular user: set their own ID as employeeId
          if (currentUser?.id) {
            setFormData((prev) => ({
              ...prev,
              employeeId: currentUser.id,
            }));
          }
        }

        // Fetch current year holidays
        try {
          const now = new Date();
          const holidays = await apiService.getHolidays({
            year: now.getFullYear(),
          });
          const dates = new Set<string>();
          const mandatoryDates = new Set<string>();
          const holidayDetailsMap = new Map<
            string,
            { name: string; isMandatory: boolean }
          >();

          (holidays || []).forEach((h: any) => {
            const d = new Date(
              h.date || h.holidayDate || h.day || h?.dateString
            );
            if (!isNaN(d.getTime())) {
              const dateString = d.toISOString().split("T")[0];
              dates.add(dateString);
              holidayDetailsMap.set(dateString, {
                name: h.name,
                isMandatory: h.isMandatory === true,
              });
              // Only add to mandatory holidays if isMandatory is true
              if (h.isMandatory === true) {
                mandatoryDates.add(dateString);
              }
            }
          });
          setMandatoryHolidayDates(mandatoryDates);
          setHolidayDetails(holidayDetailsMap);
        } catch (e) {
          // Non-blocking if holidays fail to load
          console.warn("Failed to load holidays for validation");
        }

        // Fetch existing leave requests for the current user
        if (!canSelectEmployees && currentUser?.id) {
          try {
            const userLeaves = await apiService.getUserLeaveRequests(
              currentUser.id
            );
            setExistingLeaves(Array.isArray(userLeaves) ? userLeaves : []);
          } catch (e) {
            console.warn("Failed to load existing leaves for validation");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [canSelectEmployees, currentUser?.id]);

  useEffect(() => {
    (async () => {
      try {
        const opts = await apiService.getActiveFilterOptions("leave_type");
        setLeaveOptions(
          (opts || []).map((o: any) => ({ value: o.code, label: o.label }))
        );
      } catch (e) {
        setLeaveOptions([]);
      }
    })();
  }, []);

  // Fetch leave balances when employee is selected
  useEffect(() => {
    const fetchLeaveBalances = async () => {
      if (!formData.employeeId) {
        setLeaveBalances({});
        return;
      }

      try {
        // Fetch all balances in a single API call
        const balances = await apiService.getAllLeaveBalances(
          formData.employeeId
        );
        setLeaveBalances(balances);
      } catch (err) {
        console.error("Error fetching leave balances:", err);
        setLeaveBalances({});
      }
    };

    fetchLeaveBalances();
  }, [formData.employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.employeeId ||
      !formData.leaveType ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Check if start date is today or in the future (allow today)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const startDate = new Date(formData.startDate);
    startDate.setHours(0, 0, 0, 0); // Set to start of selected date

    if (startDate > new Date(formData.endDate)) {
      toast.error("End date must be after start date.");
      return;
    }

    // Validate Flexi Weekend Leave - only allow Saturdays
    if (formData.leaveType === "flexi_weekend") {
      const startDay = startDate.getDay(); // 0 = Sunday, 6 = Saturday
      const endDate = new Date(formData.endDate);
      const endDay = endDate.getDay();

      if (startDay !== 6) {
        toast.error(
          "Flexi Weekend Leave can only be applied for Saturdays. Please select a Saturday for the start date."
        );
        return;
      }

      if (endDay !== 6) {
        toast.error(
          "Flexi Weekend Leave can only be applied for Saturdays. Please select a Saturday for the end date."
        );
        return;
      }

      // Check if all dates in the range are Saturdays
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
        toast.error(
          `Flexi Weekend Leave can only be applied for Saturdays. The following dates in your range are not Saturdays: ${nonSaturdayDates.join(
            ", "
          )}`
        );
        return;
      }
    }

    // Prevent applying leaves on mandatory holidays only
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const mandatoryHolidayDatesInRange: string[] = [];
    for (
      let d = new Date(start.getTime());
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const iso = d.toISOString().split("T")[0];
      if (mandatoryHolidayDates.has(iso)) {
        mandatoryHolidayDatesInRange.push(iso);
      }
    }
    if (mandatoryHolidayDatesInRange.length > 0) {
      const holidayNames = mandatoryHolidayDatesInRange
        .map((date) => {
          const holidayName = getHolidayName(date);
          return holidayName ? `${holidayName} (${date})` : date;
        })
        .join(", ");

      toast.error(
        mandatoryHolidayDatesInRange.length === 1
          ? `Selected date falls on a mandatory holiday: ${holidayNames}. Please choose a non-mandatory holiday date.`
          : `Selected range includes mandatory holidays: ${holidayNames}. Please exclude mandatory holiday dates.`
      );
      return;
    }

    // Calculate requested days
    const requestedDays = calculateDays(
      formData.startDate,
      formData.endDate,
      formData.isHalfDay
    );

    // Check if employee has enough leave balance (except for LWP and WFH)
    if (formData.leaveType !== "lwp" && formData.leaveType !== "wfh") {
      const availableBalance = leaveBalances[formData.leaveType] || 0;
      if (requestedDays > availableBalance) {
        toast.error(
          `Insufficient leave balance. Available: ${availableBalance} days, Requested: ${requestedDays} days`
        );
        return;
      }
    }

    // Check for existing leave conflicts (frontend validation)
    const conflictError = checkExistingLeaveConflicts(
      formData.startDate,
      formData.endDate,
      formData.isHalfDay
    );
    if (conflictError) {
      toast.error(conflictError);
      return;
    }

    try {
      setSubmitting(true);

      // Find the selected employee (for admin) or use current user (for regular user)
      let selectedEmployee;
      if (canSelectEmployees) {
        selectedEmployee = employees.find(
          (emp) => (emp._id ?? emp.id) === formData.employeeId
        );
        if (!selectedEmployee) {
          toast.error("Selected employee not found.");
          return;
        }
      } else {
        // For regular users, use their own information
        selectedEmployee = {
          id: currentUser.id,
          firstName:
            currentUser.firstName || getFirstName(currentUser.username || ""),
          lastName:
            currentUser.lastName || getLastName(currentUser.username || ""),
        };
      }

      // Prepare leave request data
      const leaveRequestData = {
        userId: formData.employeeId,
        userName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        leaveType: normalizeLeaveType(formData.leaveType),
        startDate: formData.startDate,
        endDate: formData.endDate,
        days: requestedDays,
        reason: formData.reason,
        isHalfDay: formData.isHalfDay,
      };

      // Submit to API
      const response = await apiService.createLeaveRequest(leaveRequestData);

      if (response) {
        toast.success("Leave request created successfully!");

        // Refresh leave balances after successful submission
        if (formData.employeeId) {
          try {
            const balances = await apiService.getAllLeaveBalances(
              formData.employeeId
            );
            setLeaveBalances(balances);
          } catch (err) {
            console.error("Error refreshing leave balances:", err);
          }
        }

        // Reset form
        setFormData({
          employeeId: canSelectEmployees ? "" : currentUser?.id || "",
          leaveType: "",
          startDate: "",
          endDate: "",
          reason: "",
          isHalfDay: false,
        });
      }
    } catch (err: any) {
      // Extract error message from backend response
      let errorMessage = "Failed to create leave request. Please try again.";

      // The axios interceptor throws a new Error with the message, so we should use err.message
      if (err.message && err.message !== "Network error") {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 409) {
        errorMessage =
          "You already have a leave request for these dates. Please check your existing requests.";
      } else {
        // Final fallback - show the raw error for debugging
        errorMessage = `Error: ${JSON.stringify(
          err.response?.data || err.message
        )}`;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };

      return newData;
    });
  };

  const handleEmployeeChange = (
    value: string | number | (string | number)[]
  ) => {
    const employeeId = String(value);
    setFormData((prev) => ({
      ...prev,
      employeeId,
    }));
  };

  const handleLeaveTypeChange = (
    value: string | number | (string | number)[]
  ) => {
    const leaveType = String(value);
    setFormData((prev) => {
      const newData = {
        ...prev,
        leaveType,
      };

      // Clear dates if leave type changes to flexi_weekend and dates are not Saturdays
      if (leaveType === "flexi_weekend") {
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

  const handleStartDateChange = (date: Dayjs | null) => {
    const startDate = date ? date.format("YYYY-MM-DD") : "";
    setFormData((prev) => {
      const newData = {
        ...prev,
        startDate,
      };

      // Clear end date if start date is set to a later date
      if (startDate && newData.endDate) {
        const start = new Date(startDate);
        const end = new Date(newData.endDate);
        if (start > end) {
          newData.endDate = "";
        }
      }

      return newData;
    });
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    const endDate = date ? date.format("YYYY-MM-DD") : "";
    setFormData((prev) => ({
      ...prev,
      endDate,
    }));
  };

  const previewDays = calculateDays(
    formData.startDate,
    formData.endDate,
    formData.isHalfDay
  );

  // Helper function to check if a date is a mandatory holiday
  const isMandatoryHoliday = (date: string): boolean => {
    return mandatoryHolidayDates.has(date);
  };

  // Helper function to get holiday name for a date
  const getHolidayName = (date: string): string | null => {
    const holiday = holidayDetails.get(date);
    return holiday ? holiday.name : null;
  };

  // Helper function to check for existing leave conflicts
  const checkExistingLeaveConflicts = (
    startDate: string,
    endDate: string,
    isHalfDay: boolean
  ): string | null => {
    if (!existingLeaves.length) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const conflictingLeaves = existingLeaves.filter((leave) => {
      const leaveStart = new Date(leave.startDate);
      const leaveEnd = new Date(leave.endDate);

      // Check for date overlap
      return (
        start <= leaveEnd &&
        end >= leaveStart &&
        (leave.status === "pending" || leave.status === "approved")
      );
    });

    if (conflictingLeaves.length === 0) return null;

    // If it's a full-day leave, any existing leave is a conflict
    if (!isHalfDay) {
      return "You already have a leave request for these dates. Please check your existing requests.";
    }

    // If it's a half-day leave, check for full-day conflicts
    const hasFullDayConflict = conflictingLeaves.some(
      (leave) => !leave.isHalfDay
    );
    if (hasFullDayConflict) {
      return "You already have a full-day leave request for these dates. Half-day leaves cannot be applied on the same day as full-day leaves.";
    }

    // Check for same-day half-day conflicts
    const sameDayHalfDayConflicts = conflictingLeaves.filter(
      (leave) =>
        leave.isHalfDay &&
        leave.startDate === startDate &&
        leave.endDate === endDate
    );

    if (sameDayHalfDayConflicts.length > 0) {
      return "You already have a half-day leave request for this date. Please check your existing requests.";
    }

    return null;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Create Leave Request
            </h1>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee and Leave Type in Single Row */}
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 lg:gap-6">
            {/* Employee Selection (Admin Only) */}
            {canSelectEmployees && (
              <Select
                label="Employee"
                value={formData.employeeId}
                onChange={handleEmployeeChange}
                options={employees.map((employee) => ({
                  value: employee?._id ?? employee?.id,
                  label: capitalizeWords(`${employee?.firstName} ${employee?.lastName || ''}`),
                }))}
                placeholder="Select Employee"
                searchable
                clearable
                required
              />
            )}

            {/* Leave Type */}
            <Select
              label="Leave Type"
              value={formData.leaveType}
              onChange={handleLeaveTypeChange}
              options={leaveOptions.map((type) => {
                const balance = leaveBalances[type.value];
                return {
                  value: type.value,
                  label: `${type.label}${
                    type.value !== "lwp" &&
                    type.value !== "wfh" &&
                    formData.employeeId &&
                    balance !== undefined
                      ? ` (Available: ${balance} days)`
                      : ""
                  }`,
                };
              })}
              placeholder="Select Leave Type"
              searchable
              clearable
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DatePicker
                label="Start Date"
                value={
                  formData.startDate ? dayjs(formData.startDate) : undefined
                }
                onChange={handleStartDateChange}
                disabledDates={(date: Dayjs) => {
                  // Disable mandatory holidays
                  const dateString = date.format("YYYY-MM-DD");
                  if (mandatoryHolidayDates.has(dateString)) {
                    return true;
                  }

                  // For flexi weekend, only allow Saturdays
                  if (formData.leaveType === "flexi_weekend") {
                    return date.day() !== 6; // 6 = Saturday
                  }

                  return false;
                }}
                format="DD/MM/YYYY"
                maxDate={formData.endDate ? dayjs(formData.endDate) : undefined}
                required
                error={
                  formData.startDate && isMandatoryHoliday(formData.startDate)
                    ? `This date is a mandatory holiday: ${
                        getHolidayName(formData.startDate) || "Unknown Holiday"
                      }`
                    : formData.startDate &&
                      formData.leaveType === "flexi_weekend" &&
                      new Date(formData.startDate).getDay() !== 6
                    ? "Flexi Weekend Leave can only be applied for Saturdays. Please select a Saturday."
                    : undefined
                }
              />
            </div>
            <div>
              <DatePicker
                label="End Date"
                value={formData.endDate ? dayjs(formData.endDate) : undefined}
                onChange={handleEndDateChange}
                disabledDates={(date: Dayjs) => {
                  // Disable mandatory holidays
                  const dateString = date.format("YYYY-MM-DD");
                  if (mandatoryHolidayDates.has(dateString)) {
                    return true;
                  }

                  // For flexi weekend, only allow Saturdays
                  if (formData.leaveType === "flexi_weekend") {
                    return date.day() !== 6; // 6 = Saturday
                  }

                  return false;
                }}
                minDate={
                  formData.startDate ? dayjs(formData.startDate) : undefined
                }
                required
                error={
                  formData.endDate && isMandatoryHoliday(formData.endDate)
                    ? `This date is a mandatory holiday: ${
                        getHolidayName(formData.endDate) || "Unknown Holiday"
                      }`
                    : formData.endDate &&
                      formData.leaveType === "flexi_weekend" &&
                      new Date(formData.endDate).getDay() !== 6
                    ? "Flexi Weekend Leave can only be applied for Saturdays. Please select a Saturday."
                    : undefined
                }
                format="DD/MM/YYYY"
              />
            </div>
          </div>

          {/* Half Day Option */}
          <label className="inline-flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="isHalfDay"
              checked={formData.isHalfDay}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-semibold text-slate-700">Half Day Leave</span>
          </label>
          {/* Days Preview */}
          {previewDays > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-primary-600 mr-2" />
                <span className="text-sm font-semibold text-primary-800">
                  Total Days: {previewDays} day{previewDays !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <TextArea
              label="Reason"
              value={formData.reason}
              onChange={(value: string) =>
                setFormData((prev) => ({ ...prev, reason: value }))
              }
              placeholder="Please provide a reason for your leave request..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              htmlType="submit"
              appearance="primary"
              size="large"
              disabled={submitting}
              icon={<FileText className="w-5 h-5" />}
              className="w-full md:w-auto flex items-center justify-center md:justify-start"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveCreation;
