import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import type { IApiResponse } from "../../types";
import type {
  IAssignmentListQueryV2,
  IAssignmentListResultV2,
  IBulkCreateAssignmentBodyV2,
  IBulkCreateAssignmentResultV2,
  IBulkUpsertScoresBodyV2,
  IBulkUpsertScoresResultV2,
  ICreateKpiBodyV2,
  ICreateScoreBodyV2,
  ICreateKpiSetBodyV2,
  IGetKpisParamsV2,
  IGetKpisResultV2,
  IGetKpiSetsResultV2,
  IKpiResponseV2,
  IKpiScoringQueryV2,
  IKpiSetQueryV2,
  IKpiSetResponseV2,
  IKpiStatsV2,
  IScoreListQueryV2,
  IScoreListResultV2,
  IScoreResponseV2,
  IScoringContextQueryV2,
  IScoringContextResultV2,
  IMyPerformanceResponseV2,
  IUpdateKpiBodyV2,
  IUpdateKpiSetBodyV2,
} from "../../types/kpi.api.types";

function buildKpiQueryString(params: IGetKpisParamsV2): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildKpiSetQueryString(params: IKpiSetQueryV2): string {
  const search = new URLSearchParams();
  if (params.period !== undefined) {
    search.set("period", String(params.period));
  }
  if (params.isActive !== undefined) {
    search.set("isActive", String(params.isActive));
  }
  if (params.includeKpis !== undefined) {
    search.set("includeKpis", String(params.includeKpis));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildAssignmentListQueryString(params: IAssignmentListQueryV2): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.search !== undefined && params.search.trim() !== "")
    search.set("search", params.search.trim());
  if (params.department !== undefined && params.department.trim() !== "")
    search.set("department", params.department.trim());
  if (params.status !== undefined) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildKpiScoringQueryString(params: IKpiScoringQueryV2): string {
  const search = new URLSearchParams();
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.search !== undefined && params.search.trim() !== "")
    search.set("search", params.search.trim());
  if (params.department !== undefined && params.department.trim() !== "")
    search.set("department", params.department.trim());
  if (params.reportingManager !== undefined && params.reportingManager.trim() !== "")
    search.set("reportingManager", params.reportingManager.trim());
  if (params.functionalManager !== undefined && params.functionalManager.trim() !== "")
    search.set("functionalManager", params.functionalManager.trim());
  if (params.status !== undefined) search.set("status", params.status);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function buildScoringContextQueryString(params: IScoringContextQueryV2): string {
  const search = new URLSearchParams();
  search.set("userId", params.userId);
  search.set(
    "periodStart",
    typeof params.periodStart === "string" ? params.periodStart : (params.periodStart as Date).toISOString()
  );
  search.set(
    "periodEnd",
    typeof params.periodEnd === "string" ? params.periodEnd : (params.periodEnd as Date).toISOString()
  );
  search.set("timeline", params.timeline);
  return `?${search.toString()}`;
}

function buildScoreListQueryString(params: IScoreListQueryV2): string {
  const search = new URLSearchParams();
  if (params.userId !== undefined && params.userId.trim() !== "")
    search.set("userId", params.userId.trim());
  if (params.setId !== undefined && params.setId.trim() !== "")
    search.set("setId", params.setId.trim());
  if (params.period !== undefined) search.set("period", params.period);
  if (params.approvalStatus !== undefined) search.set("approvalStatus", params.approvalStatus);
  if (params.periodStartFrom !== undefined)
    search.set("periodStartFrom", typeof params.periodStartFrom === "string" ? params.periodStartFrom : (params.periodStartFrom as Date).toISOString());
  if (params.periodStartTo !== undefined)
    search.set("periodStartTo", typeof params.periodStartTo === "string" ? params.periodStartTo : (params.periodStartTo as Date).toISOString());
  if (params.periodEndFrom !== undefined)
    search.set("periodEndFrom", typeof params.periodEndFrom === "string" ? params.periodEndFrom : (params.periodEndFrom as Date).toISOString());
  if (params.periodEndTo !== undefined)
    search.set("periodEndTo", typeof params.periodEndTo === "string" ? params.periodEndTo : (params.periodEndTo as Date).toISOString());
  if (params.page !== undefined) search.set("page", String(params.page));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.sortBy !== undefined) search.set("sortBy", params.sortBy);
  if (params.sortOrder !== undefined) search.set("sortOrder", params.sortOrder);
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

const emptyStats: IKpiStatsV2 = {
  totalActiveSets: 0,
  totalActiveKpis: 0,
  totalActiveEmployees: 0,
  totalAssignedUsersActive: 0,
};

const emptyKpiList: IGetKpisResultV2 = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

const emptyKpiSetList: IGetKpiSetsResultV2 = {
  data: [],
  total: 0,
  filteredBy: "ALL",
};

const emptyAssignmentList: IAssignmentListResultV2 = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
};

