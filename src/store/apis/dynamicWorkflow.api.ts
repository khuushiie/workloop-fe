import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

export interface IWorkflowStep {
  groupId: string;
  sequence: number;
  canBeSkipped: boolean;
}

export interface IWorkflowDefinition {
  id?: string;
  name: string;
  description?: string;
  status?: string;
  permissionCode: string;
  isActive: boolean;
  canAdminApproveMidFlow: boolean;
  steps: IWorkflowStep[];
  createdAt?: string
}

export interface IWorkflowDefinitionData {
  data: IWorkflowDefinition;
}

export interface IWorkflowStats {
  total_workflows: number;
  active: number;
  inactive: number;
}

export interface IWorkflowData{
  definitions: IWorkflowDefinition[];
  stats: IWorkflowStats;
}

export interface IWorkflowDefinitionResponse {
  data: IWorkflowData;
}

//Groups 
export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const ApprovalGroupType = {
  STANDARD: 'standard',
  REPORTING_AUTHORITY: 'reporting_authority',
  FUNCTIONAL_AUTHORITY: 'functional_authority',
} as const;

export type ApprovalGroupType = (typeof ApprovalGroupType)[keyof typeof ApprovalGroupType];

export interface IApprovalGroup {
  id?: string | undefined;
  name: string;
  description?: string;
  status?: string;
  memberIds: string[];
  groupType?: ApprovalGroupType;
  isSystemGroup?: boolean;
}

export interface IApprovalGroupData {
  data: IApprovalGroup;
}

export interface IApprovalGroupListData {
  items: IApprovalGroup[];
  pagination: IPagination;
}

export interface IApprovalGroupQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface IApprovalGroupResponse {
  data: IApprovalGroupListData;
}

export interface IApprovalGroupStats {
  total: number;
  active: number;
  inactive: number;
}

export interface IApprovalGroupStatsResponse {
  data: IApprovalGroupStats;
}

export const workflowApi = createApi({
  reducerPath: "workflowApi",
  baseQuery: baseQuery,
  tagTypes: ["WorkflowDefinition", "WorkflowGroup"],

  endpoints: (builder) => ({

    // =========================
    // WORKFLOW DEFINITIONS
    // =========================

    getWorkflowDefinitions: builder.query<IWorkflowDefinitionResponse, void>({
      query: () => ({
        url: "/v2/workflow/definitions",
        method: "GET"
      }),
      transformResponse: (response: { data: IWorkflowData }) => ({
        data: response.data
      }),
      providesTags: ["WorkflowDefinition"]
    }),

    createWorkflowDefinition: builder.mutation<IWorkflowDefinitionData, Partial<IWorkflowDefinition>>({
      query: (data) => ({
        url: "/v2/workflow/definitions",
        method: "POST",
        body: data
      }),
      transformResponse: (response: { data: IWorkflowDefinition }) => ({
        data: response.data
      }),
      invalidatesTags: ["WorkflowDefinition"]
    }),

    updateWorkflowDefinition: builder.mutation<
      IWorkflowDefinitionData,
      { id: string; data: Partial<IWorkflowDefinition> }
    >({
      query: ({ id, data }) => ({
        url: `/v2/workflow/definitions/${id}`,
        method: "PUT",
        body: data
      }),
      transformResponse: (response: { data: IWorkflowDefinition }) => ({
        data: response.data
      }),
      invalidatesTags: ["WorkflowDefinition"]
    }),

    deleteWorkflowDefinition: builder.mutation<{ message: string }, 
    {
      id: string;
      data: Partial<IWorkflowDefinition>;
    }
    >({
      query: ({ id, data }) => ({
        url: `/v2/workflow/definitions/${id}`,
        method: "DELETE",
        body: data
      }),
      invalidatesTags: ["WorkflowDefinition"]
    }),

    // =========================
    // APPROVAL GROUPS
    // =========================

    getApprovalGroups: builder.query<IApprovalGroupResponse, IApprovalGroupQueryParams | void>({
      query: (params) => ({
        url: "/v2/workflow/groups",
        method: "GET",
        params: params || undefined
      }),
      transformResponse: (response: { data: IApprovalGroupListData }) => ({
        data: response.data
      }),
      providesTags: ["WorkflowGroup"]
    }),

    getApprovalGroupStats: builder.query<IApprovalGroupStatsResponse, void>({
      query: () => ({
        url: "/v2/workflow/groups/stats",
        method: "GET"
      }),
      transformResponse: (response: { data: IApprovalGroupStats }) => ({
        data: response.data
      }),
      providesTags: ["WorkflowGroup"]
    }),

    getApprovalGroupById: builder.query<IApprovalGroupData, string>({
      query: (id) => ({
        url: `/v2/workflow/groups/${id}`, 
        method: "GET"
      }),
      transformResponse: (response: { data: IApprovalGroup }) => ({
        data: response.data
      }),
      providesTags: ["WorkflowGroup"]
    }),

    createApprovalGroup: builder.mutation<IApprovalGroupData, Partial<IApprovalGroup>>({
      query: (data) => ({
        url: "/v2/workflow/groups",
        method: "POST",
        body: data
      }),
      transformResponse: (response: { data: IApprovalGroup }) => ({
        data: response.data
      }),
      invalidatesTags: ["WorkflowGroup"]
    }),

    updateApprovalGroup: builder.mutation<
      IApprovalGroupData,
      { id: string; data: Partial<IApprovalGroup> }
    >({
      query: ({ id, data }) => ({
        url: `/v2/workflow/groups/${id}`,
        method: "PUT",
        body: data
      }),
      transformResponse: (response: { data: IApprovalGroup }) => ({
        data: response.data
      }),
      invalidatesTags: ["WorkflowGroup"]
    }),

    deleteApprovalGroup: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/v2/workflow/groups/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["WorkflowGroup"]
    })

  })
});


export const {
  useGetWorkflowDefinitionsQuery,
  useGetApprovalGroupStatsQuery,
  useCreateWorkflowDefinitionMutation,
  useUpdateWorkflowDefinitionMutation,
  useDeleteWorkflowDefinitionMutation,

  useGetApprovalGroupsQuery,
  useGetApprovalGroupByIdQuery,
  useCreateApprovalGroupMutation,
  useUpdateApprovalGroupMutation,
  useDeleteApprovalGroupMutation

} = workflowApi;