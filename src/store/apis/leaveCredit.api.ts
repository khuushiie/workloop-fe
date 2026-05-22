import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

// --- Interfaces ---

export interface ILeaveTransaction {
  id: string;
  userId: string;
  username: string; // Populated username from backend
  leaveType: string; // ID of leave type
  leaveTypeName: string; // Name of leave type
  type: "credit" | "debit"; // Transaction type
  days: number;
  month: number;
  year: number;
  reason?: string;
  createdAt: string;
  createdBy: string;
}

export interface ILeaveTransactionRequest {
  userIds: string[]; // Array of ObjectIds
  leaveType: string; // ObjectId
  credited?: number;  // Credited
  debited?: number;  // Debited
  creditedOn?: string; // ISO Date String
  debitedOn?: string; // ISO Date String
  month: number;
  year: number;
  reason?: string;
}

// Query Params for Filtering History
export interface ILeaveTransactionFilters {
  page?: number;
  limit?: number;
  userName?: string;
  leaveType?: string;
  year?: string | number;
  month?: string | number;
}

// Paginated Response Structure
export interface IPaginatedLeaveTransactions {
  data: ILeaveTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Generic Response Wrapper
interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export enum ILeaveTransactionType {
  Credited = "Credited",
  Debited = "Debited",
}

// Kept interface to maintain table compatibility
export interface ILeaveCredit {
  id: string;
  userId: string;
  userName: string;
  leaveType: string;
  credited?: number;
  debited?: number;
  transactionDate: string;
  month: number;
  year: number;
  days?: number;
  type?: ILeaveTransactionType;
}


// --- API Definition ---

export const leaveCreditApi = createApi({
  reducerPath: "leaveCreditApi",
  baseQuery: baseQuery,
  tagTypes: ["LeaveCredit", "LeaveBalance"], // Tags for cache management

  endpoints: (builder) => ({

    // 1. Get All Leave Transactions (Credits & Debits)
    // Matches GET /api/v2/leave/credits
    getLeaveTransactions: builder.query<IApiResponse<IPaginatedLeaveTransactions>, ILeaveTransactionFilters>({
      query: (params) => {
        // Clean params to remove empty strings/nulls
        const cleanedParams = Object.fromEntries(
          Object.entries(params).filter(([_, v]) => v != null && v !== "")
        );
        return {
          url: "/v2/leave/credits",
          method: "GET",
          params: cleanedParams,
        };
      },
      providesTags: ["LeaveCredit"],
    }),

    // 2. Credit Leave 
    // Matches POST /api/v2/leave/credit
    creditLeave: builder.mutation<IApiResponse<void>, ILeaveTransactionRequest>({
      query: (body) => ({
        url: "/v2/leave/credit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveCredit", "LeaveBalance"],
    }),

    // 3. Debit Leave
    // Matches POST /api/v2/leave/debits
    debitLeave: builder.mutation<IApiResponse<void>, ILeaveTransactionRequest>({
      query: (body) => ({
        url: "/v2/leave/debits", // Note: Swagger says 'debits' plural for POST
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveCredit", "LeaveBalance"],
    }),

  }),
});

export const {
  useGetLeaveTransactionsQuery,
  useCreditLeaveMutation,
  useDebitLeaveMutation,
} = leaveCreditApi;