export const kpiApi = createApi({
  reducerPath: "kpiApi",
  baseQuery,
  tagTypes: ["Kpi", "KpiList", "KpiStats", "KpiSet", "KpiSetList", "KpiSetAssignments"],
  endpoints: (builder) => ({
    getKpiStats: builder.query<IKpiStatsV2, void>({
      query: () => ({ url: "/v2/kpi/stats" }),
      transformResponse: (raw: IApiResponse<IKpiStatsV2>) => raw.data ?? emptyStats,
      providesTags: ["KpiStats"],
    }),

    createKpi: builder.mutation<IKpiResponseV2, ICreateKpiBodyV2>({
      query: (body) => ({
        url: "/v2/kpi/kpis",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<IKpiResponseV2>) => raw.data as IKpiResponseV2,
      invalidatesTags: ["KpiList", "KpiStats"],
    }),

    getKpis: builder.query<IGetKpisResultV2, IGetKpisParamsV2 | void>({
      query: (params = {}) => ({
        url: `/v2/kpi/kpis${buildKpiQueryString(params || {})}`,
      }),
      transformResponse: (raw: IApiResponse<IGetKpisResultV2>) =>
        raw.data ?? emptyKpiList,
      providesTags: (_, __, arg) => [
        { type: "KpiList", id: arg ? JSON.stringify(arg) : "list" },
      ],
    }),

    updateKpi: builder.mutation<
      IKpiResponseV2,
      { id: string; body: IUpdateKpiBodyV2 }
    >({
      query: ({ id, body }) => ({
        url: `/v2/kpi/kpis/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (raw: IApiResponse<IKpiResponseV2>) => raw.data as IKpiResponseV2,
      invalidatesTags: (_, __, { id }) => [
        { type: "Kpi", id },
        "KpiList",
        "KpiStats",
      ],
    }),

    deleteKpi: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v2/kpi/kpis/${id}`,
        method: "DELETE",
      }),
      transformResponse: (raw: IApiResponse<{ message?: string }> & { message?: string }) => ({
        message: raw.message ?? raw.data?.message ?? "KPI deleted successfully",
      }),
      invalidatesTags: (_, __, id) => [{ type: "Kpi", id }, "KpiList", "KpiStats"],
    }),

    getKpiSets: builder.query<IGetKpiSetsResultV2, IKpiSetQueryV2 | void>({
      query: (params = {}) => ({
        url: `/v2/kpi/kpi-sets${buildKpiSetQueryString(params || {})}`,
      }),
      transformResponse: (raw: IApiResponse<IGetKpiSetsResultV2>) =>
        raw.data ?? emptyKpiSetList,
      providesTags: (_, __, arg) => [
        { type: "KpiSetList", id: arg ? JSON.stringify(arg) : "list" },
      ],
    }),

    getKpiSetById: builder.query<IKpiSetResponseV2, string>({
      query: (id) => ({ url: `/v2/kpi/sets/${id}` }),
      transformResponse: (raw: IApiResponse<IKpiSetResponseV2>) =>
        raw.data as IKpiSetResponseV2,
      providesTags: (_, __, id) => [{ type: "KpiSet", id }],
    }),

    createKpiSet: builder.mutation<IKpiSetResponseV2, ICreateKpiSetBodyV2>({
      query: (body) => ({
        url: "/v2/kpi/sets",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<IKpiSetResponseV2>) =>
        raw.data as IKpiSetResponseV2,
      invalidatesTags: ["KpiSetList", "KpiStats"],
    }),

    updateKpiSet: builder.mutation<
      IKpiSetResponseV2,
      { id: string; body: IUpdateKpiSetBodyV2 }
    >({
      query: ({ id, body }) => ({
        url: `/v2/kpi/sets/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (raw: IApiResponse<IKpiSetResponseV2>) =>
        raw.data as IKpiSetResponseV2,
      invalidatesTags: (_, __, { id }) => [
        { type: "KpiSet", id },
        "KpiSetList",
        "KpiStats",
      ],
    }),

    deleteKpiSet: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v2/kpi/sets/${id}`,
        method: "DELETE",
      }),
      transformResponse: (raw: IApiResponse<{ message?: string }> & { message?: string }) => ({
        message: raw.message ?? (raw.data as { message?: string })?.message ?? "KPI set deleted successfully",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "KpiSet", id },
        "KpiSetList",
        "KpiStats",
      ],
    }),

    getSetAssignmentsList: builder.query<
      IAssignmentListResultV2,
      IAssignmentListQueryV2 | void
    >({
      query: (params) => ({
        url: `/v2/kpi/set-assignments${buildAssignmentListQueryString(params ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<IAssignmentListResultV2>) =>
        raw.data ?? emptyAssignmentList,
      providesTags: (_, __, arg) => [
        {
          type: "KpiSetAssignments",
          id: arg ? JSON.stringify(arg) : "list",
        },
      ],
    }),

    getKpiScoringList: builder.query<
      IAssignmentListResultV2,
      IKpiScoringQueryV2 | void
    >({
      query: (params) => ({
        url: `/v2/kpi/kpi-scoring${buildKpiScoringQueryString(params ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<IAssignmentListResultV2>) =>
        raw.data ?? emptyAssignmentList,
      providesTags: (_, __, arg) => [
        { type: "KpiSetAssignments", id: arg ? `scoring-${JSON.stringify(arg)}` : "scoring" },
      ],
    }),

    bulkCreateAssignments: builder.mutation<
      IBulkCreateAssignmentResultV2,
      IBulkCreateAssignmentBodyV2
    >({
      query: (body) => ({
        url: "/v2/kpi/assignments/bulk",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<IBulkCreateAssignmentResultV2>) =>
        raw.data ?? { created: 0, skipped: 0, message: "" },
      // No invalidatesTags: callers refetch list/stats once after bulk + deletes
    }),

    deleteAssignment: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v2/kpi/assignments/${id}`,
        method: "DELETE",
      }),
      transformResponse: (raw: IApiResponse<{ message?: string }> & { message?: string }) => ({
        message: raw.message ?? raw.data?.message ?? "Assignment deleted",
      }),
      // No invalidatesTags: callers refetch list/stats once after all deletes + bulk
    }),

    getScoringContext: builder.query<IScoringContextResultV2, IScoringContextQueryV2>({
      query: (params) => ({
        url: `/v2/kpi/scoring-context${buildScoringContextQueryString(params)}`,
      }),
      transformResponse: (raw: IApiResponse<IScoringContextResultV2>) =>
        raw.data ?? { sets: [], scores: [] },
      providesTags: (_, __, arg) => [
        { type: "KpiSetAssignments", id: `scoring-context-${arg.userId}-${arg.timeline}` },
      ],
    }),

    getMyPerformanceUserDetails: builder.query<
      IMyPerformanceResponseV2,
      { userId: string; completionTrendTimeline?: string; completionTrendOffset?: number }
    >({
      query: (arg) => {
        const { userId, completionTrendTimeline, completionTrendOffset } = arg;
        const params = new URLSearchParams();
        if (completionTrendTimeline != null && completionTrendTimeline !== "")
          params.set("completionTrendTimeline", completionTrendTimeline);
        if (completionTrendOffset != null && completionTrendOffset !== undefined)
          params.set("completionTrendOffset", String(completionTrendOffset));
        const qs = params.toString();
        return {
          url: `/v2/kpi/user-details/${encodeURIComponent(userId)}${qs ? `?${qs}` : ""}`,
        };
      },
      transformResponse: (raw: IApiResponse<IMyPerformanceResponseV2>) =>
        raw.data ?? ({} as IMyPerformanceResponseV2),
      providesTags: (_, __, arg) => [
        { type: "KpiSetAssignments", id: `my-performance-${arg.userId}` },
      ],
    }),

    getScores: builder.query<IScoreListResultV2, IScoreListQueryV2 | void>({
      query: (params) => ({
        url: `/v2/kpi/scores${buildScoreListQueryString(params ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<IScoreListResultV2>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      providesTags: (_, __, arg) => [
        { type: "KpiSetAssignments", id: arg ? `scores-${JSON.stringify(arg)}` : "scores" },
      ],
    }),

    getUserScoreHistory: builder.query<IScoreResponseV2[], { userId: string; setId?: string }>({
      query: ({ userId, setId }) => ({
        url: `/v2/kpi/scores/user/${encodeURIComponent(userId)}${setId && setId.trim() ? `?setId=${encodeURIComponent(setId)}` : ""}`,
      }),
      transformResponse: (raw: IApiResponse<IScoreResponseV2[]>) => raw.data ?? [],
      providesTags: (_, __, { userId }) => [{ type: "KpiSetAssignments", id: `history-${userId}` }],
    }),

    createScore: builder.mutation<IScoreResponseV2, ICreateScoreBodyV2>({
      query: (body) => ({
        url: "/v2/kpi/scores",
        method: "POST",
        body: {
          ...body,
          periodStart: typeof body.periodStart === "string" ? body.periodStart : (body.periodStart as Date).toISOString(),
          periodEnd: typeof body.periodEnd === "string" ? body.periodEnd : (body.periodEnd as Date).toISOString(),
        },
      }),
      transformResponse: (raw: IApiResponse<IScoreResponseV2>) => raw.data as IScoreResponseV2,
      invalidatesTags: ["KpiSetAssignments"],
    }),

    bulkUpsertScores: builder.mutation<IBulkUpsertScoresResultV2, IBulkUpsertScoresBodyV2>({
      query: (body) => ({
        url: "/v2/kpi/scores/bulk",
        method: "POST",
        body: {
          scores: body.scores.map((s) => ({
            ...s,
            periodStart: typeof s.periodStart === "string" ? s.periodStart : (s.periodStart as Date).toISOString(),
            periodEnd: typeof s.periodEnd === "string" ? s.periodEnd : (s.periodEnd as Date).toISOString(),
          })),
        },
      }),
      transformResponse: (raw: IApiResponse<IBulkUpsertScoresResultV2>) =>
        raw.data ?? { data: [], created: 0, updated: 0, skipped: 0 },
      invalidatesTags: ["KpiSetAssignments"],
    }),
  }),
});

export const {
  useGetKpiStatsQuery,
  useLazyGetKpiStatsQuery,
  useCreateKpiMutation,
  useGetKpisQuery,
  useLazyGetKpisQuery,
  useUpdateKpiMutation,
  useDeleteKpiMutation,
  useGetKpiSetsQuery,
  useLazyGetKpiSetsQuery,
  useGetKpiSetByIdQuery,
  useLazyGetKpiSetByIdQuery,
  useCreateKpiSetMutation,
  useUpdateKpiSetMutation,
  useDeleteKpiSetMutation,
  useGetSetAssignmentsListQuery,
  useLazyGetSetAssignmentsListQuery,
  useGetKpiScoringListQuery,
  useLazyGetKpiScoringListQuery,
  useBulkCreateAssignmentsMutation,
  useDeleteAssignmentMutation,
  useGetScoringContextQuery,
  useLazyGetScoringContextQuery,
  useGetMyPerformanceUserDetailsQuery,
  useLazyGetMyPerformanceUserDetailsQuery,
  useGetScoresQuery,
  useLazyGetScoresQuery,
  useGetUserScoreHistoryQuery,
  useLazyGetUserScoreHistoryQuery,
  useCreateScoreMutation,
  useBulkUpsertScoresMutation,
} = kpiApi;
