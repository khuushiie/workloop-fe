import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface JobDescriptionItem {
  id: number;
  title: string;
  description: string;
  created_at: string;
  company_name?: string;
  location?: string;
  experience?: string;
  rounds?: { id: number; title: string }[];
}

export interface GetJobDescriptionsResult {
  jobDescriptions: JobDescriptionItem[];
}

export const jobDescriptionApi = createApi({
  reducerPath: "jobDescriptionApi",
  baseQuery,
  tagTypes: ["JobDescriptions"],
  endpoints: (builder) => ({
    getJobDescriptions: builder.query<GetJobDescriptionsResult, { search?: string } | void>({
      query: (params) => {
        const search = params?.search?.trim();
        return {
          url: `/v2/job-descriptions${search ? `?search=${encodeURIComponent(search)}` : ""}`,
        };
      },
      transformResponse: (raw: unknown): GetJobDescriptionsResult => {
        const res = raw as { data?: GetJobDescriptionsResult };
        return (res?.data ?? res) as GetJobDescriptionsResult;
      },
      providesTags: ["JobDescriptions"],
    }),
  }),
});

export const { useGetJobDescriptionsQuery } = jobDescriptionApi;
