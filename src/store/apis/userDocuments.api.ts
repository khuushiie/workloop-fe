import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import type { IApiResponse } from "../../types";

import { UserDocumentStatus, DocumentApprovalStatus } from "../../constants/userDocuments";

/** Single user document record returned by the API */
export interface UserDocumentItem {
  id: string;
  userId: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  status: UserDocumentStatus;
  approvalStatus?: string;
  approvalStatusLabel?: string;
  currentActorIds?: string[];
  uploadedByName?: string;
  createdAt: string;
  // Admin approval specific fields
  employeeName?: string;
  employeeEmail?: string;
  employeeId?: string;
}

/** Paginated list response shape */
export interface UserDocumentListResponse {
  data: UserDocumentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

/** Filter params for admin document list */
export interface AdminDocumentFilterParams {
  status?: string;
  userId?: string;
  page?: number;
  limit?: number;
  documentTypeId?: string;
}

/** Filter params for self document list */
export interface SelfDocumentFilterParams {
  status?: string;
  page?: number;
  limit?: number;
  documentTypeId?: string;
}

function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val != null && val !== "") search.set(key, String(val));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const userDocumentsApi = createApi({
  reducerPath: "userDocumentsApi",
  baseQuery,
  tagTypes: ["UserDocuments", "SelfDocuments", "DocApprovals", "AdminDocApprovals"],
  endpoints: (builder) => ({
    /**
     * Admin: Upload a document for a user.
     * POST /v2/user-documents
     */
    adminUploadDocument: builder.mutation<
      UserDocumentItem,
      { userId: string; documentTypeId: string; file: File }
    >({
      query: ({ userId, documentTypeId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", userId);
        formData.append("documentTypeId", documentTypeId);
        return {
          url: "/v2/user-documents",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: IApiResponse<UserDocumentItem>) =>
        raw.data as UserDocumentItem,
      invalidatesTags: ["UserDocuments", "SelfDocuments"],
    }),

    /**
     * Admin: Get documents for a specific user.
     * GET /v2/user-documents/user/:userId
     */
    getDocumentsForUser: builder.query<
      UserDocumentListResponse,
      { userId: string; status?: string; documentTypeId?: string; page?: number; limit?: number }
    >({
      query: ({ userId, ...params }) => ({
        url: `/v2/user-documents/user/${userId}${buildQueryString(params)}`,
      }),
      transformResponse: (raw: IApiResponse<UserDocumentListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10 },
      providesTags: (_, __, { userId }) => [
        { type: "UserDocuments", id: userId },
      ],
    }),

    /**
     * Admin: Soft-delete a document.
     * DELETE /v2/user-documents/:id
     */
    adminDeleteDocument: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v2/user-documents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserDocuments", "SelfDocuments"],
    }),

    /**
     * Admin: Get pending documents for approval.
     * GET /v2/user-documents/admin/pending
     */
    getAdminPendingDocuments: builder.query<
      UserDocumentListResponse,
      AdminDocumentFilterParams | void
    >({
      query: (params) => ({
        url: `/v2/user-documents/admin/pending${buildQueryString((params as Record<string, unknown>) ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<UserDocumentListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10 },
      providesTags: ["AdminDocApprovals"],
    }),

    /**
     * Admin: Get document approval history.
     * GET /v2/user-documents/admin/history
     */
    getAdminDocumentHistory: builder.query<
      UserDocumentListResponse,
      AdminDocumentFilterParams | void
    >({
      query: (params) => ({
        url: `/v2/user-documents/admin/history${buildQueryString((params as Record<string, unknown>) ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<UserDocumentListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10 },
      providesTags: ["AdminDocApprovals"],
    }),

    /**
     * Admin: Perform approval/rejection on a document.
     * PATCH /v2/user-documents/admin/:id/action
     */
    performDocumentAction: builder.mutation<
      UserDocumentItem,
      { id: string; decision: DocumentApprovalStatus.APPROVED | DocumentApprovalStatus.REJECTED; remarks?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/v2/user-documents/admin/${id}/action`,
        method: "PATCH",
        body,
      }),
      transformResponse: (raw: IApiResponse<UserDocumentItem>) =>
        raw.data as UserDocumentItem,
      invalidatesTags: [
        "AdminDocApprovals",
        "UserDocuments",
        "SelfDocuments",
        "DocApprovals",
      ],
    }),

    /**
     * Self: Upload a new document (triggers workflow).
     * POST /v2/user-documents/self
     */
    selfUploadDocument: builder.mutation<
      UserDocumentItem,
      { documentTypeId: string; file: File }
    >({
      query: ({ documentTypeId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentTypeId", documentTypeId);
        return {
          url: "/v2/user-documents/self",
          method: "POST",
          body: formData,
        };
      },
      transformResponse: (raw: IApiResponse<UserDocumentItem>) =>
        raw.data as UserDocumentItem,
      invalidatesTags: ["SelfDocuments", "DocApprovals"],
    }),

    /**
     * Self: Update an existing document (triggers workflow).
     * PUT /v2/user-documents/self/:id
     */
    selfUpdateDocument: builder.mutation<
      UserDocumentItem,
      { id: string; documentTypeId?: string; file: File }
    >({
      query: ({ id, documentTypeId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (documentTypeId) formData.append("documentTypeId", documentTypeId);
        return {
          url: `/v2/user-documents/self/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      transformResponse: (raw: IApiResponse<UserDocumentItem>) =>
        raw.data as UserDocumentItem,
      invalidatesTags: ["SelfDocuments", "DocApprovals"],
    }),

    /**
     * Self: List own documents.
     * GET /v2/user-documents/self
     */
    getSelfDocuments: builder.query<
      UserDocumentListResponse,
      SelfDocumentFilterParams | void
    >({
      query: (params) => ({
        url: `/v2/user-documents/self${buildQueryString((params as Record<string, unknown>) ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<UserDocumentListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10 },
      providesTags: ["SelfDocuments"],
    }),

    /**
     * Self: List approval requests for own documents.
     * GET /v2/user-documents/self/approval-requests
     */
    getSelfApprovalRequests: builder.query<
      UserDocumentListResponse,
      SelfDocumentFilterParams | void
    >({
      query: (params) => ({
        url: `/v2/user-documents/self/approval-requests${buildQueryString((params as Record<string, unknown>) ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<UserDocumentListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10 },
      providesTags: ["DocApprovals"],
    }),

    /**
     * Download a document (get pre-signed URL).
     * GET /v2/user-documents/download/:id
     */
    getDocumentDownloadUrl: builder.query<string, string>({
      query: (id) => ({
        url: `/v2/user-documents/download/${id}`,
      }),
      transformResponse: (raw: IApiResponse<{ url: string; fileName: string }>) =>
        raw.data?.url ?? "",
    }),
  }),
});

export const {
  useAdminUploadDocumentMutation,
  useGetAdminPendingDocumentsQuery,
  useGetAdminDocumentHistoryQuery,
  usePerformDocumentActionMutation,
  useAdminDeleteDocumentMutation,
  useSelfUploadDocumentMutation,
  useSelfUpdateDocumentMutation,
  useGetSelfDocumentsQuery,
  useGetSelfApprovalRequestsQuery,
  useGetDocumentsForUserQuery,
  useLazyGetDocumentDownloadUrlQuery,
} = userDocumentsApi;

