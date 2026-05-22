import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { OFFICE_CONFIG } from "../utils/config";
import { IPublishSurveyPayload, ISurveyTemplate } from "../types/survey.api.types";
import { WorkflowDecision } from "../utils/workflow.enum";
import { ResourceAllocationPayload } from "../types/resource-allocation";
import { IHoliday } from "../types/holiday.types";
import { ICompOffRequest } from "../types/comp-off.types";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

/** Single row-level validation error returned from holiday bulk upload */
export interface IBulkHolidayUploadError {
  row: number;
  field: string;
  message: string;
}

/**
 * Response returned by POST /v2/holiday/bulk-upload.
 * Callers derive success from `successfulImports > 0`.
 */
export interface IBulkHolidayUploadResult {
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  duplicates: string[];
  errors: IBulkHolidayUploadError[];
  summary: string;
}

/** Shape of the user object stored in localStorage */
export interface ICurrentUser {
  id: string;
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
}

/** Typed error object attached by the response interceptor */
export interface IApiError extends Error {
  response?: AxiosResponse;
  status?: number;
  data?: unknown;
  isNetworkError?: boolean;
}

/** Generic filter/create data shape for endpoints that accept free-form objects */
export interface IFilterData {
  [key: string]: string | number | boolean | string[] | undefined;
}

/** Generic project form payload */
export interface IProjectFormData {
  name: string;
  description?: string;
  clientName?: string;
  capacity?: number;
  startDate?: string;
  endDate?: string;
  domain?: string;
  status?: string;
  poc?: string;
  priority?: string;
  billable?: boolean;
  category?: string;
  [key: string]: unknown;
}

/** Generic leave request payload */
export interface ILeaveRequestPayload {
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  isHalfDay?: boolean;
  halfDayType?: "first_half" | "second_half";
  [key: string]: unknown;
}

/** Leave credit / debit payload */
export interface ILeaveCreditPayload {
  userId: string;
  leaveType: string;
  days: number;
  year?: number;
  month?: number;
  reason?: string;
  [key: string]: unknown;
}

/** Comp-off creation payload */
export interface ICompOffCreatePayload {
  userId: string;
  leaveDate: string;
  isFirstHalf?: boolean;
  isSecondHalf?: boolean;
  comment?: string;
  [key: string]: unknown;
}

export interface CompOffResponse<T = ICompOffRequest> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateCompOffResponse {
  results: string[];
  skipped: string[];
}


export interface ResourceStats {
  totalProjects: number;
  totalEmployees: number;
  allocatedResources: number;
  avgAllocation: number;


}


export interface ProjectStats {
  totalProjects: number;
  currentProjects: number;
  completedProjects: number;
  billableProjects: number;
}

//Interface for resource-details

export interface AssignedBy {
  _id: string;
  firstName: string;
  lastName?: string;
}


export interface ProjectInfo {
  _id: string;
  name: string;
  description: string;
  clientName: string;
  capacity: number;
  startDate: string;
  endDate: string;
  domain: string;
  status: string;
  poc?: {
    _id: string;
    firstName: string;
    lastName?: string;
  };
  priority: string;
  billable: boolean;
  category: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}



//Interface for filter report download

export interface ResourceReportFilters {
  startDate?: string;
  endDate?: string;
  userIds?: string[];
  search?: string;
  role?: string;
}

export interface ProjectReportFilters {
  startDate?: string;
  endDate?: string;
  search?: string;
  domain?: string;
  category?: string;
  status?: string;
  role?: string;
}


export interface ResourceAllocationItem {
  _id: string;
  allocationPercentage: number;
  projectRole: string;
  startDate: string;
  endDate: string;
  grade?: string;
  userId: string;
  projectId: ProjectInfo | null;
  assignedBy: AssignedBy;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}


export interface ResourceSummary {
  totalAllocations: number;
  activeCount: number;
  previousCount: number;
}


export interface ResourceDetailsData {
  userId: string;
  summary: ResourceSummary;
  currentProjects: ResourceAllocationItem[];
  previousProjects: ResourceAllocationItem[];
}


export interface ResourceDetailsResponse {
  success: boolean;
  message: string;
  data: ResourceDetailsData;
  statusCode: number;
  timestamp: string;
}

