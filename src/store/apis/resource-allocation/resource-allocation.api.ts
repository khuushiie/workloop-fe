import { createApi} from '@reduxjs/toolkit/query/react';
import { baseQuery } from "../baseQuery";
import { IApiResponse } from './project-management.api';
import { ResourceRecord } from '../../../components/resource-management/ResourceTableSection';

export interface IUpsertAllocationRequest {
  id?: string;
  userId: string;
  projectId: string;
  allocationPercentage: number;
  projectRole: string;
  startDate: string;
  endDate: string;
  grade?: string | null;
  assignedBy?: string;
}

export interface IResourceStats {
  totalProjects: number;
  totalEmployees: number;
  allocatedResources: number;
  avgAllocation: number;
}

export interface IResourceAllocationProject {
  projectName: string;
  allocationPercentage: number;
}

export interface IRawResourceAllocation {
  _id: string;
  name: string;
  designation: string;
  totalAllocationPercentage: number;
  availability: number;
  projects: IResourceAllocationProject[];
}

export interface IResourceAllocationParams {
  page?: number;
  limit?: number;
  search?: string;
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  isAllocated?: boolean;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const resourceAllocationApi = createApi({
  reducerPath: 'resourceAllocationApi',
  baseQuery,
  tagTypes: ['Allocation', 'Project', 'Analytics'], 
  endpoints: (builder) => ({
    upsertAllocation: builder.mutation<IApiResponse<any>, IUpsertAllocationRequest>({
      query: (payload) => ({
        url: "v2/resource-management/allocation",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (result, error) => {
        if (error) return [];
        if (result?.success === false) return [];
        return ['Project', 'Analytics', 'Allocation'];
    },
    }),

    getResourceStats: builder.query<IResourceStats, void>({
      query: () => "v2/resource-management/allocation/stats",
      providesTags: ['Analytics'],
      transformResponse: (response: IApiResponse<IResourceStats>) => ({
        totalProjects: response?.data?.totalProjects ?? 0,
        totalEmployees: response?.data?.totalEmployees ?? 0,
        allocatedResources: response?.data?.allocatedResources ?? 0,
        avgAllocation: response?.data?.avgAllocation ?? 0,
      }),
    }),

    getResourceAllocations: builder.query< { data: ResourceRecord[]; total: number }, IResourceAllocationParams>({
      query: (params) => ({
        url: 'v2/resource-management/allocation',
        params,
      }),
      providesTags: ['Allocation'],
      transformResponse: (response: IApiResponse<{data: IRawResourceAllocation[], pagination: IPagination}>) => {
        const rawData = response?.data?.data || [];
        
        const transformed = rawData.map((item) => {
          const parts = item.name?.trim().split(" ") || [];
          return {
            _id: item._id,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" "),
            designation: item.designation,
            allocatedPercentage: item.totalAllocationPercentage ?? 0,
            availablePercentage: item.availability ?? 100,
            projects: item.projects?.map((p: any) => ({
              projectId: p.projectId || p._id || "",
              projectName: p.projectName || "Unknown Project",
              allocationPercentage: p.allocationPercentage ?? 0,
            })) || [],
          };
        });

        return {
          data: transformed,
          total: response?.data?.pagination?.total ?? 0,
        };
      },
    }),

    getResourceDetailsByUserId: builder.query<any, string>({
      query: (userId) => `v2/resource-management/allocation/${userId}`,
      providesTags: ['Allocation'],
    }),

    deleteAllocation: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `v2/resource-management/allocation/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Allocation'],
    }),

    downloadResourceReport: builder.query<Blob, any>({
      query: (params) => ({
        url: "v2/resource-management/allocation/report/download",
        method: "GET",
        params,
        responseHandler: (response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const { useUpsertAllocationMutation, useGetResourceStatsQuery, useDeleteAllocationMutation, useGetResourceDetailsByUserIdQuery,  useGetResourceAllocationsQuery, useLazyDownloadResourceReportQuery } = resourceAllocationApi;