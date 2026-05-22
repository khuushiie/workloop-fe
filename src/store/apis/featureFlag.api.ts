import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface IFeatureFlag {
  id?: string;
  key: string;
  name: string;
  enabled: boolean;
  description?: string;
  category?: "ui_visibility" | "workflow" | "module_version" | "experimental";
  updatedAt?: string;
}

export interface IFeatureFlagData {
  data: IFeatureFlag;
}

export interface IFeatureFlagResponse {
  data: IFeatureFlag[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IFeatureFlagParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
}

export const featureFlagApi = createApi({
  reducerPath: "featureFlagApi",
  baseQuery: baseQuery,
  tagTypes: ["FeatureFlag"],
  endpoints: (builder) => ({
    // GET: List all flags
    getFeatureFlags: builder.query<IFeatureFlagResponse, IFeatureFlagParams>({
      query: (params) => ({
        url: "v2/feature-flags",
        method: "GET",
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search,
          category: params.category,
          enabled: params.enabled,
        },
      }),
      transformResponse: (response: { data: IFeatureFlagResponse }) => {
        return response.data;
      },
      providesTags: ["FeatureFlag"],
    }),

    // PUT: Update a flag (Used for Toggling)
    // We expect the component to pass the Key and the Data to update
    updateFeatureFlag: builder.mutation<IFeatureFlagData, { key: string; data: Partial<IFeatureFlag> }>({
      query: ({ key, data }) => ({
        url: `v2/feature-flags/${key}`,
        method: "PUT",
        body: data, // Send the updated object here
      }),
      transformResponse: (response: { data: IFeatureFlag }) => {
        return { data: response.data };
      },
      invalidatesTags: ["FeatureFlag"],
    }),

    // DELETE: Remove a flag
    deleteFeatureFlag: builder.mutation<{ message: string }, string>({
      query: (key) => ({
        url: `v2/feature-flags/${key}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FeatureFlag"],
    }),

    // POST: Create a flag (Adding for completeness based on your doc)
    createFeatureFlag: builder.mutation<IFeatureFlag, Partial<IFeatureFlag>>({
      query: (data) => ({
        url: "v2/feature-flags",
        method: "POST",
        body: data
      }),
      invalidatesTags: ["FeatureFlag"]
    })
  }),
});

export const {
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
  useDeleteFeatureFlagMutation,
  useCreateFeatureFlagMutation
} = featureFlagApi;