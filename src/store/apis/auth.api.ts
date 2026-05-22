// store/apis/auth.api.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./baseQuery";
import {
  setAuth,
  setWeekOffConfig,
  markFirstLoginComplete,
  logout as logoutAction,
} from "../slices/authSlice";
import { RoleTypeEnum } from "../../utils/constants";
import type { WeekOffConfig } from "../../utils/weekOff";
import type { ILocationConfig } from "../slices/authSlice";

interface IUser {
  id: string;
  fullName: string;
  email: string;
  workEmail: string;
  role: RoleTypeEnum;
  status: "active" | "inactive" | string;
  roleId: string;
  isFirstLogin: boolean;
  profilePic?: string;
  reportingManagerId?: string;
  functionalManagerId?: string;
  department?: string;
  employeeId?: string;
  organizationId?: string;
  weekOffConfig?: WeekOffConfig | null;
  locationConfig?: ILocationConfig | null;
}

interface ILoginResponse {
  access_token: string;
  user: IUser;
  organizationSettings?: {
    weekOffConfig?: WeekOffConfig | null;
  };
}

interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
  timestamp: string;
  statusCode: number;
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    login: builder.mutation<
      IApiResponse<ILoginResponse>,
      { workEmail: string; password: string; orgCode?: string }
    >({
      query: (body) => ({
        url: "/v2/auth/login",
        method: "POST",
        body: {...body}
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const payload = data?.data;
          const accessToken = payload?.access_token;
          const userData = payload?.user;

          if (accessToken && userData) {
            dispatch(
              setAuth({
                token: accessToken,
                user: userData,
              }),
            );
            dispatch(
              setWeekOffConfig(
                payload?.organizationSettings?.weekOffConfig ?? null,
              ),
            );
          } else {
            console.error("Invalid login response structure:", data);
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation<void, void>({
      queryFn: async () => {
        // If you have a backend logout endpoint, call it here
        // Otherwise, just return success
        return { data: undefined };
      },
      async onQueryStarted(_, { dispatch }) {
        // Remove token from localStorage
        localStorage.removeItem("hrms_token");

        // Clear auth slice
        dispatch(logoutAction());

        // Clear ALL RTK Query cache
        dispatch(authApi.util.resetApiState());
      },
      invalidatesTags: ["Auth"],
    }),

    changePassword: builder.mutation<
      IApiResponse<void>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/v2/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    forgetPassword: builder.mutation<
      IApiResponse<void>,
      { workEmail: string; orgCode: string }
    >({
      query: (body) => ({
        url: "/v2/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<
      IApiResponse<{ message: string; data: string }>,
      { workEmail: string; otp: string }
    >({
      query: (body) => ({
        url: "/v2/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      IApiResponse<void>,
      { workEmail: string; otp: string; newPassword: string }
    >({
      query: (body) => ({
        url: "/v2/auth/reset-new-password",
        method: "POST",
        body,
      }),
    }),

    markFirstLoginComplete: builder.mutation<IApiResponse<void>, void>({
      query: () => ({
        url: "/v2/auth/mark-first-login",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(markFirstLoginComplete());
        } catch (error) {
          console.error("Mark first login complete failed:", error);
        }
      },
    }),
    // GET /v2/users/me – backend returns { success, data: { user }, message, statusCode, timestamp }
    getMe: builder.query<IApiResponse<{ user: IUser }>, void>({
      query: () => ({
        url: "/v2/users/me",
        method: "GET",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          const userData = data?.data?.user;

          if (userData) {
            const token = localStorage.getItem("hrms_token") ?? "";
            dispatch(
              setAuth({
                user: userData,
                token,
              }),
            );
            dispatch(setWeekOffConfig(userData.weekOffConfig ?? null));
          }
        } catch (error) {
          dispatch(logoutAction());
        }
      },

      providesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useForgetPasswordMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useMarkFirstLoginCompleteMutation,
  useGetMeQuery,
} = authApi;
