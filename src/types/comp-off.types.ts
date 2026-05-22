import { CompOffStatusCode } from "../utils/constants";

export interface ICompOffRequest {
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

/** @deprecated Use ICompOffRequest */
export type CompOffRequest = ICompOffRequest;
