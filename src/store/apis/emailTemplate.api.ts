import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface IEmailTemplateResponse {
  _id: string;
  name: string;
  subject: string;
  htmlContent: string;
  designJson: Record<string, unknown>;
  category?: string;
  thumbnail?: string;
  applicationId: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  designJson: Record<string, unknown>;
  category?: string;
  thumbnail?: string;
  applicationId?: string;
}

export interface IUpdateEmailTemplateRequest {
  id: string;
  body: Partial<ICreateEmailTemplateRequest>;
}

export interface ISendTestEmailRequest {
  id: string;
  testEmail: string;
  variables?: Record<string, string>;
}

export const emailTemplateApi = createApi({
  reducerPath: "emailTemplateApi",
  baseQuery,
  tagTypes: ["EmailTemplate"],
  endpoints: (builder) => ({
    getEmailTemplates: builder.query<
      IEmailTemplateResponse[],
      { applicationId?: string } | void
    >({
      query: (params) => ({
        url: `/v2/email-templates`,
        params: { applicationId: params?.applicationId ?? "hrms" },
      }),
      transformResponse: (raw: unknown): IEmailTemplateResponse[] => {
        if (Array.isArray(raw)) return raw;
        const body = raw as Record<string, unknown> | null;
        if (body && Array.isArray(body.data)) return body.data as IEmailTemplateResponse[];
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "EmailTemplate" as const,
                id: _id,
              })),
              { type: "EmailTemplate", id: "LIST" },
            ]
          : [{ type: "EmailTemplate", id: "LIST" }],
    }),

    getEmailTemplate: builder.query<IEmailTemplateResponse, string>({
      query: (id) => `/v2/email-templates/${id}`,
      transformResponse: (raw: unknown): IEmailTemplateResponse => {
        const body = raw as Record<string, unknown> | null;
        if (body && body.data && typeof body.data === "object" && !Array.isArray(body.data))
          return body.data as IEmailTemplateResponse;
        return raw as IEmailTemplateResponse;
      },
      providesTags: (_result, _err, id) => [{ type: "EmailTemplate", id }],
    }),

    createEmailTemplate: builder.mutation<
      IEmailTemplateResponse,
      ICreateEmailTemplateRequest
    >({
      query: (body) => ({
        url: "/v2/email-templates",
        method: "POST",
        body,
      }),
      transformResponse: (raw: unknown): IEmailTemplateResponse => {
        const body = raw as Record<string, unknown> | null;
        if (body && body.data && typeof body.data === "object")
          return body.data as IEmailTemplateResponse;
        return raw as IEmailTemplateResponse;
      },
      invalidatesTags: [{ type: "EmailTemplate", id: "LIST" }],
    }),

    updateEmailTemplate: builder.mutation<
      IEmailTemplateResponse,
      IUpdateEmailTemplateRequest
    >({
      query: ({ id, body }) => ({
        url: `/v2/email-templates/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (raw: unknown): IEmailTemplateResponse => {
        const body = raw as Record<string, unknown> | null;
        if (body && body.data && typeof body.data === "object")
          return body.data as IEmailTemplateResponse;
        return raw as IEmailTemplateResponse;
      },
      invalidatesTags: (_result, _err, { id }) => [
        { type: "EmailTemplate", id },
        { type: "EmailTemplate", id: "LIST" },
      ],
    }),

    deleteEmailTemplate: builder.mutation<{ deleted: boolean }, string>({
      query: (id) => ({
        url: `/v2/email-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "EmailTemplate", id: "LIST" }],
    }),

    duplicateEmailTemplate: builder.mutation<IEmailTemplateResponse, string>({
      query: (id) => ({
        url: `/v2/email-templates/${id}/duplicate`,
        method: "POST",
      }),
      transformResponse: (raw: unknown): IEmailTemplateResponse => {
        const body = raw as Record<string, unknown> | null;
        if (body && body.data && typeof body.data === "object")
          return body.data as IEmailTemplateResponse;
        return raw as IEmailTemplateResponse;
      },
      invalidatesTags: [{ type: "EmailTemplate", id: "LIST" }],
    }),

    sendTestEmail: builder.mutation<{ sent: boolean }, ISendTestEmailRequest>({
      query: ({ id, ...body }) => ({
        url: `/v2/email-templates/${id}/send-test`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetEmailTemplatesQuery,
  useGetEmailTemplateQuery,
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
  useDeleteEmailTemplateMutation,
  useDuplicateEmailTemplateMutation,
  useSendTestEmailMutation,
} = emailTemplateApi;
