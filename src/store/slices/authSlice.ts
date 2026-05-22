// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RoleTypeEnum } from "../../utils/constants";
import type { WeekOffConfig } from "../../utils/weekOff";
export interface ILocationConfig {
  enforceOfficeCheckin: boolean;
  latitude?: number | null;
  longitude?: number | null;
  allowedRadiusMeters?: number;
}

export interface IUser {
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
  employeeId?: string;
  department?: string;
  designation?: string;
  phone?: string;
  joinDate?: string;
  reportingManagerName?: string;
  functionalManagerName?: string;
  organizationId?: string;
  locationConfig?: ILocationConfig | null;
}

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  weekOffConfig: WeekOffConfig | null;
}

// Helper to check if window.ReactNativeWebView exists
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

const initialState: IAuthState = {
  token: localStorage.getItem("hrms_token"),
  user: null,
  isAuthenticated: !!localStorage.getItem("hrms_token"),
  weekOffConfig: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: IUser }>) {
      const { token, user } = action.payload;

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      // Persist token to localStorage
      localStorage.setItem("hrms_token", token);

      // Sync with React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: "USER_LOGIN_SUCCESS",
            payload: { token, user },
          }),
        );
      }
    },

    setWeekOffConfig(state, action: PayloadAction<WeekOffConfig | null>) {
      state.weekOffConfig = action.payload;
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.weekOffConfig = null;

      // Remove token from localStorage
      localStorage.removeItem("hrms_token");
      localStorage.removeItem("hrms_user");

      // Sync with React Native WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({ type: "USER_LOGOUT" }),
        );
      }

      // Redirect to login page
      window.location.href = "/login";
    },

    markFirstLoginComplete(state) {
      if (state.user) {
        state.user.isFirstLogin = false;
      }
    },
  },
});

export const { setAuth, setWeekOffConfig, logout, markFirstLoginComplete } =
  authSlice.actions;

export default authSlice.reducer;
