import { OFFICE_CONFIG } from "../utils/config";
import { attendanceEventService } from "./attendanceEvents";
import { apiAxios } from "./api";

export interface Location {
  latitude: number;
  longitude: number;
}

export interface CheckInData {
  userId: string;
  date: string;
  checkInTime: string;
  checkInLocation: Location;
  notes?: string;
}

export interface CheckOutData {
  attendanceId?: string;
  checkOutTime: string;
  checkOutLocation: Location;
  notes?: string;
}

export interface BreakData {
  attendanceId?: string;
  type: "lunch" | "tea" | "personal";
  startTime: string;
  notes?: string;
}

export interface EndBreakData {
  attendanceId?: string;
  breakId: string;
  endTime: string;
  notes?: string;
}

export interface AttendanceReport {
  userId?: string;
  startDate?: string;
  endDate?: string;
  status?: "present" | "half_day" | "absent" | "leave" | "late";
  isHalfDay?: boolean;
  // Additional filters for server-side filtering
  month?: number;
  year?: number;
  department?: string;
  search?: string;
  statuses?: string;
  employeeId?: string;
  isActive?: "all" | "active" | "inactive";
  // Pagination
  page?: number;
  limit?: number;
}

/** Minimum shape of each record passed to the bulk-update endpoint */
export interface IAttendanceBulkItem {
  attendanceId?: string;
  userId?: string;
  date?: string;
  status?: string;
  isHalfDay?: boolean;
  notes?: string;
  [key: string]: unknown;
}

class AttendanceApiService {
  private baseURL = OFFICE_CONFIG.apiBaseUrl;

