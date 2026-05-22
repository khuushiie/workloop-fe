import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import type { IApiResponse } from "../../types";

export interface GameBookingItem {
  id: string;
  gameId: string;
  gameName: string;
  createdBy: string;
  creatorName: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  statusLabel?: string;
  currentActorName?: string;
  notes?: string;
  participants: string[];
  participantNames?: string[];
  rejectionReason?: string;
  approvalInstanceId?: string;
  createdAt: string;
}

export interface GameBookingListResponse {
  data: GameBookingItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MyBookingsResponse {
  createdByMe: GameBookingItem[];
  participatingIn: GameBookingItem[];
}

export interface GameBookingListParams {
  status?: string;
  userId?: string;
  gameId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateGameBookingBody {
  gameId: string;
  startTime: string;
  duration?: number;
  participants?: string[];
  notes?: string;
}

export interface BookingActionBody {
  decision: "approved" | "rejected";
  remarks?: string;
}

function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val != null && val !== "") search.set(key, String(val));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const gameBookingApi = createApi({
  reducerPath: "gameBookingApi",
  baseQuery,
  tagTypes: ["BookingList", "MyBookings"],
  endpoints: (builder) => ({
    getBookingList: builder.query<
      GameBookingListResponse,
      GameBookingListParams | void
    >({
      query: (params) => ({
        url: `/v2/game-booking${buildQueryString((params as Record<string, unknown>) ?? {})}`,
      }),
      transformResponse: (raw: IApiResponse<GameBookingListResponse>) =>
        raw.data ?? { data: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      providesTags: [{ type: "BookingList" }],
    }),

    getMyBookings: builder.query<MyBookingsResponse, void>({
      query: () => ({ url: "/v2/game-booking/my-bookings" }),
      transformResponse: (raw: IApiResponse<MyBookingsResponse>) =>
        raw.data ?? { createdByMe: [], participatingIn: [] },
      providesTags: [{ type: "MyBookings" }],
    }),

    getBookingById: builder.query<GameBookingItem, string>({
      query: (id) => ({ url: `/v2/game-booking/${id}` }),
      transformResponse: (raw: IApiResponse<GameBookingItem>) =>
        raw.data as GameBookingItem,
    }),

    createBooking: builder.mutation<GameBookingItem, CreateGameBookingBody>({
      query: (body) => ({
        url: "/v2/game-booking",
        method: "POST",
        body,
      }),
      transformResponse: (raw: IApiResponse<GameBookingItem>) =>
        raw.data as GameBookingItem,
      invalidatesTags: [{ type: "BookingList" }, { type: "MyBookings" }],
    }),

    performBookingAction: builder.mutation<
      GameBookingItem,
      { id: string } & BookingActionBody
    >({
      query: ({ id, ...body }) => ({
        url: `/v2/game-booking/${id}/action`,
        method: "PATCH",
        body,
      }),
      transformResponse: (raw: IApiResponse<GameBookingItem>) =>
        raw.data as GameBookingItem,
      invalidatesTags: [{ type: "BookingList" }, { type: "MyBookings" }],
    }),

    cancelBooking: builder.mutation<GameBookingItem, string>({
      query: (id) => ({
        url: `/v2/game-booking/${id}/cancel`,
        method: "PATCH",
      }),
      transformResponse: (raw: IApiResponse<GameBookingItem>) =>
        raw.data as GameBookingItem,
      invalidatesTags: [{ type: "BookingList" }, { type: "MyBookings" }],
    }),
  }),
});

export const {
  useGetBookingListQuery,
  useGetMyBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  usePerformBookingActionMutation,
  useCancelBookingMutation,
} = gameBookingApi;
