    import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

    import type {
  ICreateLeaveBody,
  ILeave,
  ILeaveBalanceItem,
  ILeaveBalanceReportPayload,
  ILeaveBalanceReportQuery,
  ILeaveBalanceUI,
  ILeaveDecisionBody,
  ILeaveListPayload,
  IPullbackLeaveBody,
  LeaveBalanceReportResponse,
  LeaveBalanceResponse,
  LeaveListResponse,
  LeaveSingleResponse
} from "../../types/leave.api.types";

    /* ===================================
    Query string builder (same pattern)
    =================================== */

    function buildQueryString(params: Record<string, unknown>): string {
    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
        }
    });

    const qs = search.toString();
    return qs ? `?${qs}` : "";
    }

    /* ===================================
    Leave API Slice
    =================================== */

    export const leaveApi = createApi({
    reducerPath: "leaveApi",
    baseQuery,
    tagTypes: ["Leave", "LeaveList", "LeaveBalance"],

    endpoints: (builder) => ({

        /* =========================
        GET MY LEAVES
        ========================= */

        getMyLeaves: builder.query<ILeaveListPayload, { page?: number; limit?: number } | void>({
        query: (params) => {
    const safeParams = params ?? {};
    return {
        url: `/v2/leave/my-leave${buildQueryString(safeParams)}`,
    };
    },
        transformResponse: (raw: LeaveListResponse) =>
            raw.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        providesTags: ["LeaveList"],
        }),

        /* =========================
        GET ALL LEAVES (manager/admin)
        ========================= */

        getLeaves: builder.query<ILeaveListPayload, Record<string, unknown> | void>({
        query: (params) => {
    const safeParams = params ?? {};
    return {
        url: `/v2/leave${buildQueryString(safeParams)}`,
    };
    },
        transformResponse: (raw: LeaveListResponse) =>
            raw.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
        providesTags: ["LeaveList"],
        }),

        /* =========================
        CREATE
        ========================= */

        createLeave: builder.mutation<ILeave | undefined, ICreateLeaveBody>({
        query: (body) => ({
            url: "/v2/leave",
            method: "POST",
            body,
        }),
        transformResponse: (raw: LeaveSingleResponse) => raw.data,
        invalidatesTags: ["LeaveList", "LeaveBalance"],
        }),

        /* =========================
        APPROVE / REJECT
        ========================= */

        decideLeave: builder.mutation<
        ILeave | undefined,
        { id: string; body: ILeaveDecisionBody }
        >({
        query: ({ id, body }) => ({
            url: `/v2/leave/${id}/action`,
            method: "PUT",
            body,
        }),
        transformResponse: (raw: LeaveSingleResponse) => raw.data,
        invalidatesTags: ["LeaveList", "LeaveBalance"],
        }),

        /* =========================
        PULLBACK
        ========================= */

        pullbackLeave: builder.mutation<
        ILeave | undefined,
        { id: string; body: IPullbackLeaveBody }
        >({
        query: ({ id, body }) => ({
            url: `/v2/leave/pullback/${id}`,
            method: "PUT",
            body,
        }),
        transformResponse: (raw: LeaveSingleResponse) => raw.data,
        invalidatesTags: ["LeaveList", "LeaveBalance"],
        }),

        /* =========================
        BALANCE
        ========================= */

       getMyLeaveBalance: builder.query<ILeaveBalanceUI | undefined, { year?: number; leaveType?: string } | void>({
  query: (params) => {
    const safeParams = params ?? {};
    return {
      url: `/v2/leave/balance/me${buildQueryString(safeParams)}`,
    };
  },

  transformResponse: (raw: LeaveBalanceResponse) => {
    const data = raw.data;
    if (!data) return undefined;

    const balancesMap: Record<string, number> = {};
const types = data.balances.map((b: ILeaveBalanceItem) => {
  balancesMap[b.leaveTypeCode] = b.available; 

  return {
    id: b.leaveType,
    code: b.leaveTypeCode,
    label: b.leaveTypeName,
    available: b.available,
  };
});

    return {
      balancesMap,
      types,
    };
  },

  providesTags: ["LeaveBalance"],
}),

        getLeaveBalanceReport: builder.query<
          ILeaveBalanceReportPayload,
          ILeaveBalanceReportQuery | void
        >({
          query: (params) => {
            const safeParams = (params ?? {}) as Record<string, unknown>;
            return {
              url: `/v2/leave/balance-report${buildQueryString(safeParams)}`,
            };
          },
          transformResponse: (raw: LeaveBalanceReportResponse): ILeaveBalanceReportPayload => {
            const payload = raw?.data ?? (raw as unknown as ILeaveBalanceReportPayload);
            if (payload && typeof payload === "object" && "data" in payload && "total" in payload) {
              return payload;
            }
            return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
          },
          providesTags: ["LeaveBalance"],
        }),

        getLeaveBalanceReportDownload: builder.query<
          Blob,
          { year?: number; search?: string; department?: string } | void
        >({
          query: (params) => {
            const safeParams = (params ?? {}) as Record<string, unknown>;
            return {
              url: `/v2/leave/balance-report/download${buildQueryString(safeParams)}`,
              responseHandler: (response) => response.blob(),
            };
          },
          keepUnusedDataFor: 0,
        }),
    }),
    });

    /* ===================================
    Hooks
    =================================== */

    export const {
    useGetMyLeavesQuery,
    useGetLeavesQuery,
    useCreateLeaveMutation,
    useDecideLeaveMutation,
    usePullbackLeaveMutation,
    useGetMyLeaveBalanceQuery,
    useGetLeaveBalanceReportQuery,
    useLazyGetLeaveBalanceReportDownloadQuery,
    } = leaveApi;
