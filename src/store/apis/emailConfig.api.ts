import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface IEmailConfigTypeOption {
  value: string;
  label: string;
}

export interface IEmailConfigResponse {
  _id?: string;
  templateType: string;
  label: string;
  templateId:
    | { _id: string; name: string; subject: string }
    | string
    | null;
  isActive: boolean;
  applicationId: string;
  subjectOverride: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpsertEmailConfigRequest {
  templateType: string;
  templateId?: string | null;
  isActive?: boolean;
  subjectOverride?: string;
}

export const emailConfigApi = createApi({
  reducerPath: "emailConfigApi",
  baseQuery,
  tagTypes: ["EmailConfig"],
  endpoints: (builder) => ({
    getEmailConfigs: builder.query<
      IEmailConfigResponse[],
      { applicationId?: string } | void
    >({
      query: (params) => ({
        url: "/v2/email-configs",
        params: { applicationId: params?.applicationId ?? "hrms" },
      }),
      transformResponse: (raw: unknown): IEmailConfigResponse[] => {
        if (Array.isArray(raw)) return raw;
        const body = raw as Record<string, unknown> | null;
        if (body && Array.isArray(body.data))
          return body.data as IEmailConfigResponse[];
        return [];
      },
      providesTags: [{ type: "EmailConfig", id: "LIST" }],
    }),

    getEmailConfigTypes: builder.query<IEmailConfigTypeOption[], void>({
      query: () => "/v2/email-configs/types",
      transformResponse: (raw: unknown): IEmailConfigTypeOption[] => {
        if (Array.isArray(raw)) return raw;
        const body = raw as Record<string, unknown> | null;
        if (body && Array.isArray(body.data))
          return body.data as IEmailConfigTypeOption[];
        return [];
      },
    }),

    upsertEmailConfig: builder.mutation<
      IEmailConfigResponse,
      IUpsertEmailConfigRequest
    >({
      query: ({ templateType, ...body }) => ({
        url: `/v2/email-configs/${templateType}`,
        method: "PUT",
        body: { templateType, ...body },
      }),
      transformResponse: (raw: unknown): IEmailConfigResponse => {
        const body = raw as Record<string, unknown> | null;
        if (body && body.data && typeof body.data === "object")
          return body.data as IEmailConfigResponse;
        return raw as IEmailConfigResponse;
      },
      invalidatesTags: [{ type: "EmailConfig", id: "LIST" }],
    }),

    deleteEmailConfig: builder.mutation<{ deleted: boolean }, string>({
      query: (templateType) => ({
        url: `/v2/email-configs/${templateType}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "EmailConfig", id: "LIST" }],
    }),
  }),
});

export const {
  useGetEmailConfigsQuery,
  useGetEmailConfigTypesQuery,
  useUpsertEmailConfigMutation,
  useDeleteEmailConfigMutation,
} = emailConfigApi;