  private getAuthHeaders() {
    const token = localStorage.getItem("hrms_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Get current location
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Error getting location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Check in
  async checkIn(data: CheckInData) {
    const response = await apiAxios.post(`/attendance/check-in`, data);

    // Trigger attendance update event
    attendanceEventService.onAttendanceUpdate(data.userId);

    return response;
  }

  // Check out
  async checkOut(data: CheckOutData) {
    // If no attendanceId provided, the backend will automatically find today's attendance
    const checkOutData = {
      checkOutTime: data.checkOutTime,
      checkOutLocation: data.checkOutLocation,
      notes: data.notes,
    };
    const response = await apiAxios.post(`/attendance/check-out`, checkOutData);

    // Get current user ID from localStorage
    const userStr = localStorage.getItem("hrms_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      attendanceEventService.onAttendanceUpdate(user.id);
    }

    return response;
  }

  // Start break
  async startBreak(data: BreakData) {
    // If no attendanceId provided, the backend will automatically find today's attendance
    const breakData = {
      type: data.type,
      startTime: data.startTime,
      notes: data.notes,
    };
    const response = await apiAxios.post(`/attendance/break/start`, breakData);

    // Get current user ID from localStorage
    const userStr = localStorage.getItem("hrms_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      attendanceEventService.onAttendanceUpdate(user.id);
    }

    return response;
  }

  // End break
  async endBreak(data: EndBreakData) {
    // If no attendanceId provided, the backend will automatically find today's attendance
    const endBreakData = {
      breakId: data.breakId,
      endTime: data.endTime,
      notes: data.notes,
    };
    const response = await apiAxios.post(`/attendance/break/end`, endBreakData);

    // Get current user ID from localStorage
    const userStr = localStorage.getItem("hrms_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      attendanceEventService.onAttendanceUpdate(user.id);
    }

    return response;
  }

  // Get my attendance for a specific date
  async getMyAttendance(date: string) {
    return apiAxios.get(`/attendance/my-attendance/${date}`);
  }

  // Get my attendance history
  async getMyAttendanceHistory(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return apiAxios.get(`/attendance/my-attendance?${params.toString()}`);
  }

  // Get office location
  async getOfficeLocation() {
    return apiAxios.get(`/attendance/office-location`);
  }

  async getEmployees(search?: string, year?: number, month?: number) {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append("search", search.trim());
    }
    if (year) {
      params.append("year", year.toString());
    }
    if (month) {
      params.append("month", month.toString());
    }
    params.append("status", "active");
    const queryString = params.toString();
    return apiAxios.get(`/employees${queryString ? `?${queryString}` : ""}`);
  }

  // Get departments
  async getDepartments() {
    return apiAxios.get(`/employees/departments`);
  }

  // Get attendance report
  async getAttendanceReport(report: AttendanceReport) {
    const params = new URLSearchParams();

    // User identification
    if (report.userId) params.append("userId", report.userId);

    // Date range
    if (report.startDate) params.append("startDate", report.startDate);
    if (report.endDate) params.append("endDate", report.endDate);

    // Month/Year filters
    if (report.month !== undefined)
      params.append("month", report.month.toString());
    if (report.year !== undefined)
      params.append("year", report.year.toString());

    // Attendance status filters
    if (report.status) params.append("status", report.status);
    if (report.isHalfDay !== undefined)
      params.append("isHalfDay", report.isHalfDay.toString());

    // Employee filters
    if (report.department && report.department.trim() !== "") {
      params.append("department", report.department.trim());
    }
    if (report.search && report.search.trim() !== "") {
      params.append("search", report.search.trim());
    }
    if (report.statuses && report.statuses.trim() !== "") {
      params.append("statuses", report.statuses.trim());
    }
    if (report.employeeId && report.employeeId.trim() !== "") {
      params.append("employeeId", report.employeeId.trim());
    }

    // Pagination
    if (report.page !== undefined && report.page > 0) {
      params.append("page", report.page.toString());
    }
    if (report.limit !== undefined && report.limit > 0) {
      params.append("limit", report.limit.toString());
    }

    return apiAxios.get(`/attendance/report?${params.toString()}`);
  }

  /**
   * Get attendance report from V2 API.
   * Uses GET /api/v2/attendance/report with month, year, pagination and filters.
   */
  async getAttendanceReportV2(report: AttendanceReport) {
    const params = new URLSearchParams();

    if (report.month !== undefined)
      params.append("month", report.month.toString());
    if (report.year !== undefined)
      params.append("year", report.year.toString());
    if (report.page !== undefined && report.page > 0)
      params.append("page", report.page.toString());
    if (report.limit !== undefined && report.limit > 0)
      params.append("limit", report.limit.toString());
    if (report.department && report.department.trim() !== "")
      params.append("department", report.department.trim());
    if (report.search && report.search.trim() !== "")
      params.append("search", report.search.trim());
    if (report.statuses && report.statuses.trim() !== "")
      params.append("statuses", report.statuses.trim());

    return apiAxios.get(`/v2/attendance/report?${params.toString()}`);
  }

  // Admin: Get attendance statistics
  async getAttendanceStats(
    userId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    return apiAxios.get(`/attendance/stats?${params.toString()}`);
  }

  // Admin: Update attendance status
  async updateAttendanceStatus(
    attendanceId: string,
    status: string,
    isHalfDay?: boolean,
    notes?: string
  ) {
    return apiAxios.put(`/attendance/status/${attendanceId}`, {
      status,
      isHalfDay,
      notes,
    });
  }

  // Admin: Bulk update attendance
  async bulkUpdateAttendance(attendances: IAttendanceBulkItem[]) {
    return apiAxios.post(`/attendance/bulk-update`, { attendances });
  }

  async getCalendarData(month: number, year: number, userId?: string) {
    const params = new URLSearchParams();
    params.append("month", month.toString());
    params.append("year", year.toString());
    if (userId) {
      params.append("userId", userId);
    }
    return apiAxios.get(`/attendance/calendar?${params.toString()}`);
  }

  // Calculate distance between two points
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Format time
  formatTime(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Format date
  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  // Format time in HH:MM format
  formatTimeHoursMinutes(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;

    // Format as HH:MM
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  // Calculate work hours
  calculateWorkHours(
    checkInTime: Date | string,
    checkOutTime: Date | string
  ): number {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "half_day":
        return "bg-orange-100 text-orange-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "leave":
        return "bg-primary-100 text-primary-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  }

  // Get status label
  getStatusLabel(status: string): string {
    switch (status) {
      case "present":
        return "Present";
      case "late":
        return "Late";
      case "half_day":
        return "Half Day";
      case "absent":
        return "Absent";
      case "leave":
        return "Leave";
      case "not_checked_in":
        return "Not Checked In";
      case "not_checked_out":
        return "Not Checked Out";
      case "on_break":
        return "On Break";
      default:
        return "Unknown";
    }
  }
}

export default new AttendanceApiService();
