import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { IApiResponse } from "../../types";
import { WorkflowStatusCode } from "../../utils/constants";

export interface IRegularizationRequest {
    id: string;
    userId: string;
    userName: string;
    fullName: string;
    employeeId: string;
    department: string;
    departmentName?: string;
    date: string;
    regularizationType: string;
    regularizationTypeName: string;
    regularizationTypeCode: string;
    requestedCheckInTime: string;
    requestedCheckOutTime: string;
    actualCheckInTime?: string;
    actualCheckOutTime?: string;
    reason: string;
    status: WorkflowStatusCode;
    statusLabel: string;
    currentActorId?: string;
    currentActorName?: string;
    approvedByName?: string;
    rejectionReason?: string;
    appliedDate: string;
    attendanceUpdated: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateRegularizationPayload {
    date: string;
    regularizationType: string;
    requestedCheckInTime: string;
    requestedCheckOutTime: string;
    reason: string;
}

export interface IRegularizationActionPayload {
    decision: "approved" | "rejected";
    remarks?: string;
}

/** Semantic workflow status for accordion filtering */
export type WorkflowQueryStatusFilter = "pending" | "history";

export interface IRegularizationFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    /** Semantic: "pending" | "history" */
    status?: WorkflowQueryStatusFilter;
    regularizationType?: string;
    statuses?: string;
    reporteesOnly?: boolean;
    userId?: string;
    department?: string;
    dateFrom?: string;
    dateTo?: string;
    fromDate?: string;
    toDate?: string;
    [key: string]: unknown;
}

export interface IPaginatedRegularizationResponse {
    data: IRegularizationRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IRegularizationReportFilters {
    userId?: string;
    department?: string;
    status?: string;
    regularizationType?: string;
    startDate?: string;
    endDate?: string;
    month?: string;
    year?: string;
    page?: number;
    limit?: number;
}

export interface IRegularizationReportResponse {
    requests: IRegularizationRequest[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface IRegularizationStatsResponse {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: string;
}

export const attendanceRegularizationApi = createApi({
    reducerPath: "attendanceRegularizationApi",
    baseQuery: baseQuery,
    tagTypes: ["Regularization", "RegularizationReport", "RegularizationStats"],
    endpoints: (builder) => ({
        createRegularization: builder.mutation<IRegularizationRequest, ICreateRegularizationPayload>({
            query: (body) => ({
                url: "/v2/attendance/regularization",
                method: "POST",
                body,
            }),
            transformResponse: (response: IApiResponse<IRegularizationRequest>) => response?.data!,
            invalidatesTags: ["Regularization", "RegularizationReport", "RegularizationStats"],
        }),

        getRegularizationRequests: builder.query<IPaginatedRegularizationResponse, IRegularizationFilters>({
            query: (params) => ({
                url: "/v2/attendance/regularization",
                method: "GET",
                params,
            }),
            transformResponse: (response: IApiResponse<IPaginatedRegularizationResponse>) =>
                response.data || { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
            providesTags: ["Regularization"],
        }),

        getMyRegularizationRequests: builder.query<IPaginatedRegularizationResponse, { page?: number; limit?: number }>({
            query: (params) => ({
                url: "/v2/attendance/regularization/me",
                method: "GET",
                params,
            }),
            transformResponse: (response: IApiResponse<IPaginatedRegularizationResponse>) =>
                response.data || { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
            providesTags: ["Regularization"],
        }),

        getRegularizationById: builder.query<IRegularizationRequest, string>({
            query: (id) => ({
                url: `/v2/attendance/regularization/${id}`,
                method: "GET",
            }),
            transformResponse: (response: IApiResponse<IRegularizationRequest>) => response.data!,
            providesTags: (_result, _error, id) => [{ type: "Regularization", id }],
        }),

        getRegularizationReport: builder.query<IRegularizationReportResponse, IRegularizationReportFilters>({
            query: (params) => ({
                url: "/v2/attendance/regularization/report",
                method: "GET",
                params,
            }),
            transformResponse: (response: IApiResponse<IRegularizationReportResponse>) =>
                response.data || { requests: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
            providesTags: ["RegularizationReport"],
        }),

        getRegularizationStats: builder.query<IRegularizationStatsResponse, void>({
            query: () => ({
                url: "/v2/attendance/regularization/report/stats",
                method: "GET",
            }),
            transformResponse: (response: IApiResponse<IRegularizationStatsResponse>) =>
                response.data || { total: 0, pending: 0, approved: 0, rejected: 0, approvalRate: "0.00%" },
            providesTags: ["RegularizationStats"],
        }),

        actionRegularization: builder.mutation<IRegularizationRequest, { id: string; body: IRegularizationActionPayload }>({
            query: ({ id, body }) => ({
                url: `/v2/attendance/regularization/${id}/action`,
                method: "PUT",
                body,
            }),
            transformResponse: (response: IApiResponse<IRegularizationRequest>) => response.data!,
            invalidatesTags: (_result, _error, { id }) => [
                "Regularization",
                { type: "Regularization", id },
                "RegularizationReport",
                "RegularizationStats",
            ],
        }),

        pullbackRegularization: builder.mutation<IRegularizationRequest, string>({
            query: (id) => ({
                url: `/v2/attendance/regularization/pullback/${id}`,
                method: "PUT",
            }),
            transformResponse: (response: IApiResponse<IRegularizationRequest>) => response.data!,
            invalidatesTags: (_result, _error, id) => [
                "Regularization",
                { type: "Regularization", id },
                "RegularizationReport",
                "RegularizationStats",
            ],
        }),
    }),
});

export const {
    useCreateRegularizationMutation,
    useGetRegularizationRequestsQuery,
    useGetMyRegularizationRequestsQuery,
    useGetRegularizationByIdQuery,
    useGetRegularizationReportQuery,
    useGetRegularizationStatsQuery,
    useActionRegularizationMutation,
    usePullbackRegularizationMutation,
} = attendanceRegularizationApi;
