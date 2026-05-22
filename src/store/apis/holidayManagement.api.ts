import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";

// --- Interfaces ---

export interface IHoliday {
    id: string;
    name: string;
    date: string; // ISO String
    year: number;
    isMandatory: boolean;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// Request Payload for Creating a Holiday
export interface ICreateHolidayRequest {
    name: string;
    date: string; // ISO String
    year: number;
    isMandatory: boolean;
    description?: string;
}

// Request Payload for Updating (Partial)
export interface IUpdateHolidayRequest {
    id: string; // Needed for the URL, extracted before sending body
    name?: string;
    date?: string;
    year?: number;
    isMandatory?: boolean;
    description?: string;
}

// Query Params for Filtering
export interface IHolidayFilters {
    year?: number;
    isMandatory?: boolean;
}

// Generic Response Wrapper
interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    statusCode?: number;
    timestamp?: string;
    error?: string;
}

// --- API Definition ---

export const holidayManagementApi = createApi({
    reducerPath: "holidayManagementApi",
    baseQuery: baseQuery,
    tagTypes: ["Holiday"], // Tag for cache management

    endpoints: (builder) => ({

        // 1. Get All Holidays (with optional filters)
        getHolidays: builder.query<IApiResponse<IHoliday[]>, IHolidayFilters | void>({
            query: (params) => ({
                url: "/v2/holiday",
                method: "GET",
                params: params || undefined,
            }),
            // Provides a general "LIST" tag + individual tags for each item
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({ type: "Holiday" as const, id })),
                        { type: "Holiday", id: "LIST" },
                    ]
                    : [{ type: "Holiday", id: "LIST" }],
        }),

        // 2. Get Current Year Holidays (for dashboard)
        getCurrentYearHolidays: builder.query<IHoliday[], void>({
            query: () => ({ url: "/v2/holiday/current-year" }),
            transformResponse: (raw: IApiResponse<IHoliday[]>) => {
                const list = raw?.data ?? (Array.isArray(raw) ? raw : []);
                return list.map((h: IHoliday & { _id?: string }) => ({
                    ...h,
                    id: h.id ?? h._id ?? "",
                    _id: h.id ?? h._id ?? "",
                }));
            },
            providesTags: [{ type: "Holiday", id: "CURRENT_YEAR" }],
        }),

        // 3. Get Single Holiday by ID
        getHolidayById: builder.query<IApiResponse<IHoliday>, string>({
            query: (id) => ({
                url: `/v2/holiday/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "Holiday", id }],
        }),

        // 4. Create New Holiday
        createHoliday: builder.mutation<IApiResponse<IHoliday>, ICreateHolidayRequest>({
            query: (body) => ({
                url: "/v2/holiday",
                method: "POST",
                body,
            }),
            // Invalidating LIST ensures the main table updates
            invalidatesTags: [
                { type: "Holiday", id: "LIST" },
                { type: "Holiday", id: "CURRENT_YEAR" }
            ],
        }),

        // 5. Update Holiday
        updateHoliday: builder.mutation<IApiResponse<IHoliday>, IUpdateHolidayRequest>({
            query: ({ id, ...body }) => ({
                url: `/v2/holiday/${id}`,
                method: "PATCH",
                body,
            }),
            // Invalidate the specific ID (updates detail view) and Lists
            invalidatesTags: (result, error, { id }) => [
                { type: "Holiday", id },
                { type: "Holiday", id: "LIST" },
                { type: "Holiday", id: "CURRENT_YEAR" }
            ],
        }),

        // 6. Delete Holiday
        deleteHoliday: builder.mutation<IApiResponse<void>, string>({
            query: (id) => ({
                url: `/v2/holiday/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Holiday", id },
                { type: "Holiday", id: "LIST" },
                { type: "Holiday", id: "CURRENT_YEAR" }
            ],
        }),

    }),
});

export const {
    useGetHolidaysQuery,
    useGetCurrentYearHolidaysQuery,
    useGetHolidayByIdQuery,
    useCreateHolidayMutation,
    useUpdateHolidayMutation,
    useDeleteHolidayMutation,
} = holidayManagementApi;   