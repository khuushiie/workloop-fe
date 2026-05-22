export interface AttendanceRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    workEmail: string;
    department: string;
    joiningDate?: string;
    isActive?: boolean;
  };
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  totalWorkHours?: number;
  totalBreakHours?: number;
  netWorkHours?: number;
  isHalfDay: boolean;
  notes?: string;
}

export interface Employee {
  _id: string;
  name: string;
  workEmail: string;
  department: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  joiningDate?: string;
  status?: "active" | "inactive" | "terminated";
  deactivatedAt?: string;
  terminatedAt?: string;
}

export type Department = string;

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  totalLeaves: number;
  totalWorkHours: number;
  totalBreakHours: number;
  netWorkHours: number;
}

export interface LeaveRequest {
  _id: string;
  userId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
  days?: number;
  isHalfDay?: boolean;
}

export interface AttendanceFilters {
  month: number;
  year: number;
  department?: string;
  statuses?: string;
  employeeId?: string;
  isActive?: "all" | "active" | "inactive";
}

export interface AttendancePagination {
  page: number;
  limit: number;
  total: number;
}

// Holiday interface
export interface HolidayRecord {
  _id: string;
  name: string;
  date: string;
  description?: string;
  isMandatory: boolean;
  year: number;
}

export interface AttendanceTableProps {
  users: UserAttendanceData[];
  holidays?: HolidayRecord[];
  filters: AttendanceFilters;
  loading: boolean;
  isAdmin?: boolean;
  pagination?: AttendancePagination;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (limit: number) => void;
}

// New types for the user-centric backend response
export interface AttendanceDayStatus {
  [day: string]: string; // "1": "P", "2": "A", "3": "EL", etc.
}

// User-centric data structure - each user contains all their attendance data
export interface UserAttendanceData {
  _id: string;
  name: string;
  workEmail: string;
  department: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  joiningDate?: string;
  status?: string;
  deactivatedAt?: string;
  terminatedAt?: string;
  // Attendance data embedded in user object
  attendanceStatus: AttendanceDayStatus;
  summary: AttendanceSummary;
  attendanceRecords: AttendanceRecord[];
}

export interface AttendanceReportResponse {
  users: UserAttendanceData[];
  holidays: HolidayRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