export interface ProjectAnalyticsResponse {
  projectStatus: {
    totalProjects: number;
    domainPercentages: Record<string, number>;
  };

  billing: {
    billableCount: number;
    nonBillableCount: number;
  };

  classification: {
    month: string;
    priorities: {
      high: number;
      medium: number;
      low: number;
    };
  }[];

  upcomingDeadlines: {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
  }[];

  teamSizeByProject: {
    projectName: string;
    capacity: number;
    totalCurrentAllocation: number;
  }[];

  resourceHeatmap: Array<{
    projectName: string;
    [role: string]: number | string;
  }>;
}






// Shared axios instance for the entire app
export const apiAxios: AxiosInstance = axios.create({
  baseURL: OFFICE_CONFIG.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (auth token)
apiAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("hrms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Response interceptor to unwrap backend envelope
apiAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.responseType === "blob") {
      return response;
    }

    if (response.config.method === "delete" && response.status === 200) {
      return { success: true, message: "Deleted successfully" } as ApiResponse;
    }

    if (response.config.url?.includes("/leave/balance/")) {
      return response.data;
    }

    const payload = response.data;
    if (payload && typeof payload === "object" && "success" in payload) {
      if ("pagination" in payload) {
        return {
          data: payload.data,
          pagination: payload.pagination,
          message: payload.message,
          statusCode: payload.statusCode,
        };
      }
      return payload.data;
    }

    return payload;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        const requestUrl: string | undefined =
          error.config?.url || error.response.config?.url;
        const isLoginRequest = requestUrl?.includes("/auth/login");
        const isOnLoginPage = window.location.pathname.startsWith("/login");

        if (!isLoginRequest && !isOnLoginPage) {
          localStorage.removeItem("hrms_token");
          localStorage.removeItem("hrms_user");
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      }

      let errorMessage = "";
      if (data?.message) {
        errorMessage = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (data?.errorMessage) {
        errorMessage = data.errorMessage;
      }

      if (!errorMessage) {
        switch (status) {
          case 400:
            errorMessage =
              "Invalid request. Please check your input and try again.";
            break;
          case 401:
            errorMessage = "Authentication required. Please log in again.";
            break;
          case 403:
            errorMessage = "You do not have permission to perform this action.";
            break;
          case 404:
            errorMessage = "The requested resource was not found.";
            break;
          case 409:
            errorMessage =
              "A conflict occurred. Please check your data and try again.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          case 502:
          case 503:
          case 504:
            errorMessage =
              "Service temporarily unavailable. Please try again later.";
            break;
          default:
            errorMessage = `HTTP error! status: ${status}`;
        }
      }

      // Dispatch downtime event for 500+ server errors
      if (status > 500) {
        window.dispatchEvent(
          new CustomEvent("api:server-error", { detail: { status } })
        );
      }

      const enhancedError: IApiError = Object.assign(new Error(errorMessage), {
        response: error.response,
        status,
        data,
      });
      throw enhancedError;
    }

    const networkError: IApiError = Object.assign(
      new Error(
        (error as Error).message ||
        "Network error. Please check your connection and try again."
      ),
      { isNetworkError: true }
    );
    throw networkError;
  }
);

class ApiService {
  private axiosInstance: AxiosInstance = apiAxios;

  // Authentication
  async login(username: string, password: string): Promise<ApiResponse<ICurrentUser>> {
    const result = await this.axiosInstance.post<ApiResponse<ICurrentUser>>("/auth/login", {
      username,
      password,
    });
    return result as unknown as ApiResponse<ICurrentUser>;
  }

  // Mark first login as complete
  async markFirstLoginComplete(): Promise<ApiResponse> {
    return await this.axiosInstance.post("/auth/mark-first-login-complete");
  }

  async register(userData: {
    username: string;
    name: string;
    email: string;
    password: string;
    department: string;
    role: "Admin" | "HR" | "Employee" | "Manager";
    isSuperAdmin?: boolean;
  }): Promise<ApiResponse> {
    return await this.axiosInstance.post("/auth/register", userData);
  }

  async getProfile(): Promise<ApiResponse> {
    return await this.axiosInstance.get("/auth/profile");
  }

