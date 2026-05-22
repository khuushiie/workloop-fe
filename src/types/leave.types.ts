import { WorkflowStatusCode, Leaves } from "../utils/constants";

export interface ILeaveRequest {
  id: string;
  userId: string;
  userName: string;
  employeeId?: string;
  leaveType: Leaves;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: WorkflowStatusCode;
  statusLabel?: string;
  currentActorIds?: string[];
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

export interface ILeaveCredit {
  id: string;
  userId: string;
  userName: string;
  leaveType: Leaves;
  allocated: number;
  used: number;
  remaining: number;
  year: number;
}

/** @deprecated Use ILeaveRequest */
export type LeaveRequest = ILeaveRequest;
/** @deprecated Use ILeaveCredit */
export type LeaveCredit = ILeaveCredit;
