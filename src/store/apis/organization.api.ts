import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import type {
  IOrganizationDetail,
  IOrganizationByCode,
  IOrganizationStats,
  ICreateOrganizationBody,
  IUpdateOrganizationBody,
  IOrganizationListResponse,
  IOrganizationQueryParams,
} from "../../types/organization.types";
import type { WeekOffConfig, WeekOffConfigHistoryEntry, WeekOffRule } from "../../utils/weekOff";

/** Backend envelope from ResponseInterceptor */
interface IApiEnvelope<T> {
  data?: T;
}

export const OrganizationApi = createApi({
  reducerPath: "OrganizationApi",
  baseQuery,
  tagTypes: ["Organization", "OrganizationStats", "OrganizationFilter", "OrganizationRequestHistory"],

  endpoints: (builder) => ({
    // ─────────────────────────────────────────────
    // GET ORGANIZATIONS LIST
    // ─────────────────────────────────────────────
    getOrganizations: builder.query<
      IOrganizationListResponse,
      IOrganizationQueryParams
    >({
      query: (params = {}) => {
        const search = new URLSearchParams();

        if (params.page != null) search.set("page", String(params.page));
        if (params.limit != null) search.set("limit", String(params.limit));
        if (params.search) search.set("search", params.search);
        if (params.status) search.set("status", params.status);
        if (params.poc) search.set("poc", params.poc);

        const qs = search.toString();

        return {
          url: `/v2/organization${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },

      transformResponse: (
        raw: IApiEnvelope<IOrganizationListResponse>
      ): IOrganizationListResponse =>
        raw?.data ?? {
          data: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },

      providesTags: ["Organization"],
    }),



    //Get Organization list


    // ─────────────────────────────────────────────
// GET ORGANIZATION FILTER (dropdown)
// ─────────────────────────────────────────────
getOrganizationsFilter: builder.query<
  { data: { organizationName: string; id: string }[] },
  void
>({
  query: () => ({
    url: "/v2/organization/filter",
    method: "GET",
  }),

  transformResponse: (
    raw: IApiEnvelope<{ data: { organizationName: string; id: string }[] }>
  ) => raw?.data ?? { data: [] },

  providesTags: ["OrganizationFilter"],
}),
   
    // ─────────────────────────────────────────────
    // GET ORGANIZATION STATS
    // ─────────────────────────────────────────────
    getOrganizationStats: builder.query<IOrganizationStats, void>({
      query: () => ({
        url: "/v2/organization/stats",
        method: "GET",
      }),

      transformResponse: (
        raw: IApiEnvelope<IOrganizationStats>
      ): IOrganizationStats => raw?.data ?? { total: 0, active: 0, inactive: 0 },

      providesTags: ["OrganizationStats"],
    }),



    // ─────────────────────────────────────────────
    // GET ORGANIZATION BY CODE (3–4 char, from URL subdomain). Returns only name, code, tagline, status, logo.
    // ─────────────────────────────────────────────
    getOrganizationByCode: builder.query<IOrganizationByCode, string>({
      query: (code) => ({
        url: `/v2/organization/by-code/${encodeURIComponent(code)}`,
        method: "GET",
      }),
      transformResponse: (
        raw: IApiEnvelope<IOrganizationByCode>
      ): IOrganizationByCode =>
        raw?.data ?? {
          name: "",
          code: "",
          tagline: null,
          status: "",
          logo: null,
        },
      providesTags: (_result, _error, code) => [
        { type: "Organization", id: `by-code-${code}` },
      ],
    }),

    // ─────────────────────────────────────────────
    // GET ORGANIZATION BY ID
    // ─────────────────────────────────────────────
    getOrganizationById: builder.query<IOrganizationDetail, string>({
      query: (id) => ({
        url: `/v2/organization/${id}`,
        method: "GET",
      }),

    transformResponse: (
  raw: IApiEnvelope<IOrganizationDetail>
): IOrganizationDetail => {
  const data = raw?.data;

  if (!data) return {} as IOrganizationDetail;

  return {
    ...data,
    permissions: data.permissions ?? [], 
  };
},

      providesTags: (_result, _error, id) => [
        { type: "Organization", id },
      ],
    }),





    // ─────────────────────────────────────────────
    // CREATE ORGANIZATION
    // ─────────────────────────────────────────────
    createOrganization: builder.mutation<
      IOrganizationDetail,
      ICreateOrganizationBody
    >({
      query: (body) => ({
        url: "/v2/organization",
        method: "POST",
        body,
      }),

     transformResponse: (
  raw: IApiEnvelope<IOrganizationDetail>
): IOrganizationDetail => {
  const data = raw?.data;
  if (!data) return {} as IOrganizationDetail;

  return {
    ...data,
    permissions: data.permissions ?? [],
  };
},
      invalidatesTags: [
        "Organization",
        "OrganizationStats",
        "OrganizationFilter",
      ],
    }),

    // ─────────────────────────────────────────────
    // UPDATE ORGANIZATION
    // ─────────────────────────────────────────────
    updateOrganization: builder.mutation<
      IOrganizationDetail,
      { id: string; body: IUpdateOrganizationBody }
    >({
      query: ({ id, body }) => ({
        url: `/v2/organization/${id}`,
        method: "PATCH",
        body,
      }),
transformResponse: (
  raw: IApiEnvelope<IOrganizationDetail>
): IOrganizationDetail => {
  const data = raw?.data;
  if (!data) return {} as IOrganizationDetail;

  return {
    ...data,
    permissions: data.permissions ?? [],
  };
},

      invalidatesTags: (_result, _error, { id }) => [
        { type: "Organization", id },
        "Organization",
      ],
    }),


    //Download CSV Template


    downloadOrganizations: builder.query<
  Blob,
  { search?: string; status?: string; limit?: number }
>({
  query: (params = {}) => {
    const sp = new URLSearchParams();

    if (params.search) sp.set("search", params.search);
    if (params.status) sp.set("status", params.status);
    if (params.limit) sp.set("limit", String(params.limit));

    return {
      url: `/v2/organization/download${sp.toString() ? `?${sp}` : ""}`,
      method: "GET",
      responseHandler: (response) => response.blob(), 
    };
  },
}),

    // ─────────────────────────────────────────────
    // REQUEST MORE USERS
    // ─────────────────────────────────────────────
    requestMoreUsers: builder.mutation<
      { success: boolean; message: string },
      { organizationId: string; requestedCount: number }
    >({
      query: ({ organizationId, requestedCount }) => ({
        url: `/v2/organization/${organizationId}/request-users`,
        method: "POST",
        body: { requestedCount },
      }),
      invalidatesTags: (_result, _error, { organizationId }) => [
        { type: "Organization", id: organizationId },
      ],
    }),

    // ─────────────────────────────────────────────
    // GET ORG DETAILS (next employee ID, user count, org name, org image)
    // ─────────────────────────────────────────────
    getOrgDetails: builder.query<
      {
        nextEmployeeId: string | null;
        numberOfUsers: number;
        orgName: string;
        orgImage: string | null;
      },
      string
    >({
      query: (organizationId) => ({
        url: `/v2/organization/${organizationId}/org-details`,
        method: "GET",
      }),
      transformResponse: (
        raw: IApiEnvelope<{
          nextEmployeeId: string | null;
          numberOfUsers: number;
          orgName: string;
          orgImage: string | null;
        }>
      ) => raw?.data ?? { nextEmployeeId: null, numberOfUsers: 0, orgName: "", orgImage: null },
    }),

    // ─────────────────────────────────────────────
    // GET REQUEST HISTORY
    // ─────────────────────────────────────────────
    getOrganizationRequestHistory: builder.query<
      { data: Array<{ id: string; requestedCount: number; requestedBy: string; status: string; requestedAt: string; processedAt?: string | null }>; total: number },
      { organizationId: string; page?: number; limit?: number }
    >({
      query: ({ organizationId, page = 1, limit = 10 }) => ({
        url: `/v2/organization/${organizationId}/request-history?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (
        raw: IApiEnvelope<{ data: Array<{ id: string; requestedCount: number; requestedBy: string; status: string; requestedAt: string; processedAt?: string | null }>; total: number }>
      ) => raw?.data ?? { data: [], total: 0 },
      providesTags: (_result, _error, { organizationId }) => [
        { type: "Organization", id: organizationId },
        "OrganizationRequestHistory",
      ],
    }),

    // ─────────────────────────────────────────────
    // DELETE ORGANIZATION
    // ─────────────────────────────────────────────
    deleteOrganization: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/v2/organization/${id}`,
        method: "DELETE",
      }),

      invalidatesTags: [
        "Organization",
        "OrganizationStats",
        "OrganizationFilter",
      ],
    }),

    // ─────────────────────────────────────────────
    // WEEK-OFF CONFIG
    // ─────────────────────────────────────────────
    getWeekOffConfig: builder.query<WeekOffConfig | null, string>({
      query: (orgId) => `/v2/organization/${orgId}/week-off-config`,
      transformResponse: (
        raw: IApiEnvelope<WeekOffConfig | null>,
      ): WeekOffConfig | null => raw?.data ?? null,
      providesTags: (_result, _error, orgId) => [
        { type: "Organization", id: `week-off-${orgId}` },
      ],
    }),

    updateWeekOffConfig: builder.mutation<
      { message: string },
      {
        orgId: string;
        body: {
          rules: WeekOffRule[];
          label?: string;
          effectiveFrom: string;
          changeReason?: string;
        };
      }
    >({
      query: ({ orgId, body }) => ({
        url: `/v2/organization/${orgId}/week-off-config`,
        method: "PATCH",
        body,
      }),
      transformResponse: (
        raw: IApiEnvelope<{ message: string }>,
      ): { message: string } => raw?.data ?? { message: "Updated" },
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: "Organization", id: `week-off-${orgId}` },
        { type: "Organization", id: `week-off-history-${orgId}` },
        "Organization",
      ],
    }),

    getWeekOffConfigHistory: builder.query<
      WeekOffConfigHistoryEntry[],
      string
    >({
      query: (orgId) =>
        `/v2/organization/${orgId}/week-off-config/history`,
      transformResponse: (
        raw: IApiEnvelope<WeekOffConfigHistoryEntry[]>,
      ): WeekOffConfigHistoryEntry[] => raw?.data ?? [],
      providesTags: (_result, _error, orgId) => [
        { type: "Organization", id: `week-off-history-${orgId}` },
      ],
    }),

    deleteWeekOffConfigHistory: builder.mutation<
      { message: string },
      { orgId: string; historyId: string }
    >({
      query: ({ orgId, historyId }) => ({
        url: `/v2/organization/${orgId}/week-off-config/history/${historyId}`,
        method: "DELETE",
      }),
      transformResponse: (
        raw: IApiEnvelope<{ message: string }>,
      ): { message: string } => raw?.data ?? { message: "Deleted" },
      invalidatesTags: (_result, _error, { orgId }) => [
        { type: "Organization", id: `week-off-${orgId}` },
        { type: "Organization", id: `week-off-history-${orgId}` },
        "Organization",
      ],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationStatsQuery,
  useGetOrganizationsFilterQuery,
  useGetOrganizationByIdQuery,
  useGetOrganizationByCodeQuery,
  useLazyGetOrganizationByCodeQuery,
  useLazyGetOrganizationByIdQuery,
  useLazyGetOrgDetailsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useLazyDownloadOrganizationsQuery,
  useRequestMoreUsersMutation,
  useGetOrganizationRequestHistoryQuery,
  useGetWeekOffConfigQuery,
  useUpdateWeekOffConfigMutation,
  useGetWeekOffConfigHistoryQuery,
  useDeleteWeekOffConfigHistoryMutation,
} = OrganizationApi;