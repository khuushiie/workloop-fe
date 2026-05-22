import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

import type {
  IApiResponse,
  ITimesheet,
  ITimesheetListPayload,
  ITimesheetStatsPayload,
  ITimesheetQueryParams,
  ICreateTimesheetBody,
  IUpdateTimesheetBody,
  IActOnTimesheetBody,
} from "../../types/timesheet.api.types";

/* =========================================================
   Helper
========================================================= */

function buildQueryString(params: ITimesheetQueryParams = {}): string {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      search.set(key, String(value));
    }
  });

  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

/* =========================================================
   API
========================================================= */

export const timesheetApi = createApi({
  reducerPath: "timesheetApi",
  baseQuery,

  tagTypes: ["Timesheet", "TimesheetList", "TimesheetStats"],

  keepUnusedDataFor: 60 * 10,

  endpoints: (builder) => ({
    /* =========================
       GET LIST
    ========================= */
    getTimesheets: builder.query<
      ITimesheetListPayload,
      ITimesheetQueryParams 
    >({
      query: (params = {}) => ({
        url: `/v2/timesheet${buildQueryString(params)}`,
      }),
      transformResponse: (raw: IApiResponse<ITimesheetListPayload>) =>
        raw.data ?? {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      providesTags: ["TimesheetList"],
    }),

    /* =========================
       GET MY TIMESHEETS
    ========================= */
    getMyTimesheets: builder.query<
      ITimesheetListPayload,
      ITimesheetQueryParams 
    >({
      query: (params = {}) => ({
        url: `/v2/timesheet/my${buildQueryString(params)}`,
      }),
      transformResponse: (raw: IApiResponse<ITimesheetListPayload>) =>
        raw.data ?? {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      providesTags: ["TimesheetList"],
    }),

    /* =========================
       GET STATS
    ========================= */
    getTimesheetStats: builder.query<ITimesheetStatsPayload, void>({
      query: () => "/v2/timesheet/stats",
      transformResponse: (raw: IApiResponse<ITimesheetStatsPayload>) =>
        raw.data ?? {
          totalHours: 0,
          approvedHours: 0,
          thisMonthHours: 0,
          totalEntries: 0,
          pending: 0,
          change: "0%",
        },
      providesTags: ["TimesheetStats"],
    }),

    /* =========================
       GET BY ID
    ========================= */
    getTimesheetById: builder.query<ITimesheet | undefined, string>({
      query: (id) => `/v2/timesheet/${id}`,
      transformResponse: (raw: IApiResponse<ITimesheet>) => raw.data,
      providesTags: (_, __, id) => [{ type: "Timesheet", id }],
    }),

    /* =========================
       CREATE
    ========================= */
    createTimesheet: builder.mutation<ITimesheet | undefined, ICreateTimesheetBody>({
      query: (body) => ({
        url: "/v2/timesheet",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<ITimesheet>) => raw.data,
      invalidatesTags: ["TimesheetList", "TimesheetStats"],
    }),

    /* =========================
       UPDATE
    ========================= */
    updateTimesheet: builder.mutation<
      ITimesheet | undefined,
      { id: string; body: IUpdateTimesheetBody }
    >({
      query: ({ id, body }) => ({
        url: `/v2/timesheet/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (raw: IApiResponse<ITimesheet>) => raw.data,
      invalidatesTags: (_, __, { id }) => [
        { type: "Timesheet", id },
        "TimesheetList",
      ],
    }),

    /* =========================
       DELETE
    ========================= */
    deleteTimesheet: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v2/timesheet/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TimesheetList", "TimesheetStats"],
    }),

    /* =========================
       SUBMIT
    ========================= */
    submitTimesheet: builder.mutation<ITimesheet | undefined, string>({
      query: (id) => ({
        url: `/v2/timesheet/${id}/submit`,
        method: "POST",
      }),
      transformResponse: (raw: IApiResponse<ITimesheet>) => raw.data,
      invalidatesTags: ["TimesheetList", "TimesheetStats"],
    }),

    /* =========================
       APPROVE / REJECT
    ========================= */
    actOnTimesheet: builder.mutation<
      ITimesheet | undefined,
      { id: string; body: IActOnTimesheetBody }
    >({
      query: ({ id, body }) => ({
        url: `/v2/timesheet/${id}/action`,
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<ITimesheet>) => raw.data,
      invalidatesTags: ["TimesheetList", "TimesheetStats"],
    }),
  }),
});


  //  Hooks


export const {
  useGetTimesheetsQuery,
  useGetMyTimesheetsQuery,
  useGetTimesheetStatsQuery,
  useGetTimesheetByIdQuery,
  useCreateTimesheetMutation,
  useUpdateTimesheetMutation,
  useDeleteTimesheetMutation,
  useSubmitTimesheetMutation,
  useActOnTimesheetMutation,
} = timesheetApi;
