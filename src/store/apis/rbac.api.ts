/**
 * RBAC V2 API - RTK Query slice
 * Backend wraps all responses in { success, message, data, statusCode, timestamp } (ResponseInterceptor).
 * We unwrap `data` via transformResponse so components receive the same shapes as backend DTOs.
 */
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

/** Backend envelope from ResponseInterceptor */
interface IApiEnvelope<T> {
  data?: T;
}

/** List of users with role */
export interface IUserAccessUserRow {
  id: string;
  fullname: string;
  workEmail?: string | null;
  employeeId?: string | null;
  department?: string | null;
  roleId?: string | null;
  role?: string | null;
  status?: string | null;
  reportingManager?: string | null;
  reportingManagerName?: string | null;
  functionalManager?: string | null;
  functionalManagerName?: string | null;
}

export interface IUserAccessPaginatedResponse {
  data: IUserAccessUserRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
import type {
  IPermission,
  IPermissionTreeResponse,
  ICreatePermissionEntity,
  ICreatedPermissionEntityResponse,
  IUpdatePermission,
  IDeletePermissionResponse,
  IRoleResponse,
  IRoleListResponse,
  IRoleListDropdownItem,
  IRoleQueryParams,
  ICreateRole,
  IUpdateRole,
  IDeleteRoleResponse,
  IUserRoleInfo,
  IAssignRole,
  IAssignRoleResponse,
  IAdditionalPermissions,
  IUpdateUserPermissions,
  IEffectivePermissionsResponse,
  IBulkAssignRole,
} from "../../types/rbac";

export const rbacApi = createApi({
  reducerPath: "rbacApi",
  baseQuery,
  tagTypes: [
    "PermissionTree",
    "Roles",
    "Role",
    "UserAccess",
    "UserPermissions",
    "EffectivePermissions",
  ],
  endpoints: (builder) => ({
    // ---------- Permission ----------
    getPermissionTree: builder.query<IPermissionTreeResponse,  { modulesOnly?: boolean } | void>({
       query: (params) => {
    const sp = new URLSearchParams();

    if (params?.modulesOnly) {
      sp.set("modulesOnly", "true");
    }

    return {
      url: `/v2/permission/tree${sp.toString() ? `?${sp}` : ""}`,
      method: "GET",
    };
  },
      transformResponse: (
        raw: IApiEnvelope<IPermissionTreeResponse>,
      ): IPermissionTreeResponse => raw?.data ?? { tree: [], totalCount: 0 },
      providesTags: ["PermissionTree"],
    }),

    createPermissionEntity: builder.mutation<
      ICreatedPermissionEntityResponse,
      ICreatePermissionEntity
    >({
      query: (body) => ({ url: "/v2/permission/entity", method: "POST", body }),
      transformResponse: (
        raw: IApiEnvelope<ICreatedPermissionEntityResponse>,
      ): ICreatedPermissionEntityResponse =>
        raw?.data ?? ({} as ICreatedPermissionEntityResponse),
      invalidatesTags: ["PermissionTree", "EffectivePermissions"],
    }),

    updatePermission: builder.mutation<
      IPermission,
      { id: string; body: IUpdatePermission }
    >({
      query: ({ id, body }) => ({
        url: `/v2/permission/${id}`,
        method: "PATCH",
        body,
      }),
      transformResponse: (raw: IApiEnvelope<IPermission>): IPermission =>
        raw?.data ?? ({} as IPermission),
      invalidatesTags: ["PermissionTree", "EffectivePermissions"],
    }),

    deletePermission: builder.mutation<IDeletePermissionResponse, string>({
      query: (id) => ({ url: `/v2/permission/${id}`, method: "DELETE" }),
      transformResponse: (
        raw: IApiEnvelope<IDeletePermissionResponse>,
      ): IDeletePermissionResponse => raw?.data ?? { deleted: false, count: 0 },
      invalidatesTags: ["PermissionTree", "EffectivePermissions"],
    }),

    // ---------- Roles ----------
    listRoles: builder.query<
      IRoleListResponse | IRoleListDropdownItem[],
      IRoleQueryParams | void
    >({
     query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.active != null) search.set("active", params.active);
        if (params?.page != null) search.set("page", String(params.page));
        if (params?.limit != null) search.set("limit", String(params.limit));
        if (params?.search) search.set("search", params.search);
         if (params?.organizationId)
    search.set("organizationId", params.organizationId);

        const qs = search.toString();
        return { url: `/v2/roles${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      transformResponse: (
        raw: IApiEnvelope<IRoleListResponse | IRoleListDropdownItem[]>,
      ): IRoleListResponse | IRoleListDropdownItem[] =>
        raw?.data ?? {
          items: [],
          total: 0,
          summary: { total: 0, active: 0, inactive: 0 },
        },
      providesTags: ["Roles"],
    }),

    getRole: builder.query<IRoleResponse, string>({
      query: (id) => ({ url: `/v2/roles/${id}`, method: "GET" }),
      transformResponse: (raw: IApiEnvelope<IRoleResponse>): IRoleResponse =>
        raw?.data ?? ({} as IRoleResponse),
      providesTags: (_, __, id) => [{ type: "Role", id }],
    }),

    createRole: builder.mutation<IRoleResponse, ICreateRole>({
      query: (body) => ({ url: "/v2/roles", method: "POST", body }),
      transformResponse: (raw: IApiEnvelope<IRoleResponse>): IRoleResponse =>
        raw?.data ?? ({} as IRoleResponse),
      invalidatesTags: ["Roles"],
    }),

    updateRole: builder.mutation<
      IRoleResponse,
      { id: string; body: IUpdateRole }
    >({
      query: ({ id, body }) => ({
        url: `/v2/roles/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Roles", "Role", "UserAccess", "EffectivePermissions"],
    }),

    deleteRole: builder.mutation<IDeleteRoleResponse, string>({
      query: (id) => ({ url: `/v2/roles/${id}`, method: "DELETE" }),
      transformResponse: (
        raw: IApiEnvelope<IDeleteRoleResponse>,
      ): IDeleteRoleResponse => raw?.data ?? { roleId: "", deleted: false },
      invalidatesTags: ["Roles", "Role", "UserAccess", "EffectivePermissions"],
    }),

    // ---------- User access ----------
    getUserRole: builder.query<IUserRoleInfo, string>({
      query: (userId) => ({
        url: `/v2/user-access/${userId}/role`,
        method: "GET",
      }),
      transformResponse: (raw: IApiEnvelope<IUserRoleInfo>): IUserRoleInfo =>
        raw?.data ?? { userId: "" },
      providesTags: (_, __, userId) => [{ type: "UserAccess", id: userId }],
    }),

    assignRole: builder.mutation<
      IAssignRoleResponse,
      { userId: string; body: IAssignRole }
    >({
      query: ({ userId, body }) => ({
        url: `/v2/user-access/${userId}/role`,
        method: "POST",
        body,
      }),
      transformResponse: (
        raw: IApiEnvelope<IAssignRoleResponse>,
      ): IAssignRoleResponse =>
        raw?.data ?? { userId: "", roleId: "", assigned: false },
      invalidatesTags: (_, __, { userId }) => [
        { type: "UserAccess", id: userId },
        "EffectivePermissions",
      ],
    }),

    bulkAssignRole: builder.mutation<
      IAssignRoleResponse,
      { body: IBulkAssignRole }
    >({
      query: ({ body }) => ({
        url: `/v2/user-access/bulk-assign-role`,
        method: "POST",
        body,
      }),
      transformResponse: (
        raw: IApiEnvelope<IAssignRoleResponse>,
      ): IAssignRoleResponse =>
        raw?.data ?? { userId: "", roleId: "", assigned: false },
      invalidatesTags: (_, __, { body }) => [
        ...body.userIds.map((id) => ({ type: "UserAccess" as const, id })),
        "EffectivePermissions",
      ],
    }),

    getAdditionalPermissions: builder.query<IAdditionalPermissions, string>({
      query: (userId) => ({
        url: `/v2/user-access/${userId}/additional-permissions`,
        method: "GET",
      }),
      transformResponse: (
        raw: IApiEnvelope<IAdditionalPermissions>,
      ): IAdditionalPermissions =>
        raw?.data ?? {
          userId: "",
          rolePermissions: [],
          additionalPermissions: [],
        },
      providesTags: (_, __, userId) => [
        { type: "UserPermissions", id: userId },
      ],
    }),

    updateAdditionalPermissions: builder.mutation<
      IAdditionalPermissions,
      { userId: string; body: IUpdateUserPermissions }
    >({
      query: ({ userId, body }) => ({
        url: `/v2/user-access/${userId}/additional-permissions`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { userId }) => [
        { type: "UserPermissions", id: userId },
        "EffectivePermissions",
      ],
    }),

    clearAdditionalPermissions: builder.mutation<
      { userId: string; cleared: boolean },
      string
    >({
      query: (userId) => ({
        url: `/v2/user-access/${userId}/additional-permissions`,
        method: "DELETE",
      }),
      transformResponse: (
        raw: IApiEnvelope<{ userId: string; cleared: boolean }>,
      ): { userId: string; cleared: boolean } =>
        raw?.data ?? { userId: "", cleared: false },
      invalidatesTags: (_, __, userId) => [
        { type: "UserPermissions", id: userId },
        "EffectivePermissions",
      ],
    }),

    /** Paginated users with role info for Access Right Management → Users tab */
    getUserAccessUsers: builder.query<
      IUserAccessPaginatedResponse,
      { page?: number; limit?: number; search?: string; status?: string | undefined } | void
    >({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.page != null) search.set("page", String(params.page));
        if (params?.limit != null) search.set("limit", String(params.limit));
        if (params?.search) search.set("search", params.search);
        if (params?.status !== undefined) search.set("status", params.status);
        
        const qs = search.toString();
        return {
          url: `/v2/user-access/users${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      transformResponse: (
        raw: IApiEnvelope<IUserAccessPaginatedResponse>,
      ): IUserAccessPaginatedResponse =>
        raw?.data ?? {
          data: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        },
      providesTags: ["UserAccess"],
    }),

    getEffectivePermissions: builder.query<IEffectivePermissionsResponse, void>(
      {
        query: () => ({
          url: "/v2/user-access/effective-permissions",
          method: "GET",
        }),
        transformResponse: (
          raw: IApiEnvelope<IEffectivePermissionsResponse>,
        ): IEffectivePermissionsResponse =>
          raw?.data ?? {
            userId: "",
            permissions: [],
            hierarchy: [],
          },
        providesTags: ["EffectivePermissions"],
      },
    ),
  }),
});

export const {
  useGetPermissionTreeQuery,
  useCreatePermissionEntityMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useListRolesQuery,
  useLazyListRolesQuery,
  useGetRoleQuery,
  useLazyGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetUserRoleQuery,
  useAssignRoleMutation,
  useBulkAssignRoleMutation,
  useGetAdditionalPermissionsQuery,
  useUpdateAdditionalPermissionsMutation,
  useClearAdditionalPermissionsMutation,
  useGetUserAccessUsersQuery,
  useLazyGetUserAccessUsersQuery,
  useGetEffectivePermissionsQuery,
} = rbacApi;
