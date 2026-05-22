

import type { IApiResponse } from "./user.api.types"; 

/* ===============================
   Leave Entity
   =============================== */

export interface ILeave {
  id: string;
  userId: string;
  userName: string;
  employeeId: string;

  leaveType: string;
  leaveTypeName: string;

  startDate: string;
  endDate: string;

  days: number;
  reason?: string;

  isHalfDay: boolean;
  halfDayType?: "first_half" | "second_half";

  status: string;
  statusLabel: string;

  currentActorIds?: string[];
  currentActorName?: string;

  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;

  rejectionReason?: string;

  department?: string;
  departmentName?: string;

  createdAt: string;
  updatedAt: string;
}

/* ===============================
   Create Leave
   =============================== */

export interface ICreateLeaveBody {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  isHalfDay: boolean;
  halfDayType?: "first_half" | "second_half";
}

/* ===============================
   Approve / Reject
   =============================== */

export interface ILeaveDecisionBody {
  decision: "approved" | "rejected";
  remarks?: string;
}

/* ===============================
   Pullback
   =============================== */

export interface IPullbackLeaveBody {
  reason?: string;
}

/* ===============================
   Paginated List
   =============================== */

export interface ILeaveListPayload {
  data: ILeave[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ===============================
   Balance
   =============================== */

export interface ILeaveBalanceItem {
  leaveType: string;
  leaveTypeName: string;
  leaveTypeCode: string;
  credited: number;
  used: number;
  pending: number;
  available: number;
  year: number;
}

export interface ILeaveBalanceUI {
  balancesMap: Record<string, number>;
  types: {
    id: string;
    code: string;  
    label: string;
    available: number;
  }[];
}

export interface ILeaveBalancePayload {
  userId: string;
  year: number;
  balances: ILeaveBalanceItem[];
}

/* ===============================
   API WRAPPERS
   =============================== */

/* ===============================
   Leave Balance Report (V2)
   =============================== */

export interface ILeaveBalanceReportEntry {
  label: string;
  value: number;
}

export interface ILeaveBalanceReportItem {
  fullName: string;
  employeeId: string;
  workEmail: string;
  departmentName: string;
  leaveBalances: ILeaveBalanceReportEntry[];
  pendingRequests: number;
  totalBalance: number;
}

export interface ILeaveBalanceReportPayload {
  data: ILeaveBalanceReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  year?: number;
}

export interface ILeaveBalanceReportQuery {
  page?: number;
  limit?: number;
  year?: number;
  /** Search by first name, last name, or full name */
  search?: string;
  /** Filter by department (master config ID) */
  department?: string;
}

/* ===============================
   API WRAPPERS
   =============================== */

export type LeaveSingleResponse = IApiResponse<ILeave>;
export type LeaveListResponse = IApiResponse<ILeaveListPayload>;
export type LeaveBalanceResponse = IApiResponse<ILeaveBalancePayload>;
export type LeaveBalanceReportResponse = IApiResponse<ILeaveBalanceReportPayload>;
