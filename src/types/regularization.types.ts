import {
  WorkflowStatusCode,
  WORKFLOW_PENDING_STATUSES,
  WORKFLOW_APPROVED_STATUSES,
  WORKFLOW_REJECTED_STATUSES,
  WORKFLOW_CANCELLED_STATUSES,
} from "../utils/constants";

// Attendance Regularization Types
export interface IAttendanceRegularization {
  _id: string;
  userId: string;
  fullName: string;
  employeeId: string;
  departmentName: string;
  date: string; // YYYY-MM-DD
  regularizationType: RegularizationType;
  requestedCheckInTime: string; // HH:MM
  requestedCheckOutTime: string; // HH:MM
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  reason: string;
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

export interface IRegularizationFilters {
  userId?: string;
  department?: string;
  status?: RegularizationStatus | string; // Allow string for comma-separated statuses
  regularizationType?: RegularizationType;
  startDate?: string;
  endDate?: string;
  month?: string; // YYYY-MM
  year?: string;
  managerId?: string;
  currentApproverId?: string;
  reporteesOnly?: boolean; // When true, shows only direct reportees for admin users
}

export interface ICreateRegularizationRequest {
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
