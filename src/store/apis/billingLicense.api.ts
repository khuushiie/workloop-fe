import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import type { IApiResponse } from "../../types";
import type { SubscriptionPlan } from "../../constants/subscriptionPlan";

// --- License types ---

export interface ILicenseSummary {
  totalLicenses: number;
  usedLicenses: number;
  availableLicenses: number;
  subscriptionPlan: SubscriptionPlan;
  minLicensesPerPlan: number;
  isNearLimit: boolean;
}

export interface IAddLicensesRequest {
  count: number;
}

// --- Billing types ---

export interface IBillingBreakdown {
  periodStart: string;
  periodEnd: string;
  planType: string;
  daysActive: number;
  totalDaysInMonth: number;
  userLimit: number;
  costPerDeveloper: number;
  amount: number;
}

export interface IBillingRecord {
  id?: string;
  billingMonth: string;
  totalAmount: number;
  status: "pending" | "paid" | "overdue";
  paidAt?: string | null;
  costPerDeveloper?: number;
  userLimit?: number;
  breakdown?: IBillingBreakdown[];
  isPreview?: boolean;
}

export interface IBillingHistoryResponse {
  data: IBillingRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IBillingHistoryParams {
  page?: number;
  limit?: number;
  status?: IBillingRecord["status"];
  year?: number;
  month?: number;
  organizationId?: string;
}

export interface IMarkPaidRequest {
  id: string;
  paymentProofUrls?: string[];
}

export interface IUploadPaymentProofResult {
  message: string;
  fileUrl: string;
  signedUrl: string;
}

// --- API slice ---

export const billingLicenseApi = createApi({
  reducerPath: "billingLicenseApi",
  baseQuery,
  tagTypes: ["License", "Billing"],

  endpoints: (builder) => ({
    getLicenseSummary: builder.query<ILicenseSummary, void>({
      query: () => ({ url: "/v2/organization/license/summary" }),
      transformResponse: (raw: IApiResponse<ILicenseSummary>) =>
        raw.data as ILicenseSummary,
      providesTags: [{ type: "License", id: "SUMMARY" }],
    }),

    addLicenses: builder.mutation<ILicenseSummary, IAddLicensesRequest>({
      query: (body) => ({
        url: "/v2/organization/license/add",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<ILicenseSummary>) =>
        raw.data as ILicenseSummary,
      invalidatesTags: [
        { type: "License", id: "SUMMARY" },
        { type: "Billing", id: "CURRENT" },
        { type: "Billing", id: "LIST" },
      ],
    }),

    getCurrentBilling: builder.query<IBillingRecord, void>({
      query: () => ({ url: "/v2/organization/billing/current" }),
      transformResponse: (raw: IApiResponse<IBillingRecord>) =>
        raw.data as IBillingRecord,
      providesTags: [{ type: "Billing", id: "CURRENT" }],
    }),

    getBillingHistory: builder.query<
      IBillingHistoryResponse,
      IBillingHistoryParams | void
    >({
      query: (params) => ({
        url: "/v2/organization/billing/history",
        params: params || undefined,
      }),
      transformResponse: (raw: IApiResponse<IBillingHistoryResponse>) =>
        raw.data ?? { data: [], page: 1, limit: 10, total: 0, totalPages: 0 },
      providesTags: [{ type: "Billing", id: "LIST" }],
    }),

    getBillingById: builder.query<IBillingRecord, string>({
      query: (id) => ({ url: `/v2/organization/billing/${id}` }),
      transformResponse: (raw: IApiResponse<IBillingRecord>) =>
        raw.data as IBillingRecord,
      providesTags: (_, __, id) => [{ type: "Billing", id }],
    }),

    uploadPaymentProof: builder.mutation<IUploadPaymentProofResult, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: "/v2/files/upload/payment-proof",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: unknown): IUploadPaymentProofResult => {
        const res = raw as { data?: IUploadPaymentProofResult };
        return (
          res?.data?.fileUrl != null ? res.data : res
        ) as IUploadPaymentProofResult;
      },
    }),

    markBillingPaid: builder.mutation<IBillingRecord, IMarkPaidRequest>({
      query: ({ id, ...body }) => ({
        url: `/v2/organization/billing/${id}/pay`,
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<IBillingRecord>) =>
        raw.data as IBillingRecord,
      invalidatesTags: (_, __, { id }) => [
        { type: "Billing", id: "LIST" },
        { type: "Billing", id: "CURRENT" },
        { type: "Billing", id },
      ],
    }),
  }),
});

export const {
  useGetLicenseSummaryQuery,
  useAddLicensesMutation,
  useGetCurrentBillingQuery,
  useGetBillingHistoryQuery,
  useGetBillingByIdQuery,
  useUploadPaymentProofMutation,
  useMarkBillingPaidMutation,
} = billingLicenseApi;
