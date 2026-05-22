import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface ISubmitReferralPayload {
  jobId?: string;
  resume: File;
}

export interface ISubmitReferralResult {
  id: string;
  status: string;
}

export interface IReferralStatusItem {
  id: string;
  candidateName: string;
  candidateEmail: string | null;
  status: string;
  referredAt: string;
  lastActedAt: string;
  totalRounds: number;
}

export interface IReferralDetailsResponse {
  reference_id: string;
  current_status: string;
  status_history: { status: string; timestamp: string; note?: string }[];
  resume_details: Record<string, unknown>;
  job_details?: Record<string, unknown>;
  created_at: string;
  source_file: string;
}

export const referralApi = createApi({
  reducerPath: "referralApi",
  baseQuery,
  tagTypes: ["ReferralStatus"],
  endpoints: (builder) => ({
    submitReferral: builder.mutation<ISubmitReferralResult, ISubmitReferralPayload>({
      query: (payload) => {
        const formData = new FormData();
        if (payload.jobId?.trim()) {
          formData.append("jobId", payload.jobId.trim());
        }
        formData.append("resume", payload.resume);
        return {
          url: "/v2/referrals",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: unknown): ISubmitReferralResult => {
        const res = raw as { data?: ISubmitReferralResult };
        return (res?.data ?? res) as ISubmitReferralResult;
      },
      invalidatesTags: ["ReferralStatus"],
    }),
    getMyReferralStatuses: builder.query<IReferralStatusItem[], void>({
      query: () => ({ url: "/v2/referrals/status" }),
      transformResponse: (raw: any) => {
        if (raw?.data?.data && Array.isArray(raw.data.data)) {
          return raw.data.data;
        }
        if (raw?.data && Array.isArray(raw.data)) {
          return raw.data;
        }
        if (Array.isArray(raw)) {
          return raw;
        }
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "ReferralStatus" as const, id })),
              { type: "ReferralStatus", id: "LIST" },
            ]
          : [{ type: "ReferralStatus", id: "LIST" }],
    }),
    getReferralDetails: builder.query<IReferralDetailsResponse, string>({
      query: (referenceId) => ({ url: `/v2/referrals/${encodeURIComponent(referenceId)}/details` }),
      transformResponse: (raw: unknown) => {
        const res = raw as { data?: IReferralDetailsResponse };
        return (res?.data ?? res) as IReferralDetailsResponse;
      },
      providesTags: (_, __, id) => [{ type: "ReferralStatus", id }],
    }),
  }),
});

export const {
  useSubmitReferralMutation,
  useGetMyReferralStatusesQuery,
  useGetReferralDetailsQuery,
  useLazyGetReferralDetailsQuery,
} = referralApi;
