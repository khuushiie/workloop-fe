import { createApi } from "@reduxjs/toolkit/query/react";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import type { AppDispatch } from "../index";
import { baseQuery } from "./baseQuery";
import { MasterConfigCategory } from "../../constants";

export const MASTER_CONFIG_CATEGORIES_EMPLOYEE = [
  MasterConfigCategory.DEPARTMENT,
  MasterConfigCategory.DESIGNATION,
  MasterConfigCategory.EMPLOYMENT_TYPE,
  MasterConfigCategory.EMPLOYMENT_DISCIPLINE,
  MasterConfigCategory.RELATIONSHIP,
  MasterConfigCategory.EMPLOYMENT_STATUS,
  MasterConfigCategory.GENDER,
] as const;

export type MasterConfigCategoryCode = (typeof MASTER_CONFIG_CATEGORIES_EMPLOYEE)[number];

export interface IMasterConfigOption {
  id: string;
  categoryCode: string;
  categoryName: string;
  displayName: string;
  filterCode: string;
  isActive: boolean;
}

export interface IMasterConfig {
  id: string;
  categoryName: string;
  categoryCode: string;
  displayName: string;
  filterCode: string;
  isActive: boolean;
}

export interface ICategoryCode {
  categoryCode: string;
  categoryName: string;
}

export interface ICategoryCodesResponse {
  success: boolean;
  message: string;
  data: ICategoryCode[];
}

export interface MasterConfigListResponse {
  success: boolean;
  message: string;
  data: IMasterConfig[];
  pagination?: {
    total: number;
    skip: number;
    limit: number;
  };
}

function unwrapList(raw: unknown): unknown[] {
  if (!raw || typeof raw !== "object") return [];
  const inner = (raw as Record<string, unknown>).data;
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === "object" && Array.isArray((inner as Record<string, unknown>).data)) {
    return (inner as Record<string, unknown>).data as unknown[];
  }
  if (Array.isArray(raw)) return raw;
  return [];
}

function transformMasterConfigList(raw: unknown): IMasterConfigOption[] {
  const list = unwrapList(raw);
  return list
    .map((item: unknown) => {
      const rec = item as Record<string, unknown>;
      return {
        _id: (rec._id ?? rec.id)?.toString?.() ?? String(rec._id ?? rec.id ?? ""),
        id: rec.id?.toString?.() ?? String(rec.id ?? ""),
        categoryCode: String(rec.categoryCode ?? ""),
        categoryName: String(rec.categoryName ?? ""),
        displayName: String(rec.displayName ?? rec.filterCode ?? "").trim(),
        filterCode: String(rec.filterCode ?? rec.displayName ?? "").trim().toLowerCase(),
        isActive: Boolean(rec.isActive ?? true),
      };
    })
    .filter((item) => item.id && item.displayName);
}