  // Dashboard / Employees (v1 controller)
  async getEmployeesWithStatus(): Promise<unknown[]> {
    const response = await this.axiosInstance.get("/employees/with-status") as unknown as Record<string, unknown> | unknown[];
    return (Array.isArray(response) ? response : (response as Record<string, unknown>)?.data) as unknown[] ?? [];
  }

  async getManagerStatus(): Promise<{
    isFunctionalManager: boolean;
    isReportingManager: boolean;
  }> {
    const response = await this.axiosInstance.get("/employees/manager-status") as unknown as Record<string, unknown>;
    const data = (response?.data ?? response) as Record<string, unknown>;
    return {
      isFunctionalManager: Boolean(data?.isFunctionalManager),
      isReportingManager: Boolean(data?.isReportingManager),
    };
  }

  async getRecentJoiners(): Promise<unknown[]> {
    const response = await this.axiosInstance.get("/employees/recent-joiners") as unknown as Record<string, unknown> | unknown[];
    const data = Array.isArray(response) ? response : (response as Record<string, unknown>)?.data;
    return Array.isArray(data) ? data : ((data as Record<string, unknown>)?.data as unknown[]) ?? [];
  }

  async getUpcomingBirthdays(): Promise<unknown[]> {
    const response = await this.axiosInstance.get("/employees/birthdays") as unknown as Record<string, unknown> | unknown[];
    const data = Array.isArray(response) ? response : (response as Record<string, unknown>)?.data;
    return Array.isArray(data) ? data : ((data as Record<string, unknown>)?.data as unknown[]) ?? [];
  }

  async getUpcomingAnniversaries(): Promise<unknown[]> {
    const response = await this.axiosInstance.get("/employees/anniversaries") as unknown as Record<string, unknown> | unknown[];
    const data = Array.isArray(response) ? response : (response as Record<string, unknown>)?.data;
    return Array.isArray(data) ? data : ((data as Record<string, unknown>)?.data as unknown[]) ?? [];
  }

  // Leave Requests

  async getLeaveRequests(params?: {
    status?: string;
    userId?: string;
    department?: string;
    search?: string;
    fromDate?: string;
    toDate?: string;
    currentApproverId?: string;
    approverId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const query: Record<string, string | number | undefined> = { ...(params || {}) };
    if (query.approverId && !query.currentApproverId) {
      query.currentApproverId = query.approverId as string;
    }
    delete query.approverId;
    return await this.axiosInstance.get("/leave/requests", { params: query }) as unknown as ApiResponse;
  }


  async getUserLeaveRequests(
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse> {
    return await this.axiosInstance.get(`/leave/requests/user/${userId}`, {
      params,
    }) as unknown as ApiResponse;
  }

  async createLeaveRequest(leaveData: ILeaveRequestPayload): Promise<ApiResponse> {
    return await this.axiosInstance.post("/leave/requests", leaveData) as unknown as ApiResponse;
  }

  async updateLeaveRequest(id: string, leaveData: Partial<ILeaveRequestPayload>): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/leave/requests/${id}`, leaveData) as unknown as ApiResponse;
  }

  async approveLeaveRequest(
    id: string,
    _approvedBy?: string
  ): Promise<ApiResponse> {
    return this.decideLeaveRequest(id, WorkflowDecision.APPROVED);
  }

  async rejectLeaveRequest(
    id: string,
    _approvedBy: string,
    rejectionReason: string
  ): Promise<ApiResponse> {
    return this.decideLeaveRequest(
      id,
      WorkflowDecision.REJECTED,
      rejectionReason
    );
  }

  async pullbackLeaveRequest(
    id: string,
    cancelledBy: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/leave/requests/${id}/pullback`, {
      cancelledBy,
    }) as unknown as ApiResponse;
  }

