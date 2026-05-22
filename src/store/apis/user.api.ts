import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import { authApi } from "./auth.api";
import type {
  IApiResponse,
  IApiResponseDto,
  ICreateUserBody,
  ICreateUserResult,
  IPaginationMeta,
  IPaginatedUserListPayload,
  IUserDetail,
  IUserFilterItem,
  IUserQueryParams,
  IUserStats,
  IUpdateUserBody,
} from "../../types";
import { billingLicenseApi } from "./billingLicense.api";

// Dashboard: active users with attendance status
export type ActiveUserStatusType =
  | "not_checked_in"
  | "checked_in"
  | "on_break"
  | "checked_out";

export interface IActiveUserStatusItem {
  userId: string;
  name: string;
  employeeId?: string;
  email: string;
  status: ActiveUserStatusType;
}

export interface IActiveUsersStatusCounts {
  not_checked_in: number;
  checked_in: number;
  on_break: number;
  checked_out: number;
}

export interface IActiveUsersStatusResponse {
  users: IActiveUserStatusItem[];
  counts?: IActiveUsersStatusCounts;
}

// Dashboard: current user stats (single API for user dashboard)
export interface IUserDashboardStats {
  leaveBalance: number;
  timesheetHoursThisMonth: number;
  leaveApproved: number;
  pendingTimesheetRequests: number;
}

// Dashboard: month joiners + birthdays/anniversaries
export interface IMonthJoinerItem {
  name: string;
  workEmail: string;
  employeeId?: string;
}

export interface IBirthdayItem {
  userId: string;
  name: string;
  workEmail: string;
  employeeId?: string;
}

export interface IAnniversaryItem {
  userId: string;
  name: string;
  workEmail: string;
  employeeId?: string;
  joinDate: string;
  yearsOfService: number;
}

export interface ISendWishBody {
  targetUserId: string;
  type: "birthday" | "anniversary";
  message: string;
}

export interface ICelebrationsResponse {
  monthJoiners: IMonthJoinerItem[];
  birthdays: IBirthdayItem[];
  anniversaries: IAnniversaryItem[];
}

export interface IBulkUploadUserResult {
  totalRows: number;
  created: number;
  failed: number;
  message: string;
  errorFileBlob?: Blob;
}