export const masterConfigApi = createApi({
  reducerPath: "masterConfigApi",
  baseQuery,
  tagTypes: ["MasterConfig"],
  keepUnusedDataFor: 60 * 60,
  endpoints: (builder) => ({
    getMasterConfigByCategory: builder.query<IMasterConfigOption[], string>({
      query: (categoryCode) => ({
        url: `/v2/master-config/by-category/${categoryCode}`,
      }),
      transformResponse: transformMasterConfigList,
      providesTags: (_result, _error, categoryCode) => [
        { type: "MasterConfig", id: categoryCode },
      ],
    }),

    getMasterConfigByCategoryForOrg: builder.query<
      IMasterConfigOption[],
      { categoryCode: string; organizationId: string }
    >({
      query: ({ categoryCode, organizationId }) => ({
        url: `/v2/master-config/by-category/${categoryCode}`,
        params: { organizationId },
      }),
      transformResponse: transformMasterConfigList,
      providesTags: (_result, _error, { categoryCode, organizationId }) => [
        { type: "MasterConfig", id: `${categoryCode}_${organizationId}` },
      ],
    }),

    getCategoryCodes: builder.query<ICategoryCodesResponse, void>({
      query: () => "/v2/master-config/category-codes",
    }),

    getConfigsGroupedByCategory: builder.query<unknown, void>({
      query: () => "/v2/master-config/grouped-by-category",
    }),

    getAllConfigsWithPagination: builder.query<
      unknown,
      { skip?: number; limit?: number }
    >({
      query: ({ skip, limit }) => ({
        url: "/v2/master-config/all",
        params: {
          ...(skip !== undefined && { skip }),
          ...(limit !== undefined && { limit }),
        },
      }),
      providesTags: ["MasterConfig"],
    }),

    getConfigsByCategoryCode: builder.query<
      MasterConfigListResponse,
      { categoryCode: string; skip?: number; limit?: number }
    >({
      query: ({ categoryCode, skip, limit }) => ({
        url: `/v2/master-config/by-category/${categoryCode}`,
        params: {
          ...(skip !== undefined && { skip }),
          ...(limit !== undefined && { limit }),
        },
      }),
      transformResponse: (raw: unknown): MasterConfigListResponse => {
        const list = unwrapList(raw);
        const data: IMasterConfig[] = list
          .map((item: unknown) => {
            const rec = item as Record<string, unknown>;
            const id = typeof rec.id === "string" ? rec.id : (rec._id != null ? String(rec._id) : "");
            return {
              id,
              categoryCode: String(rec.categoryCode ?? ""),
              categoryName: String(rec.categoryName ?? ""),
              displayName: String(rec.displayName ?? ""),
              filterCode: String(rec.filterCode ?? ""),
              isActive: Boolean(rec.isActive ?? true),
            };
          })
          .filter((item) => item.id);
        const rawObj = raw as Record<string, unknown>;
        const pagination = rawObj?.pagination ?? (rawObj?.data && typeof rawObj.data === "object" && (rawObj.data as Record<string, unknown>)?.pagination);
        const result: MasterConfigListResponse = {
          success: true,
          message: "",
          data,
        };
        if (pagination && typeof pagination === "object") {
          result.pagination = pagination as MasterConfigListResponse["pagination"];
        }
        return result;
      },
      providesTags: (_result, _error, { categoryCode }) => [
        { type: "MasterConfig", id: categoryCode },
      ],
    }),

    getActiveConfigCodes: builder.query<string[], string>({
      query: (categoryCode) => `/v2/master-config/active/${categoryCode}`,
    }),

    getActiveConfigOptions: builder.query<
      Array<{ code: string; label: string }>,
      string
    >({
      query: (categoryCode) => `/v2/master-config/options/${categoryCode}`,
    }),

    getAllMasterConfigs: builder.query<unknown, void>({
      query: () => "/v2/master-config",
      providesTags: ["MasterConfig"],
    }),

    getMasterConfigById: builder.query<unknown, string>({
      query: (id) => `/v2/master-config/${id}`,
    }),

    createMasterConfig: builder.mutation<unknown, unknown>({
      query: (data) => ({
        url: "/v2/master-config",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["MasterConfig"],
    }),

    updateMasterConfig: builder.mutation<
      unknown,
      { id: string; data: unknown }
    >({
      query: ({ id, data }) => ({
        url: `/v2/master-config/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["MasterConfig"],
    }),

    deleteMasterConfig: builder.mutation<unknown, string>({
      query: (id) => ({
        url: `/v2/master-config/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MasterConfig"],
    }),
  }),
});

export const {
  useGetMasterConfigByCategoryQuery,
  useGetMasterConfigByCategoryForOrgQuery,
  useGetCategoryCodesQuery,
  useGetConfigsGroupedByCategoryQuery,
  useGetAllConfigsWithPaginationQuery,
  useGetConfigsByCategoryCodeQuery,
  useGetActiveConfigCodesQuery,
  useGetActiveConfigOptionsQuery,
  useGetAllMasterConfigsQuery,
  useGetMasterConfigByIdQuery,
  useCreateMasterConfigMutation,
  useUpdateMasterConfigMutation,
  useDeleteMasterConfigMutation,
} = masterConfigApi;

/**
 * Prefetch employee-related master config categories into the RTK Query cache.
 * Call once when the app/layout mounts (e.g. after login). Components using
 * useGetMasterConfigByCategoryQuery will then read from cache and not trigger API calls.
 * Uses force: false so existing cached data is not refetched.
 */
export function usePrefetchMasterConfigForEmployee(): void {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    MASTER_CONFIG_CATEGORIES_EMPLOYEE.forEach((categoryCode) => {
      dispatch(
        masterConfigApi.util.prefetch("getMasterConfigByCategory", categoryCode, {
          force: false,
        })
      );
    });
  }, [dispatch]);
}
