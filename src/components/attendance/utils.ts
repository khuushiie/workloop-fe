import {
  AttendanceRecord,
  LeaveRequest,
  AttendanceSummary,
  AttendanceFilters,
  Employee,
} from "./types";

export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "present":
      return "P";
    case "absent":
      return "A";
    case "half_day":
      return "HD";
    case "leave":
      return "EL";
    case "sick_leave":
      return "SL";
    case "lwp":
      return "LWP";
    default:
      return status.toUpperCase();
  }
};

export const getLeaveStatusLabel = (leaveType: string): string => {
  // console.log("LEAVE TYPE FROM API:", leaveType);
  switch (leaveType) {
    case "earned":
      return "EL";
    case "sick":
      return "SL";
    case "lwp":
      return "LWP";
    case "wfh":
      return "WFH";
    case "flexi_weekend":
      return "FWL";
    case "compensatory_leave":
      return "CPL";
    case "optional_holiday":
      return "OH";
    default:
      return "EL"; // Default to earned leave
  }
};

// Check if status is a combined half-day status (e.g., "P/EL", "HD/SL")
export const isHalfDayStatus = (status: string): boolean => {
  return status.includes("/");
};

// Parse combined half-day status into parts
export const parseHalfDayStatus = (
  status: string
): { work: string; leave: string } | null => {
  if (!status.includes("/")) return null;
  const [work, leave] = status.split("/");
  return { work, leave };
};

// Get description for status (used in tooltips and legends)
export const getStatusDescription = (status: string): string => {
  const lowerStatus = status.toLowerCase();

  // Handle combined half-day statuses
  if (isHalfDayStatus(status)) {
    const parts = parseHalfDayStatus(status);
    if (parts) {
      const leaveDesc = getLeaveTypeDescription(parts.leave);
      if (parts.work === "P") {
        return `Half Day Present + Half Day ${leaveDesc}`;
      } else if (parts.work === "HD") {
        return `Half Day ${leaveDesc} (No attendance)`;
      }
    }
  }

  switch (lowerStatus) {
    case "p":
    case "present":
      return "Present";
    case "a":
    case "absent":
      return "Absent";
    case "hd":
    case "half_day":
      return "Half Day";
    case "el":
    case "earned":
      return "Earned Leave";
    case "sl":
    case "sick":
      return "Sick Leave";
    case "lwp":
      return "Leave Without Pay";
    case "wfh":
      return "Work From Home";
    case "fwl":
    case "flexi_weekend":
      return "Flexi Weekend Leave";
    case "cpl":
    case "compensatory_leave":
      return "Compensatory Leave";
    case "nm":
      return "Not Marked";
    case "hl":
      return "Holiday";
    default:
      return status;
  }
};

// Get leave type description
const getLeaveTypeDescription = (leaveType: string): string => {
  switch (leaveType.toUpperCase()) {
    case "EL":
      return "Earned Leave";
    case "SL":
      return "Sick Leave";
    case "LWP":
      return "Leave Without Pay";
    case "WFH":
      return "Work From Home";
    case "FWL":
      return "Flexi Weekend Leave";
    case "CPL":
      return "Compensatory Leave";
    default:
      return leaveType;
  }
};