function buildQueryString(params: IUserQueryParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

const emptyPagination: IPaginationMeta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery,
  tagTypes: ["User", "UserList", "UserFilter", "Dashboard"],
  endpoints: (builder) => ({
    // POST /v2/users – create user with profile, address, etc.
    // Raw response: ApiResponse<ApiResponseDto<CreateUserResult>>
    createUser: builder.mutation<ICreateUserResult | undefined, ICreateUserBody>({
      query: (body) => ({
        url: "/v2/users",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<IApiResponseDto<ICreateUserResult>>) => {
        const data = (raw.data as any)?.data ?? raw.data;
        if (data?.user && data.user._id && !data.user.id) {
          data.user.id = data.user._id;
        }
        return data;
      },
      invalidatesTags: [{ type: "UserList" }, { type: "UserFilter" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            billingLicenseApi.util.invalidateTags([
              { type: "License", id: "SUMMARY" },
              { type: "Billing", id: "CURRENT" },
            ])
          );
        } catch {
          // mutation failed — nothing to sync
        }
      },
    }),

    // GET /v2/users/filter – minimal list for dropdowns (id, fullName)
    // Raw response: ApiResponse<UserFilterItem[]>
    getUsersForFilter: builder.query<IUserFilterItem[], { includeInactive?: boolean; reporteesOnly?: boolean ;organizationId?: string } | void>({
      query: (params = {}) => {
        const search = new URLSearchParams();
        if (params?.includeInactive === true) search.set("includeInactive", "true");
        if (params?.reporteesOnly === true) search.set("reporteesOnly", "true");
        if (params?.organizationId) search.set("organizationId", params.organizationId);
        const qs = search.toString();
        return { url: `/v2/users/filter${qs ? `?${qs}` : ""}` };
      },
      transformResponse: (raw: IApiResponse<IUserFilterItem[]>) => raw.data ?? [],
      providesTags: ["UserFilter"],
    }),

    // GET /v2/users/filter/all – all active users in the org (id, fullName), no reportee scoping
    getAllOrgUsersForFilter: builder.query<IUserFilterItem[], void>({
      query: () => ({ url: "/v2/users/filter/all" }),
      transformResponse: (raw: IApiResponse<IUserFilterItem[]>) => raw.data ?? [],
      providesTags: ["UserFilter"],
    }),

    // GET /v2/users/stats – dashboard counts (define before getUsers so /stats is not interpreted as :id)
    getStats: builder.query<IUserStats | undefined, void>({
      query: () => ({ url: "/v2/users/stats" }),
      transformResponse: (raw: IApiResponse<IUserStats>) => raw.data,
      providesTags: ["UserList"],
    }),

    // GET /v2/users/dashboard/admin-stats – admin only. Backend uses req.user.organizationId; param only for cache key.
    getAdminDashboardStats: builder.query<
      IUserDashboardStats | undefined,
      { organizationId?: string | null } | void
    >({
      query: () => ({ url: "/v2/users/dashboard/admin-stats" }),
      transformResponse: (raw: IApiResponse<IUserDashboardStats>) => raw.data,
      providesTags: (_, __, arg) => [
        { type: "Dashboard", id: arg?.organizationId ?? "admin-stats" },
      ],
    }),

    // GET /v2/users – paginated list with filters
    // Raw response: ApiResponse<PaginatedUserListPayload>
    getUsers: builder.query<IPaginatedUserListPayload, IUserQueryParams | void>({
      query: (params = {}) => ({
        url: `/v2/users${buildQueryString(params as IUserQueryParams)}`,
      }),
      transformResponse: (raw: IApiResponse<IPaginatedUserListPayload>) =>
        raw.data ?? { data: [], pagination: emptyPagination },
      providesTags: (_, __, arg) => [{ type: "UserList", id: arg ? JSON.stringify(arg) : "list" }],
    }),

    // GET /v2/users/:id – user detail
    // Backend returns { success, data: userDetail, message, statusCode, timestamp } (single wrap)
    getUserById: builder.query<IUserDetail | undefined, string>({
      query: (id) => ({ url: `/v2/users/${id}` }),
      transformResponse: (raw: IApiResponse<IUserDetail>) => raw.data ?? (raw as any).data?.data,
      providesTags: (_, __, id) => [{ type: "User", id }],
    }),

    // PUT /v2/users/:id – update user
    // Backend returns { success, data: userDetail, message, statusCode, timestamp }
    updateUser: builder.mutation<IUserDetail | undefined, { id: string; body: IUpdateUserBody }>({
      query: ({ id, body }) => ({
        url: `/v2/users/${id}`,
        method: "PUT",
        body,
      }),
      transformResponse: (raw: IApiResponse<IUserDetail>) => raw.data ?? (raw as any).data?.data,
      invalidatesTags: [{ type: "UserList" }, { type: "UserFilter" }],
      async onQueryStarted({ id }, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;
          const currentUserId = (getState() as any).auth?.user?.id;
          if (id === currentUserId) {
            dispatch(authApi.util.invalidateTags(["Auth"]));
          }
        } catch {
          // mutation failed – nothing to sync
        }
      },
    }),

    // DELETE /v2/users/:id?retain_license=true|false
    // Raw response: ApiResponse<ApiResponseDto<{ deleted: boolean }>>
    deleteUser: builder.mutation<
      { deleted: boolean } | undefined,
      { id: string; retainLicense?: boolean }
    >({
      query: ({ id, retainLicense }) => {
        const params = new URLSearchParams();
        if (retainLicense !== undefined) {
          params.set("retain_license", String(retainLicense));
        }
        const qs = params.toString();
        return {
          url: `/v2/users/${id}${qs ? `?${qs}` : ""}`,
          method: "DELETE",
        };
      },
      transformResponse: (raw: IApiResponse<IApiResponseDto<{ deleted: boolean }>>) => raw.data?.data,
      invalidatesTags: (_, __, { id }) => [
        { type: "User", id },
        { type: "UserList" },
        { type: "UserFilter" },
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            billingLicenseApi.util.invalidateTags([
              { type: "License", id: "SUMMARY" },
              { type: "Billing", id: "CURRENT" },
            ])
          );
        } catch {
          // mutation failed — nothing to sync
        }
      },
    }),

    // GET /v2/users/dashboard/active-status – active users with today's attendance status. Backend uses req.user.organizationId; param only for cache key.
    getActiveUsersStatus: builder.query<
      IActiveUsersStatusResponse,
      { organizationId?: string | null } | void
    >({
      query: () => ({ url: "/v2/users/dashboard/active-status" }),
      transformResponse: (raw: IApiResponse<IActiveUsersStatusResponse>) =>
        raw.data ?? { users: [], counts: undefined },
      providesTags: (_, __, arg) => [
        { type: "Dashboard", id: arg?.organizationId ? `active-${arg.organizationId}` : "active" },
      ],
    }),

    // GET /v2/users/dashboard/celebrations – month joiners + birthdays/anniversaries. Backend uses req.user.organizationId; param only for cache key.
    getCelebrations: builder.query<
      ICelebrationsResponse,
      { date?: string; organizationId?: string | null } | void
    >({
      query: (params) => {
        const qs = params?.date ? `?date=${encodeURIComponent(params.date)}` : "";
        return { url: `/v2/users/dashboard/celebrations${qs}` };
      },
      transformResponse: (raw: IApiResponse<ICelebrationsResponse>) =>
        raw.data ?? {
          monthJoiners: [],
          birthdays: [],
          anniversaries: [],
        },
      providesTags: (_, __, arg) => [
        {
          type: "Dashboard",
          id: `celebrations-${arg?.organizationId ?? "all"}-${arg?.date ?? "today"}`,
        },
      ],
    }),

    // GET /v2/users/bulk/template – download Excel template for bulk user upload
    downloadBulkUserTemplate: builder.query<Blob, void>({
      query: () => ({
        url: "/v2/users/bulk/template",
        responseHandler: (response) => response.blob(),
      }),
    }),

    // POST /v2/users/bulk – bulk upload users from Excel file
    // Returns JSON on full success, or an Excel error report (blob) on partial/full failure.
    bulkUploadUsers: builder.mutation<IBulkUploadUserResult, FormData>({
      queryFn: async (formData, _queryApi, _extraOptions, fetchWithBQ) => {
        const result = await fetchWithBQ({
          url: "/v2/users/bulk",
          method: "POST",
          body: formData,
          responseHandler: (response: Response) => {
            const ct = response.headers.get("content-type") ?? "";
            if (ct.includes("spreadsheetml") || ct.includes("octet-stream")) {
              return response.blob();
            }
            return response.json();
          },
        });

        if (result.error) return { error: result.error };

        if (result.data instanceof Blob) {
          const meta = result.meta as { response?: Response } | undefined;
          const headers = meta?.response?.headers;
          return {
            data: {
              totalRows: Number(headers?.get("X-Bulk-Upload-Total") ?? 0),
              created: Number(headers?.get("X-Bulk-Upload-Created") ?? 0),
              failed: Number(headers?.get("X-Bulk-Upload-Failed") ?? 0),
              message: headers?.get("X-Bulk-Upload-Message") ?? "Upload completed with errors. Error report downloaded.",
              errorFileBlob: result.data as Blob,
            },
          };
        }

        const json = result.data as IApiResponse<IBulkUploadUserResult>;
        return {
          data: json?.data ?? {
            totalRows: 0, created: 0, failed: 0,
            message: "Bulk upload returned no data.",
          },
        };
      },
    }),

    // GET /v2/users/download – download employee list as Excel (non-paginated)
    downloadEmployees: builder.query<
      Blob,
      { name?: string; status?: string; department?: string; employmentType?: string }
    >({
      query: (params = {}) => {
        const sp = new URLSearchParams();
        if (params.name) sp.set("name", params.name);
        if (params.status) sp.set("status", params.status);
        if (params.department) sp.set("department", params.department);
        if (params.employmentType) sp.set("employmentType", params.employmentType);
        return {
          url: `/v2/users/download${sp.toString() ? `?${sp}` : ""}`,
          method: "GET",
          responseHandler: (response) => response.blob(),
        };
      },
    }),

    sendWish: builder.mutation<IApiResponseDto<null>, ISendWishBody>({
      query: (body) => ({
        url: "/v2/users/wish",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useGetUsersForFilterQuery,
  useLazyGetUsersForFilterQuery,
  useGetAllOrgUsersForFilterQuery,
  useGetStatsQuery,
  useGetAdminDashboardStatsQuery,
  useGetUsersQuery,
  useLazyGetUsersQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetActiveUsersStatusQuery,
  useGetCelebrationsQuery,
  useLazyDownloadBulkUserTemplateQuery,
  useLazyDownloadEmployeesQuery,
  useBulkUploadUsersMutation,
  useSendWishMutation,
} = userApi;
