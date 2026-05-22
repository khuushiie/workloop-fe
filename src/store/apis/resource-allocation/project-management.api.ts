import { createApi} from '@reduxjs/toolkit/query/react';
import { baseQuery } from "../baseQuery";

export interface ICreateProjectRequest {
  name: string;
  description: string;
  clientName: string;
  capacity: number;
  startDate: string; 
  endDate: string;   
  domain: string;    
  status: string;    
  poc: string;       
  priority: string;  
  billable: boolean;
  category: string;  
  inActiveReason?: string;
}

export interface IUpdateProjectRequest {
  id: string; // Used for the URL
  payload: Partial<ICreateProjectRequest> & {
    allocatedResources?: Array<{
      id?: string;
      userId: string;
      allocationPercentage: number;
      startDate: string;
      endDate: string;
      projectRole: string;
      grade?: string;
    }>;
  };
}

export interface IAllocatedResource {
  id: string;
  userId: string;
  name: string;
  allocationPercentage: number;
  projectRole: string;
  startDate: string;
  endDate: string;
  grade?: string;
}

export interface IProjectViewAllocation {
  _id: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  projectId: string;
  projectRole: string;
  grade?: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ProjectViewRecord {
  id: string;
  name: string;
  description: string;
  clientName: string;
  capacity: number;
  startDate: string;
  endDate: string;
  domain: string;
  status: string;
  poc: string | { firstName?: string; lastName?: string };
  priority: string;
  billable: boolean;
  category: string;
  inActiveReason?: string;
  allocatedResources: IProjectViewAllocation[];
  createdBy?: string | { firstName?: string; lastName?: string };
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  timestamp: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery,
  tagTypes: ['Project', 'Analytics'],
  endpoints: (builder) => ({

    getProjectStats: builder.query<any, void>({
      query: () => 'v2/resource-management/project/stats',
      providesTags: ['Project'],
    }),

    getProjects: builder.query<{ data: ProjectViewRecord[]; pagination: any }, any>({
      query: (params) => ({
        url: 'v2/resource-management/project',
        params: {
          page: params.page,
          limit: params.limit,
          search: params.search || undefined,
          domain: params.domain || undefined,
          status: params.status || undefined,
          startDate: params.fromDate || undefined,
          endDate: params.toDate || undefined,
        },
      }),
      providesTags: ['Project'],
      transformResponse: (response: any) => {
        const rows = response?.data?.data || [];
        const formattedRows = rows.map((item: any) => ({
          id: item._id,
          name: item.name,
          description: item.description,
          poc: typeof item.poc === "object"
            ? `${item?.poc?.firstName || ""} ${item?.poc?.lastName || ""}`.trim()
            : "-",
          clientName: item?.clientName,
          capacity: item?.capacity,
          startDate: item?.startDate,
          endDate: item?.endDate,
          domain: item?.domain,
          category: item?.category,
          priority: item?.priority,
          status: item?.status,
          billable: item?.billable,
          inActiveReason: item?.inActiveReason,
          createdByName: item?.createdBy?.firstName
            ? `${item?.createdBy?.firstName} ${item?.createdBy?.lastName ?? ""}`
            : "-",
          allocatedResources: (item?.allocatedResources || []).map((res: any) => ({
            firstName: res?.firstName,
            lastName: res?.lastName,
            role: res?.role,
            allocationPercentage: res?.allocationPercentage,
          })),
        }));

        return {
          data: formattedRows,
          pagination: response?.data?.pagination,
        };
      },
    }),

    createProject: builder.mutation<IApiResponse<ProjectViewRecord>, ICreateProjectRequest>({
      query: (projectData) => ({
        url: 'v2/resource-management/project',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),

    updateProject: builder.mutation<IApiResponse<any>, IUpdateProjectRequest>({
      query: ({ id, payload }) => ({
        url: `v2/resource-management/project/${id}`,
        method: 'PATCH',
        body: payload, 
      }),
      invalidatesTags: ['Project', 'Analytics'],
    }),

    getProjectById: builder.query<ProjectViewRecord, string>({
      query: (id) => `v2/resource-management/project/${id}`,
      transformResponse: (response: { data: ProjectViewRecord }) => response?.data || response,
    }),

    deleteProject: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `v2/resource-management/project/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),

    getProjectDropdown: builder.query<{ label: string; value: string }[], void>({
      query: () => "v2/resource-management/project/dropdown",
      transformResponse: (res: { data: any[] }) => res.data,
      providesTags: ['Project'],
    }),

    downloadProjectReport: builder.query<Blob, any>({
      query: (params) => ({
        url: 'v2/resource-management/project/report/download',
        params,
        responseHandler: (response) => response.blob(),
      }),
      keepUnusedDataFor: 0,
    }),

  }),
});

export const { useGetProjectStatsQuery, useGetProjectsQuery, useLazyGetProjectByIdQuery, useLazyDownloadProjectReportQuery, useUpdateProjectMutation, useGetProjectDropdownQuery, useCreateProjectMutation, useGetProjectByIdQuery, useDeleteProjectMutation } = projectApi;