export const getStatusColor = (status: string): string => {
  const lowerStatus = status.toLowerCase();

  // Handle combined half-day statuses (e.g., "p/el", "hd/sl")
  if (isHalfDayStatus(status)) {
    const parts = parseHalfDayStatus(status);
    if (parts) {
      // Use a gradient-style background to represent both states
      // For "P/EL" - green + blue
      // For "P/SL" - green + purple
      // For "HD/EL" - orange + blue (no attendance + leave)
      const leaveType = parts.leave.toLowerCase();
      if (parts.work.toLowerCase() === "p") {
        // Half-day present + half-day leave
        switch (leaveType) {
          case "el":
            return "bg-gradient-to-r from-green-100 to-blue-100 text-green-800";
          case "sl":
            return "bg-gradient-to-r from-green-100 to-purple-100 text-green-800";
          case "lwp":
            return "bg-gradient-to-r from-green-100 to-gray-200 text-green-800";
          case "wfh":
            return "bg-gradient-to-r from-green-100 to-cyan-100 text-green-800";
          case "cpl":
            return "bg-gradient-to-r from-green-100 to-indigo-100 text-green-800";
          default:
            return "bg-gradient-to-r from-green-100 to-blue-100 text-green-800";
        }
      } else if (parts.work.toLowerCase() === "hd") {
        // Half-day leave without attendance
        switch (leaveType) {
          case "el":
            return "bg-gradient-to-r from-orange-100 to-blue-100 text-orange-800";
          case "sl":
            return "bg-gradient-to-r from-orange-100 to-purple-100 text-orange-800";
          case "lwp":
            return "bg-gradient-to-r from-orange-100 to-gray-200 text-orange-800";
          case "wfh":
            return "bg-gradient-to-r from-orange-100 to-cyan-100 text-orange-800";
          case "cpl":
            return "bg-gradient-to-r from-orange-100 to-indigo-100 text-orange-800";
          default:
            return "bg-gradient-to-r from-orange-100 to-blue-100 text-orange-800";
        }
      }
    }
  }

  switch (lowerStatus) {
    case "present":
    case "p":
      return "bg-green-100 text-green-800";
    case "absent":
    case "a":
      return "bg-red-100 text-red-800";
    case "half_day":
    case "hd":
      return "bg-orange-100 text-orange-800";
    case "leave":
    case "earned":
    case "el":
      return "bg-primary-100 text-primary-800";
    case "sick_leave":
    case "sick":
    case "sl":
      return "bg-purple-100 text-purple-800";
    case "lwp":
      return "bg-slate-200 text-slate-800";
    case "wfh":
      return "bg-cyan-100 text-cyan-800";
    case "flexi_weekend":
    case "fwl":
      return "bg-teal-100 text-teal-800";
    case "compensatory_leave":
    case "cpl":
      return "bg-indigo-100 text-indigo-800";
    case "holiday":
    case "hl":
      return "bg-orange-100 text-orange-800";
    case "late":
      return "bg-yellow-100 text-yellow-800";
    case "nm":
      return "bg-slate-100 text-slate-600";
    case "oh":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export const getStatusTextColor = (status: string): string => {
  const statusColor = getStatusColor(status);
  const textColorMatch = statusColor.match(/text-\S+/);
  return textColorMatch ? textColorMatch[0] : "text-slate-800";
};

/**
 * Format date string (YYYY-MM-DD) to localized date
 * Uses local date parsing to avoid timezone issues
 * @deprecated Use formatLocalDate from timeUtils instead
 */
export const formatDate = (date: string): string => {
  // Parse date string as local date to avoid timezone issues
  const [year, month, day] = date.split("-").map((num) => parseInt(num, 10));
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getMonthName = (month: number): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

// Helper function to check if a date is a Sunday
export const isSunday = (year: number, month: number, day: number): boolean => {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0; // Sunday = 0
};

// Helper function to get day name for Sunday
export const getSundayDayName = (
  year: number,
  month: number,
  day: number
): string => {
  return "Sunday";
};

// Helper function to determine attendance status based on work hours and leave status
// Status is based on netWorkHours (totalWorkHours - breaks), not totalWorkHours
const determineAttendanceStatus = (
  record: AttendanceRecord,
  hasLeaveForDay: boolean,
  isHalfDayLeave: boolean = false
): string => {
  const workHours = record.netWorkHours ?? record.totalWorkHours ?? 0;

  // If employee has a half-day leave for this day, always show as half-day
  if (isHalfDayLeave) {
    return "HD"; // Half-day
  }

  // If employee has full-day leave for this day, show leave status
  if (hasLeaveForDay) {
    return getStatusLabel(record.status);
  }

  // Work hours based status determination:
  // < 4 hours = Absent
  // >= 4 hours AND < 7 hours = Half Day
  // >= 7 hours = Present
  if (workHours < 4) {
    return "A"; // Absent
  } else if (workHours >= 4 && workHours < 7) {
    return "HD"; // Half Day
  }

  // >= 7 hours - use original status (Present)
  return getStatusLabel(record.status);
};

export const generateAttendanceTable = (
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  filters: AttendanceFilters,
  employees: Employee[] = []
): { [key: string]: { [key: string]: string } } => {
  const daysInMonth = getDaysInMonth(filters.year, filters.month);

  // Group attendance records by employee
  const employeeAttendance: { [key: string]: { [key: string]: string } } = {};

  // First, collect all approved leave requests for each employee and day
  const employeeLeaveDays: { [key: string]: { [key: string]: string } } = {};
  // Track half-day leaves separately
  const employeeHalfDayLeaves: { [key: string]: Set<string> } = {};

  leaveRequests.forEach((request) => {
    if (request.status !== "approved" && request.status !== "approved_admin")
      return;

    // For admin view, find employee by matching userId
    let employeeId = request.userId;
    if (employees.length > 0) {
      // Try to find employee by matching userId
      const employee = employees.find((emp) => emp._id === request.userId);
      if (!employee) return;
      employeeId = employee._id;
    } else {
      // For user view, use the request.userId directly since we don't have employees list
      // But we need to match it with the attendance records userId format
      // Attendance records have userId as an object with _id, so we need to match against that
      const attendanceRecord = attendanceRecords.find(
        (record) => record.userId._id === request.userId
      );
      if (attendanceRecord) {
        employeeId = attendanceRecord.userId._id;
      }
    }

    // Parse dates and normalize to compare only date part (ignore time)
    const requestStartDate = new Date(request.startDate);
    requestStartDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const requestEndDate = new Date(request.endDate);
    requestEndDate.setHours(23, 59, 59, 999); // Normalize to end of day

    // Check if leave request overlaps with the selected month
    const monthStart = new Date(filters.year, filters.month - 1, 1);
    monthStart.setHours(0, 0, 0, 0); // Normalize to start of day
    const monthEnd = new Date(filters.year, filters.month, 0);
    monthEnd.setHours(23, 59, 59, 999); // Normalize to end of day

    if (requestStartDate <= monthEnd && requestEndDate >= monthStart) {
      if (!employeeLeaveDays[employeeId]) {
        employeeLeaveDays[employeeId] = {};
      }
      if (!employeeHalfDayLeaves[employeeId]) {
        employeeHalfDayLeaves[employeeId] = new Set<string>();
      }

      // Calculate overlapping days (dates are already normalized)
      const overlapStart = new Date(
        Math.max(requestStartDate.getTime(), monthStart.getTime())
      );
      overlapStart.setHours(0, 0, 0, 0); // Ensure normalized
      const overlapEnd = new Date(
        Math.min(requestEndDate.getTime(), monthEnd.getTime())
      );
      overlapEnd.setHours(23, 59, 59, 999); // Ensure normalized

      for (
        let d = new Date(overlapStart);
        d <= overlapEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const dayOfMonth = d.getDate().toString();
        employeeLeaveDays[employeeId][dayOfMonth] = (
          request.leaveType
        );

        // Track half-day leaves
        if (request.isHalfDay) {
          employeeHalfDayLeaves[employeeId].add(dayOfMonth);
        }
      }
    }
  });

  // Now process attendance records with the 4-hour rule
  attendanceRecords.forEach((record) => {
    const employeeId = record.userId._id;
    const date = new Date(record.date).getDate().toString();

    if (!employeeAttendance[employeeId]) {
      employeeAttendance[employeeId] = {};
    }

    // Check if employee has leave for this day
    const hasLeaveForDay =
      employeeLeaveDays[employeeId] && employeeLeaveDays[employeeId][date];
    // Check if employee has half-day leave for this day
    const isHalfDayLeave =
      employeeHalfDayLeaves[employeeId] &&
      employeeHalfDayLeaves[employeeId].has(date);

    // Determine the correct status based on work hours and leave status
    const status = determineAttendanceStatus(
      record,
      !!hasLeaveForDay,
      isHalfDayLeave
    );
    employeeAttendance[employeeId][date] = status;
  });

  // Finally, add leave days where there are no attendance records
  Object.keys(employeeLeaveDays).forEach((employeeId) => {
    if (!employeeAttendance[employeeId]) {
      employeeAttendance[employeeId] = {};
    }

    Object.keys(employeeLeaveDays[employeeId]).forEach((day) => {
      // Only add if no attendance record exists for this day
      if (!employeeAttendance[employeeId][day]) {
        employeeAttendance[employeeId][day] =
          employeeLeaveDays[employeeId][day];
      }
    });
  });

  return employeeAttendance;
};

export const calculateEmployeeSummary = (
  employeeId: string,
  attendanceRecords: AttendanceRecord[],
  leaveRequests: LeaveRequest[],
  filters: AttendanceFilters
): AttendanceSummary => {
  const employeeRecords = attendanceRecords.filter(
    (record) => record.userId._id === employeeId
  );

  // Get approved leave requests for this employee in the selected month
  const startDate = new Date(filters.year, filters.month - 1, 1);
  startDate.setHours(0, 0, 0, 0); // Normalize to start of day
  const endDate = new Date(filters.year, filters.month, 0);
  endDate.setHours(23, 59, 59, 999); // Normalize to end of day

  const employeeLeaveRequests = leaveRequests.filter((request) => {
    // Check if the IDs match - convert both to strings for comparison
    const requestUserId = String(request.userId || "");
    const employeeIdStr = String(employeeId || "");
    if (requestUserId !== employeeIdStr) {
      return false;
    }
    if (request.status !== "approved" && request.status !== "approved_admin") {
      return false;
    }

    // Parse dates and normalize to compare only date part (ignore time)
    const requestStartDate = new Date(request.startDate);
    requestStartDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const requestEndDate = new Date(request.endDate);
    requestEndDate.setHours(23, 59, 59, 999); // Normalize to end of day

    // Check if dates are valid
    if (isNaN(requestStartDate.getTime()) || isNaN(requestEndDate.getTime())) {
      return false;
    }

    // Check if leave request overlaps with the selected month
    // Overlap occurs if: requestStartDate <= endDate AND requestEndDate >= startDate
    const overlaps = requestStartDate <= endDate && requestEndDate >= startDate;
    return overlaps;
  });

  // Calculate leave days from approved requests
  let totalLeaveDays = 0;
  const leaveDaysSet = new Set<string>(); // Track specific leave days
  const halfDayLeaveDaysSet = new Set<string>(); // Track half-day leave days

  employeeLeaveRequests.forEach((request) => {
    // Parse dates and normalize to compare only date part (ignore time)
    const requestStartDate = new Date(request.startDate);
    requestStartDate.setHours(0, 0, 0, 0); // Normalize to start of day
    const requestEndDate = new Date(request.endDate);
    requestEndDate.setHours(23, 59, 59, 999); // Normalize to end of day

    // Calculate overlapping days with the selected month
    const monthStart = new Date(filters.year, filters.month - 1, 1);
    monthStart.setHours(0, 0, 0, 0); // Normalize to start of day
    const monthEnd = new Date(filters.year, filters.month, 0);
    monthEnd.setHours(23, 59, 59, 999); // Normalize to end of day

    const overlapStart = new Date(
      Math.max(requestStartDate.getTime(), monthStart.getTime())
    );
    const overlapEnd = new Date(
      Math.min(requestEndDate.getTime(), monthEnd.getTime())
    );

    if (overlapStart <= overlapEnd) {
      const daysDiff =
        Math.ceil(
          (overlapEnd.getTime() - overlapStart.getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1;

      if (request.isHalfDay) {
        totalLeaveDays += daysDiff * 0.5;
      } else {
        totalLeaveDays += daysDiff;
      }

      // Track specific leave days
      for (
        let d = new Date(overlapStart);
        d <= overlapEnd;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        leaveDaysSet.add(dateStr);
        if (request.isHalfDay) {
          halfDayLeaveDaysSet.add(dateStr);
        }
      }
    }
  });

  // Apply work hours rule when calculating present, absent, and half days
  // < 4 hours = Absent
  // >= 4 hours AND < 7 hours = Half Day
  // >= 7 hours = Present
  let presentDays = 0;
  let absentDays = 0;
  let halfDays = 0;

  employeeRecords.forEach((record) => {
    const recordDate = new Date(record.date).toISOString().split("T")[0];
    const hasLeaveForDay = leaveDaysSet.has(recordDate);
    const isHalfDayLeave = halfDayLeaveDaysSet.has(recordDate);
    const workHours = record.totalWorkHours || 0;

    // If there's a half-day leave for this date, count as half-day regardless of work hours
    if (isHalfDayLeave) {
      halfDays++;
    } else if (hasLeaveForDay) {
      // If full-day leave is applied, count as leave (not absent)
      // Leave days are already counted in totalLeaveDays
    } else if (workHours < 4) {
      // Less than 4 hours = absent
      absentDays++;
    } else if (workHours >= 4 && workHours < 7) {
      // 4 to 7 hours = half day
      halfDays++;
    } else if (workHours >= 7) {
      // 7+ hours = present
      presentDays++;
    } else if (record.status === "absent") {
      absentDays++;
    }
  });

  // Calculate total absent days including half days (0.5 each)
  const totalAbsentDays = absentDays + halfDays * 0.5;

  // Calculate work hours from attendance records
  let totalWorkHours = 0;
  let totalBreakHours = 0;
  let netWorkHours = 0;

  employeeRecords.forEach((record) => {
    if (record.totalWorkHours) {
      totalWorkHours += record.totalWorkHours;
    }
    if (record.totalBreakHours) {
      totalBreakHours += record.totalBreakHours;
    }
    if (record.netWorkHours) {
      netWorkHours += record.netWorkHours;
    }
  });

  // If netWorkHours is not calculated, calculate it as totalWorkHours - totalBreakHours
  if (netWorkHours === 0 && totalWorkHours > 0) {
    netWorkHours = totalWorkHours - totalBreakHours;
  }

  // Ensure totalBreakHours is always a number (0 if no breaks taken)
  totalBreakHours = totalBreakHours || 0;

  const summary = {
    totalDays: getDaysInMonth(filters.year, filters.month),
    presentDays: presentDays,
    absentDays: totalAbsentDays,
    halfDays: halfDays,
    leaveDays: totalLeaveDays,
    totalLeaves: totalLeaveDays,
    totalWorkHours: Math.round(totalWorkHours * 100) / 100, // Round to 2 decimal places
    totalBreakHours: Math.round(totalBreakHours * 100) / 100, // Round to 2 decimal places
    netWorkHours: Math.round(netWorkHours * 100) / 100, // Round to 2 decimal places
  };

  return summary;
};
