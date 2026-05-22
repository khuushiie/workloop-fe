import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import type { IApiResponse } from "../../types";

/**
 * Backend v2 comp-off types.
 * Raw HTTP responses are wrapped in IApiResponse<T> by the backend;
 * transformResponse unwraps the envelope so hooks return the inner payload directly.
 */

export interface CompOffItem {
  id: string;
  userId: string;
  fullName?: string;
  leaveDate: string;
  isFirstHalf?: boolean;
  isSecondHalf?: boolean;
  comment: string;
  status: string;
  statusLabel?: string;
  actorId?: string;
  approvedDate?: string;
  rejectionReason?: string;
  cancelledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompOffListResponse {
  data: CompOffItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CompOffCreateResponse {
  results: CompOffItem[];
  skipped: string[];
}

export interface CompOffListParams {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface CompOffCreateBody {
  userIds: string[];
  leaveDate: string;
  comment: string;
  isFirstHalf?: boolean;
  isSecondHalf?: boolean;
}

function buildCompOffQueryString(params: CompOffListParams): string {
  const search = new URLSearchParams();
  if (params.status != null) search.set("status", String(params.status));
  if (params.userId != null) search.set("userId", String(params.userId));
  if (params.page != null) search.set("page", String(params.page));
  if (params.limit != null) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const compOffApi = createApi({
  reducerPath: "compOffApi",
  baseQuery,
  tagTypes: ["CompOffList"],
  endpoints: (builder) => ({
    getCompOffList: builder.query<
      CompOffListResponse,
      CompOffListParams | void
    >({
      query: (params) => ({
        url: `/v2/comp-off${buildCompOffQueryString(params ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<CompOffListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      providesTags: (_, __, arg) => [
        { type: "CompOffList", id: arg ? JSON.stringify(arg) : "list" },
      ],
    }),

    createCompOff: builder.mutation<CompOffCreateResponse, CompOffCreateBody>({
      query: (body) => ({
        url: "/v2/comp-off",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<CompOffCreateResponse>) =>
        raw.data ?? { results: [], skipped: [] },
      invalidatesTags: [{ type: "CompOffList" }],
    }),

    approveCompOff: builder.mutation<
      CompOffItem,
      { id: string; actorId: string }
    >({
      query: ({ id, actorId }) => ({
        url: `/v2/comp-off/${id}/approve`,
        method: "PATCH",
        body: { actorId },
      }),
      transformResponse: (raw: IApiResponse<CompOffItem>) =>
        raw.data as CompOffItem,
      invalidatesTags: [{ type: "CompOffList" }],
    }),

    rejectCompOff: builder.mutation<
      CompOffItem,
      { id: string; actorId: string; reason: string }
    >({
      query: ({ id, actorId, reason }) => ({
        url: `/v2/comp-off/${id}/reject`,
        method: "PATCH",
        body: { actorId, reason },
      }),
      transformResponse: (raw: IApiResponse<CompOffItem>) =>
        raw.data as CompOffItem,
      invalidatesTags: [{ type: "CompOffList" }],
    }),

    pullBackCompOff: builder.mutation<
      CompOffItem,
      { id: string; userId: string }
    >({
      query: ({ id, userId }) => ({
        url: `/v2/comp-off/${id}/pull-back`,
        method: "PATCH",
        body: { userId },
      }),
      transformResponse: (raw: IApiResponse<CompOffItem>) =>
        raw.data as CompOffItem,
      invalidatesTags: [{ type: "CompOffList" }],
    }),
  }),
});

export const {
  useGetCompOffListQuery,
  useLazyGetCompOffListQuery,
  useCreateCompOffMutation,
  useApproveCompOffMutation,
  useRejectCompOffMutation,
  usePullBackCompOffMutation,
} = compOffApi;
