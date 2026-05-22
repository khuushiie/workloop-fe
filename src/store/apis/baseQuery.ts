// store/api/baseQuery.ts
import {
  fetchBaseQuery,
  FetchArgs,
} from "@reduxjs/toolkit/query/react";
import { logout } from "../slices/authSlice";
import { BaseQueryApi } from "@reduxjs/toolkit/query";

// Import mock handlers from dedicated mocks folder
import { getMockResponse, isMockableUrl, handleMockMutation } from "../../mocks/survey.mock";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("hrms_token");
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Check if mocking is enabled
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const baseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions?: { skipAuthLogout?: boolean }
) => {
  // Extract URL for mock checking
  const url = typeof args === "string"
    ? args
    : "url" in args ? args.url : "";

  const method = typeof args === "string"
    ? "GET"
    : args.method ?? "GET";

  // MOCK INTERCEPTOR: Return mock data if enabled and URL matches
  if (USE_MOCK_DATA && isMockableUrl(url)) {
    // Error simulation: check for ?_mockError=400 or 500
    const urlObj = new URL(url, "http://localhost");
    const mockError = urlObj.searchParams.get("_mockError");
    if (mockError === "400" || mockError === "500") {
      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        error: {
          status: parseInt(mockError),
          data: { success: false, message: `Simulated ${mockError} error` }
        }
      };
    }

    // Handle mutations (POST/PUT/DELETE) with state persistence
    if (method !== "GET") {
      const mutationResult = handleMockMutation(url, method, typeof args === "object" ? args.body : undefined);
      if (mutationResult) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: mutationResult };
      }
    }

    // Handle GET requests
    const mockResult = getMockResponse(url, method, typeof args === "object" ? args.body : undefined);
    if (mockResult) {
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: mockResult };
    }
  }

  // REAL API: Fall through to actual network request
  const result = await rawBaseQuery(args, api, extraOptions || {});

  // Logout only for non-login 401s
  if (
    result.error?.status === 401 &&
    !extraOptions?.skipAuthLogout &&
    !url.includes("/login")
  ) {
    api.dispatch(logout());
  }

  return result;
};
