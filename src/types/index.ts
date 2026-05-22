import {
  WorkflowStatusCode,
  WORKFLOW_PENDING_STATUSES,
  WORKFLOW_APPROVED_STATUSES,
  WORKFLOW_REJECTED_STATUSES,
  WORKFLOW_CANCELLED_STATUSES,
  RoleTypeEnum,
  Leaves,
  CompOffStatusCode,
} from "../utils/constants";

export interface User {
  _id: string;
  id?: string; // For backward compatibility
  username: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  workEmail: string;
  role: RoleTypeEnum;
  isSuperAdmin?: boolean;
  department: string;
  joinDate: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  employeeId?: string;
  leaveTypeName?: string;
  leaveType: Leaves;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: WorkflowStatusCode;
  statusLabel?: string;
  currentActorId?: string;
  currentActorName?: string;
  isHalfDay?: boolean;
  appliedDate: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  department?: string;
  reportingManagerName?: string;
  functionalManagerName?: string;
  approvalHistory?: Array<{
    actorId?: string;
    actorName?: string;
    role: string;
    decision: string;
    decidedAt: string;
    statusAfter: WorkflowStatusCode;
    statusLabelAfter?: string;
    remarks?: string;
  }>;
}


export interface CompOffRequest {
  _id: string;
  userId: string;
  leaveDate: string;
  isFirstHalf?: boolean;
  isSecondHalf?: boolean;
  comment: string;
  status: CompOffStatusCode;
  statusLabel?: string;
  actorId?: string;
  approvedDate?: string;
  rejectionReason?: string;
  cancelledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCredit {
  id: string;
  userId: string;
  userName: string;
  leaveType: Leaves;
  allocated: number;
  used: number;
  remaining: number;
  year: number;
}

export interface Timesheet {
  id: string;
  userId: string;
  userName: string;
  date: string;
  hoursWorked: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface Employee {
  _id: string;
  id?: string; // For backward compatibility
  employeeId: string;
  profilePic?: string;
  firstName: string;
  lastName: string;
  email?: string;
  workEmail: string;
  phone: string;
  gender: string;
  bloodGroup?: string;
  uanNumber?: string;
  dob?: string;
  aadharCardNo?: string;
  panCardNo?: string;
  department: string;
  position: string;
  joinDate: string;
  employmentType:
  | "permanent"
  | "contract"
  | "intern"
  | "trainee"
  | "part-time"
  | "consultant";
  status: "active" | "inactive" | "terminated";
  deactivatedAt?: string;
  terminatedAt?: string;
  reportingManager?: string;
  functionalManager?: string;
  reportingManagerName?: string;
  functionalManagerName?: string;
  manager?: string | null;
  role?: RoleTypeEnum;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    bankName: string;
  };

  educationDetails?: {
    institutionName: string;
    discipline: string;
    startDate: string;
    endDate: string;
    grade: string;
    explainBreaks?: string;
  }[];

  previousEmployments?: {
    employerName: string;
    designation: string;
    startDate: string;
    endDate: string;
    annualCTC: number;
    breakReason: string;
  }[];
}

export interface Holiday {
  _id?: string;
  name: string;
  date: string;
  year: string;
  isMandatory: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HolidayFormData {
  name: string;
  date: string;
  year: string;
  isMandatory: boolean;
  description?: string;
}

// Attendance Regularization Types
export interface AttendanceRegularization {
  _id: string;
  userId: string;
  userName: string;
  employeeId: string;
  department: string;
  date: string; // YYYY-MM-DD
  regularizationType: RegularizationType | string;
  requestedCheckInTime: string; // HH:MM
  requestedCheckOutTime: string; // HH:MM
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  reason: string;
  status: WorkflowStatusCode;
  currentApproverId?: string;
  currentApproverName?: string;
  statusLabel?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  rejectionReason?: string;
  appliedDate: string;
  reportingManager?: string;
  originalAttendanceId?: string;
  attendanceUpdated: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum RegularizationType {
  FORGOT_CHECKIN = "forgot_checkin",
  LATE_CHECKIN = "late_checkin",
  FORGOT_CHECKOUT = "forgot_checkout",
  EARLY_CHECKOUT = "early_checkout",
  MISSED_BREAK = "missed_break",
  SYSTEM_ERROR = "system_error",
  OTHER = "other",
}

export type RegularizationStatus = WorkflowStatusCode;

export interface RegularizationFilters {
  userId?: string;
  department?: string;
  status?: RegularizationStatus | string; // Allow string for comma-separated statuses
  regularizationType?: RegularizationType | string;
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM
  year?: string;
  managerId?: string;
  currentApproverId?: string;
  search?: string;
  reporteesOnly?: boolean; // When true, shows only direct reportees for admin users
}

export interface CreateRegularizationRequest {
  userId?: string;
  userName: string;
  employeeId: string;
  department: string;
  date: string;
  regularizationType: RegularizationType;
  requestedCheckInTime: string;
  requestedCheckOutTime: string;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  reason: string;
  reportingManager?: string;
  originalAttendanceId?: string;
}

export const ALL_REGULARIZATION_STATUSES: RegularizationStatus[] = [
  ...WORKFLOW_PENDING_STATUSES,
  ...WORKFLOW_APPROVED_STATUSES,
  ...WORKFLOW_REJECTED_STATUSES,
  ...WORKFLOW_CANCELLED_STATUSES,
];

// Leave Balance Report Types
export interface LeaveBalanceData {
  userId: string;
  userName: string;
  employeeId: string;
  department: string;
  position: string;
  manager: string;
  reportingManager: string;
  joinDate: string;
  earned: {
    allocated: number;
    used: number;
    balance: number;
  };
  sick: {
    allocated: number;
    used: number;
    balance: number;
  };
  lwp: {
    used: number;
  };
  wfh: {
    used: number;
  };
  flexi_weekend: {
    allocated: number;
    used: number;
    balance: number;
  };
  totalAllocated: number;
  totalUsed: number;
  totalBalance: number;
}

export interface LeaveBalanceReport {
  filters: {
    year: number;
    month?: number;
    department?: string;
  };
  summary: {
    totalEmployees: number;
    totalEarnedAllocated: number;
    totalSickAllocated: number;
    totalEarnedUsed: number;
    totalSickUsed: number;
    totalLWPUsed: number;
    totalWFHUsed: number;
    totalBalance: number;
    employeesWithZeroBalance: number;
    employeesWithExcessLWP: number;
  };
  employees: LeaveBalanceData[];
  reportGeneratedAt: string;
}

export interface LeaveBalanceReportFilters {
  department?: string;
  userId?: string;
  year?: string;
  month?: string;
}

export * from "./attendance.types";
export * from "./leave.types";
export * from "./comp-off.types";
export * from "./timesheet-app.types";
export * from "./holiday.types";
export * from "./regularization.types";
export * from "./leave-balance.types";
export * from "./user.api.types";
export * from "./kpi.api.types";
export * from "./survey.api.types";