  async decideLeaveRequest(
    id: string,
    action:
      | WorkflowDecision.APPROVED
      | WorkflowDecision.REJECTED
      | WorkflowDecision.CANCELLED,
    remarks?: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/leave/requests/${id}/decision`, {
      action,
      remarks,
    }) as unknown as ApiResponse;
  }

  async deleteLeaveRequest(id: string): Promise<ApiResponse> {
    return await this.axiosInstance.delete(`/leave/requests/${id}`) as unknown as ApiResponse;
  }

  // Comp Off
  async getCompOffRequests(params?: {
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<CompOffResponse> {
    return await this.axiosInstance.get("/comp-off", { params }) as unknown as CompOffResponse;
  }

  async getUserCompOffRequests(
    userId: string,
    params?: { page?: number; limit?: number; status?: string }
  ): Promise<CompOffResponse> {
    const query = { ...params, userId };
    return await this.axiosInstance.get("/comp-off", { params: query }) as unknown as CompOffResponse;
  }

  async createCompOffRequest(compOffData: ICompOffCreatePayload): Promise<CreateCompOffResponse> {
    return await this.axiosInstance.post("/comp-off", compOffData) as unknown as CreateCompOffResponse;
  }

  async createCompOff(
    compOffData: ICompOffCreatePayload,
    actorId: string
  ): Promise<CreateCompOffResponse> {
    return await this.axiosInstance.post("/comp-off", {
      ...compOffData,
      actorId: actorId,
    }) as unknown as CreateCompOffResponse;
  }

  async approveCompOffRequest(
    id: string,
    actorId: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/comp-off/${id}/approve`, {
      actorId: actorId,
    }) as unknown as ApiResponse;
  }

  async rejectCompOffRequest(
    id: string,
    actorId: string,
    rejectionReason: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/comp-off/${id}/reject`, {
      actorId: actorId,
      reason: rejectionReason,
    }) as unknown as ApiResponse;
  }

  async pullbackCompOffRequest(
    id: string,
    userId: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/comp-off/${id}/pull-back`, {
      userId,
    }) as unknown as ApiResponse;
  }

  // Leave Credits
  async getLeaveCredits(params?: {
    page?: number;
    limit?: number;
    search?: string;
    year?: string | number;
    month?: string | number;
    leaveType?: string;
  }): Promise<ApiResponse> {
    return await this.axiosInstance.get("/leave/credits", { params: params }) as unknown as ApiResponse;
  }

  async getUserLeaveCredits(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse> {
    return await this.axiosInstance.get(`/leave/credits/user/${userId}`, {
      params: params,
    }) as unknown as ApiResponse;
  }

  async createLeaveCredit(creditData: ILeaveCreditPayload): Promise<ApiResponse> {
    return await this.axiosInstance.post("/leave/credits", creditData) as unknown as ApiResponse;
  }

  async debitLeaveCredit(debitData: ILeaveCreditPayload): Promise<ApiResponse> {
    return await this.axiosInstance.post("/leave/debit", debitData) as unknown as ApiResponse;
  }

  async bulkDebitLeaveCredits(debitsData: ILeaveCreditPayload[]): Promise<ApiResponse> {
    return await this.axiosInstance.post("/leave/debit/bulk", {
      debits: debitsData,
    }) as unknown as ApiResponse;
  }

  async bulkCreateLeaveCredits(creditsData: ILeaveCreditPayload[]): Promise<ApiResponse> {
    return await this.axiosInstance.post("/leave/credits/bulk", {
      credits: creditsData,
    }) as unknown as ApiResponse;
  }

  async updateLeaveCredit(id: string, creditData: Partial<ILeaveCreditPayload>): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/leave/credits/${id}`, creditData) as unknown as ApiResponse;
  }

  async deleteLeaveCredit(id: string): Promise<ApiResponse> {
    return await this.axiosInstance.delete(`/leave/credits/${id}`) as unknown as ApiResponse;
  }

  async getAvailableLeaveBalance(
    userId: string,
    leaveType: string
  ): Promise<number> {
    try {
      const response = await this.axiosInstance.get(
        `/leave/balance/${userId}/${leaveType}`
      ) as unknown as Record<string, unknown>;

      const balance = (response?.balance ?? (response?.data as Record<string, unknown>)?.balance ?? 0) as number;
      return balance;
    } catch {
      return 0;
    }
  }

  async getAllLeaveBalances(
    userId: string
  ): Promise<Record<string, number>> {
    try {
      const response = await this.axiosInstance.get(
        `/leave/balances/${userId}`
      ) as unknown as Record<string, number>;
      return response || {};
    } catch {
      return {};
    }
  }

  async getAllEmployeeLeaveBalances(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ data: unknown[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    try {
      const response = await this.axiosInstance.get("/leave/balances/all", {
        params,
      }) as unknown as { data: unknown[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
      return response || {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    } catch {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  }


  async getLeaveBalancesExcel(params?: {
    search?: string;
    department?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<Blob | { data: never[]; message: string }> {
    try {
      const response = await this.axiosInstance.get("/leave/balances/export-excel", {
        params,
        responseType: 'blob',
      }) as AxiosResponse<Blob>;

      return response.data || (response as unknown as Blob);
    } catch {
      return {
        data: [],
        message: "Error in downloading file."
      };
    }
  }

  // Timesheets
  async getTimesheets(params?: URLSearchParams): Promise<ApiResponse> {
    const url = params ? `/timesheet?${params.toString()}` : "/timesheet";
    return await this.axiosInstance.get(url);
  }

  async getMyTimesheets(params?: URLSearchParams): Promise<ApiResponse> {
    const url = params ? `/timesheet/my?${params.toString()}` : "/timesheet/my";
    return await this.axiosInstance.get(url);
  }

  async getPendingTimesheets(): Promise<ApiResponse> {
    return await this.axiosInstance.get("/timesheet/pending");
  }

  async getUserTimesheets(userId: string): Promise<ApiResponse> {
    return await this.axiosInstance.get(`/timesheet/user/${userId}`);
  }

  async createTimesheet<T>(timesheetData: T): Promise<ApiResponse> {
    return await this.axiosInstance.post("/timesheet", timesheetData);
  }

  async updateTimesheet<T>(id: string, timesheetData: T): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/timesheet/${id}`, timesheetData);
  }

  async deleteTimesheet(id: string): Promise<ApiResponse> {
    return await this.axiosInstance.delete(`/timesheet/${id}`);
  }

  async decideTimesheet(
    id: string,
    action: WorkflowDecision.APPROVED | WorkflowDecision.REJECTED,
    remarks?: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.patch(`/timesheet/${id}/decision`, {
      action,
      remarks,
    });
  }

  async getTimesheetStats(): Promise<ApiResponse> {
    return await this.axiosInstance.get("/timesheet/stats");
  }


  // Logout
  logout(): void {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("hrms_token");
  }

  // Get current user
  getCurrentUser(): ICurrentUser | null {
    const userStr = localStorage.getItem("hrms_user");
    return userStr ? (JSON.parse(userStr) as ICurrentUser) : null;
  }

  // Password management
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    return await this.axiosInstance.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }

  async resetPassword(newPassword: string): Promise<ApiResponse> {
    return await this.axiosInstance.post("/auth/reset-password", {
      newPassword,
    });
  }

  // Holiday Management
  async getHolidays(params: {
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IHoliday[]>> {
    return await this.axiosInstance.get("/holidays", { params });
  }

  async createHoliday(holidayData: Omit<IHoliday, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<IHoliday>> {
    return await this.axiosInstance.post("/holidays", holidayData);
  }

  async updateHoliday(id: string, holidayData: Partial<IHoliday>): Promise<ApiResponse<IHoliday>> {
    return await this.axiosInstance.patch(`/holidays/${id}`, holidayData);
  }

  async deleteHoliday(id: string): Promise<ApiResponse> {
    return await this.axiosInstance.delete(`/holidays/${id}`);
  }

  async bulkUploadHolidays(
    formData: FormData
  ): Promise<IBulkHolidayUploadResult> {
    // Hits the V2 endpoint which enforces per-organization scoping based on the
    // caller's JWT and forbids super-admin (cross-org) uploads. The response is
    // a bare stats object (no top-level `success` key) so the axios response
    // interceptor passes it through untouched.
    return (await this.axiosInstance.post(
      "/v2/holiday/bulk-upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )) as unknown as IBulkHolidayUploadResult;
  }

  async getCurrentYearHolidays(): Promise<IHoliday[]> {
    return await this.axiosInstance.get(`/holidays/current-year`);
  }

  // Attendance Management
  async checkIn(location?: {
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse> {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const payload = {
      date: today,
      checkInTime: now.toISOString(),
      checkInLocation: location || {
        latitude: 18.5824222,
        longitude: 73.7260936,
      },
    };

    const response = await this.axiosInstance.post(
      "/attendance/check-in",
      payload
    );

    // Trigger attendance update event
    const user = this.getCurrentUser();
    if (user?.id) {
      // Import the event service dynamically to avoid circular dependencies
      import("./attendanceEvents").then(({ attendanceEventService }) => {
        attendanceEventService.onAttendanceUpdate(user.id);
      });
    }

    return response as unknown as ApiResponse;
  }

  async checkOut(): Promise<ApiResponse> {
  const now = new Date();

  const payload = {
    checkOutTime: now.toISOString(),
    checkOutLocation: {
      latitude: 18.5824222,
      longitude: 73.7260936,
    },
  };

  const response = await this.axiosInstance.post(
    "/attendance/check-out",
    payload
  );

  // Trigger attendance update event
  const user = this.getCurrentUser();
  if(user?.id) {
    // Import the event service dynamically to avoid circular dependencies
    import("./attendanceEvents").then(({ attendanceEventService }) => {
      attendanceEventService.onAttendanceUpdate(user.id);
    });
  }

    return response as unknown as ApiResponse;
  }

  async startBreak(breakType: string = "lunch"): Promise < ApiResponse > {
  const now = new Date();

  const payload = {
    type: breakType,
    startTime: now.toISOString(),
  };

  const response = await this.axiosInstance.post(
    "/attendance/break/start",
    payload
  );

  // Trigger attendance update event
  const user = this.getCurrentUser();
  if(user?.id) {
    // Import the event service dynamically to avoid circular dependencies
    import("./attendanceEvents").then(({ attendanceEventService }) => {
      attendanceEventService.onAttendanceUpdate(user.id);
    });
  }

    return response as unknown as ApiResponse;
}

  async endBreak(): Promise < ApiResponse > {
  const now = new Date();

  const payload = {
    endTime: now.toISOString(),
  };

  const response = await this.axiosInstance.post(
    "/attendance/break/end",
    payload
  );

  // Trigger attendance update event
  const user = this.getCurrentUser();
  if(user?.id) {
    // Import the event service dynamically to avoid circular dependencies
    import("./attendanceEvents").then(({ attendanceEventService }) => {
      attendanceEventService.onAttendanceUpdate(user.id);
    });
  }

    return response as unknown as ApiResponse;
}
  async fetchSurveys(status: string): Promise < ApiResponse > {
  return await this.axiosInstance.get(`/survey/byStatus/${status}`);
}

  async fetchMySurveys(userId: string): Promise < ApiResponse > {
  return await this.axiosInstance.get(`/survey/my/${userId}`);
}

  async fetchSurveyFromId(surveyId: string): Promise < ApiResponse > {
  return await this.axiosInstance.get(`/survey/byId/${surveyId}`);
}

  // submit survey - response
  async submitSurveyWithUser(payload: {
  responses: { questionId: string; type: string; answer: string | string[] | number | null }[];
}): Promise < ApiResponse > {
  return await this.axiosInstance.post(`/survey-response`, payload);
}

  async fetchSurveyResponsesFilter(surveyId ?: string, userId ?: string): Promise < unknown > {
  try {
    const params: Record<string, string> = { };

if (surveyId) params.surveyId = surveyId;
if (userId) params.userId = userId;

const response = await this.axiosInstance.get(
  `/survey-response/response`,
  { params }
) as Record<string, unknown>;
return response.data;
    } catch (error: unknown) {
  const e = error as { response?: { data: unknown } };
  throw e.response?.data || { message: "Failed to fetch responses" };
}
  }

  async submitSurveyWithoutUser(surveyId: string): Promise < ApiResponse > {
  return await this.axiosInstance.post(`/survey-response/${surveyId}`);
}

  async fetchCompletedSurveys(userId: string): Promise < ApiResponse > {
  return await this.axiosInstance.get(`/survey-response/user/${userId}`);
}

  async fetchSurveyResponses(surveyId: string, userId: string): Promise < ApiResponse > {
  return await this.axiosInstance.get(
    `/survey-response/${surveyId}/user/${userId}`
  );
}

  async getAllUsers(): Promise < ApiResponse > {
  return await this.axiosInstance.get("/auth/debug/users");
}

  /**
   * Creates a NEW survey.
   * @param surveyPayload The survey data.
   */
  async saveSurvey(surveyPayload: Partial<IPublishSurveyPayload>): Promise < ApiResponse > {
  return this.axiosInstance.post("/survey", surveyPayload);
}

  async fetchDrafts(status: string): Promise < ApiResponse[] > {
  return this.axiosInstance.get(`/survey/byStatus/${status}`);
}

  async createSurveyTemplate(templatePayload: Omit<ISurveyTemplate, "_id" | "createdAt" | "updatedAt" | "createdBy">): Promise < ApiResponse < ISurveyTemplate >> {
  return this.axiosInstance.post("/survey-template", templatePayload);
}

  async fetchTemplates(): Promise < ISurveyTemplate[] > {
  return this.axiosInstance.get("/survey-template");
}

  async getSurveysWithPagination(params ?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise < ApiResponse > {
  const queryParams = new URLSearchParams();
  if(params?.page) queryParams.append("page", params.page.toString());
  if(params?.limit) queryParams.append("limit", params.limit.toString());
  if(params?.search) queryParams.append("search", params.search);
  if(params?.status) queryParams.append("status", params.status);
  if(params?.fromDate) queryParams.append("fromDate", params.fromDate);
  if(params?.toDate) queryParams.append("toDate", params.toDate);
  if(params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if(params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const url = queryParams.toString()
    ? `/survey/management?${queryParams.toString()}`
    : "/survey/management";
  return await this.axiosInstance.get(url);
}

  async getSurveyStats(): Promise < ApiResponse > {
  return await this.axiosInstance.get("/survey/stats");
}

  async toggleSurveyActive(id: string): Promise < ApiResponse > {
  return await this.axiosInstance.patch(`/survey/${id}/toggle-active`);
}

  async deleteSurvey(id: string): Promise < ApiResponse > {
  return await this.axiosInstance.delete(`/survey/${id}`);
}

  // Filter Management
  async getAllCategoryCodes(): Promise < string[] > {
  return await this.axiosInstance.get("/filters/category-codes");
}

  async getAllFiltersGroupedByCategory(): Promise < Record < string, unknown >> {
  return await this.axiosInstance.get("/filters/grouped-by-category");
}

  async getAllFiltersWithPagination(
  skip ?: number,
  limit ?: number
): Promise < ApiResponse > {
  const params = new URLSearchParams();
  if(skip !== undefined) params.append("skip", skip.toString());
if (limit !== undefined) params.append("limit", limit.toString());

const url = `/filters/all${params.toString() ? "?" + params.toString() : ""
  }`;
return await this.axiosInstance.get(url);
  }

  async getActiveFilterCodes(categoryCode: string): Promise < string[] > {
  return await this.axiosInstance.get(`/filters/active/${categoryCode}`);
}

  async getActiveFilterOptions(
  categoryCode: string
): Promise < Array < { code: string; label: string } >> {
  return await this.axiosInstance.get(`/filters/options/${categoryCode}`);
}

  async createFilter(filterData: IFilterData): Promise < ApiResponse > {
  return await this.axiosInstance.post("/filters", filterData);
}

  async updateFilter(id: string, filterData: Partial<IFilterData>): Promise < ApiResponse > {
  return await this.axiosInstance.patch(`/filters/${id}`, filterData);
}

  async deleteFilter(id: string): Promise < ApiResponse > {
  return await this.axiosInstance.delete(`/filters/${id}`);
}

  /** v2 master config by category (returns list or paginated list) */
  async getMasterConfigByCategory(categoryCode: string): Promise < unknown > {
  return await this.axiosInstance.get(`/v2/master-config/by-category/${categoryCode}`);
}

  /** Alias for getMasterConfigByCategory – filters/options by category (same v2 endpoint) */
  async getFiltersByCategoryCode(categoryCode: string): Promise < unknown > {
  return this.getMasterConfigByCategory(categoryCode);
}

  // Resource Management APIs

  async getProjects(params ?: Record<string, string | number | boolean | undefined>): Promise < { data: ProjectInfo[]; pagination: { page: number; limit: number; total: number; totalPages: number } } > {
  return await this.axiosInstance.get("/resource-management/project", {
    params,
  });
}

  async getProjectById(id: string): Promise < ProjectInfo > {
  return await this.axiosInstance.get(`/resource-management/project/${id}`);
}

  async createProject(projectData: IProjectFormData): Promise < ProjectInfo > {
  return await this.axiosInstance.post(
    "/resource-management/project",
    projectData
  );
}

  async updateProject(id: string, projectData: Partial<IProjectFormData>): Promise < ProjectInfo > {
  return await this.axiosInstance.patch(
    `/resource-management/project/${id}`,
    projectData
  );
}

  async deleteProject(id: string) {
  return await this.axiosInstance.delete(
    `/resource-management/project/${id}`
  );
}

// Resource Allocation APIs
upsertAllocation(data: ResourceAllocationPayload): Promise < ApiResponse > {
  return this.axiosInstance.post("/resource-management/allocation", data);
}

deleteAllocation(id: string) {
  return this.axiosInstance.delete(`/resource-management/allocation/${id}`);
}

  // ===============================
  // RESOURCE ALLOCATIONS LIST
  // ===============================
  async getResourceAllocations(params ?: {
  userIds?: string[];
  designation?: string;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  isAllocated?: boolean;
}): Promise < { data: ResourceAllocationItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } } > {
  return this.axiosInstance.get("/resource-management/allocation", {
    params,
  });
}


  // RESOURCE STATS

  async getResourceStats(): Promise < ResourceStats > {
  return this.axiosInstance.get("/resource-management/allocation/stats");


}


  async getProjectStats(): Promise < ProjectStats > {
  return this.axiosInstance.get("/resource-management/project/stats");
}



  // RESOURCE DETAILS BY USER ID

  async getResourceDetails(userId: string): Promise < ResourceDetailsData > {
  return this.axiosInstance.get(`/resource-management/allocation/${userId}`);
}



  //Resource - Options

  async getAllResourceOptions(search ?: string): Promise < Array < { label: string; value: string } >> {
  return this.axiosInstance.get("/resource-management/allocation/resources", {
    params: { search },
  });
}

  async getProjectAnalytics(): Promise < ProjectAnalyticsResponse > {
  return this.axiosInstance.get(
    "/resource-management/project-analytics"
  );
}

  // RESOURCE REPORT DOWNLOAD

  async downloadResourceReport(filters: ResourceReportFilters): Promise < AxiosResponse < Blob >> {
  const params = new URLSearchParams();

  if(filters.startDate) params.append("startDate", filters.startDate);
  if(filters.endDate) params.append("endDate", filters.endDate);
  if(filters.search) params.append("search", filters.search);
  if(filters.role) params.append("role", filters.role);
  if(filters.userIds && filters.userIds.length > 0) {
  params.append("userIds", filters.userIds.join(","));
}

const url = `/resource-management/allocation/report/download?${params.toString()}`;

return this.axiosInstance.get(url, {
  responseType: "blob",
}) as Promise<AxiosResponse<Blob>>;
  }


  // PROJECT REPORT DOWNLOAD

  async downloadProjectReport(filters: ProjectReportFilters): Promise < AxiosResponse < Blob >> {
  const params = new URLSearchParams();

  if(filters.startDate) params.append("startDate", filters.startDate);
  if(filters.endDate) params.append("endDate", filters.endDate);
  if(filters.search) params.append("search", filters.search);
  if(filters.domain) params.append("domain", filters.domain);
  if(filters.category) params.append("category", filters.category);
  if(filters.status) params.append("status", filters.status);
  if(filters.role) params.append("role", filters.role);

  const url = `/resource-management/project/report/download?${params.toString()}`;

  return this.axiosInstance.get(url, {
    responseType: "blob",
  }) as Promise<AxiosResponse<Blob>>;
}




  // Documents - File Download API's
  async getDownloadOptions(): Promise < Record < string, string > [] > {
  return await this.axiosInstance.get("/file/download-options");
}

  async downloadDocument(fileName: string): Promise < AxiosResponse < Blob >> {
  return this.axiosInstance.post(
    "/file/download",
    { fileName },
    {
      responseType: "blob",
    }
  ) as Promise<AxiosResponse<Blob>>;
}
}

export const apiService = new ApiService();
