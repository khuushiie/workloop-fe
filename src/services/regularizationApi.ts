import { apiAxios, apiService } from "./api";
import {
  IAttendanceRegularization,
  ICreateRegularizationRequest,
  IRegularizationFilters,
} from "../types/regularization.types";
import {
  LeaveBalanceReport,
  LeaveBalanceReportFilters,
} from "../types/leave-balance.types";
import { WorkflowDecision } from "../utils/workflow.enum";
// Regularization API
export const regularizationApi = {
  // Create a new regularization request
  createRegularizationRequest: async (
    data: ICreateRegularizationRequest
  ): Promise<IAttendanceRegularization> => {
    const response = await apiAxios.post(
      `/attendance/regularization`,
      data
    );
    return response as unknown as IAttendanceRegularization;
  },

  // Get all regularization requests (admin only)
  getAllRegularizationRequests: async (
    filters?: IRegularizationFilters,
    page?: number,
    limit?: number
  ): Promise<IAttendanceRegularization[] | { data: IAttendanceRegularization[]; total: number; page: number; limit: number; totalPages: number }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
    }
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const response = await apiAxios.get(
      `/attendance/regularization?${params.toString()}`
    );
    return response as unknown as IAttendanceRegularization[] | { data: IAttendanceRegularization[]; total: number; page: number; limit: number; totalPages: number };
  },

  // Get my regularization requests
  getMyRegularizationRequests: async (): Promise<
    IAttendanceRegularization[]
  > => {
    const response = await apiAxios.get(
      `/attendance/regularization/my-requests`
    );
    return response as unknown as IAttendanceRegularization[];
  },

  // Get user regularization requests with pagination
  getUserRegularizationRequests: async (options?: {
    page?: number;
    limit?: number;
  }): Promise<{ data: IAttendanceRegularization[]; total?: number }> => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const response = await apiAxios.get(
      `/attendance/regularization/my-requests?${params.toString()}`
    );

    // Interceptor unwraps envelope; support both array and paginated object
    if (Array.isArray(response)) {
      return { data: response as IAttendanceRegularization[] };
    }
    return response as unknown as { data: IAttendanceRegularization[]; total?: number };
  },

  // Get regularization request by ID
  getRegularizationById: async (
    id: string
  ): Promise<IAttendanceRegularization> => {
    const response = await apiAxios.get(
      `/attendance/regularization/${id}`
    );
    return response as unknown as IAttendanceRegularization;
  },

  // Approve regularization request (admin only)
  approveRegularization: async (
    id: string,
    approvedBy?: string
  ): Promise<IAttendanceRegularization> => {
    const currentUser = apiService.getCurrentUser?.() || null;
    const approver = approvedBy || currentUser?.id || currentUser?._id || undefined;
    const response = await apiAxios.patch(
      `/attendance/regularization/${id}/approve`,
      approver ? { approvedBy: approver } : {}
    );
    return response as unknown as IAttendanceRegularization;
  },

  // Reject regularization request (admin only)
  rejectRegularization: async (
    id: string,
    approvedByOrReason: string,
    maybeReason?: string
  ): Promise<IAttendanceRegularization> => {
    // Support calling with (id, approvedBy, reason) or (id, reason) and auto-fill approvedBy
    let approvedBy: string | undefined;
    let rejectionReason: string;
    if (maybeReason !== undefined) {
      approvedBy = approvedByOrReason;
      rejectionReason = maybeReason;
    } else {
      const currentUser = apiService.getCurrentUser?.() || null;
      approvedBy = currentUser?.id || currentUser?._id || undefined;
      rejectionReason = approvedByOrReason;
    }
    const payload: { rejectionReason: string; approvedBy?: string } = { rejectionReason };
    if (approvedBy) payload.approvedBy = approvedBy;
    const response = await apiAxios.patch(
      `/attendance/regularization/${id}/reject`,
      payload
    );
    return response as unknown as IAttendanceRegularization;
  },

  // Decide on regularization request via workflow engine
  decideRegularization: async (
    id: string | string[],
    action: WorkflowDecision.APPROVED | WorkflowDecision.REJECTED | WorkflowDecision.CANCELLED,
    remarks?: string
  ): Promise<IAttendanceRegularization> => {
    const payload: Record<string, unknown> = {
      action,
      ids: Array.isArray(id) ? id : [id],
    };

    if (remarks) {
      payload.remarks = remarks;
    }

    const response = await apiAxios.patch(
      `/attendance/regularization/decision`,
      payload
    );
    return response as unknown as IAttendanceRegularization;
  },

  // Pullback regularization request (user/admin)
  pullbackRegularization: async (
    id: string,
    cancelledBy?: string
  ): Promise<IAttendanceRegularization> => {
    const payload = cancelledBy ? { cancelledBy } : {};
    const response = await apiAxios.patch(
      `/attendance/regularization/${id}/pullback`,
      payload
    );
    return response as unknown as IAttendanceRegularization;
  },

  // Delete regularization request
  deleteRegularization: async (id: string): Promise<void> => {
    await apiAxios.delete(`/attendance/regularization/${id}`);
  },

  // Get regularization stats (admin only)
  getRegularizationStats: async (filters?: IRegularizationFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiAxios.get(
      `/attendance/regularization/stats?${params.toString()}`
    );
    return response;
  },
};

// Reports API
export const reportsApi = {
  // Get regularization report (admin only) - v1 (DEPRECATED - Use RTK Query useGetRegularizationReportQuery instead)
  getRegularizationReport: async (filters?: IRegularizationFilters, page?: number, limit?: number) => {
      const params = new URLSearchParams();
      
      // Append Pagination Params
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());
    
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "") {
            params.append(key, value.toString());
          }
        });
      }
    
      const response = await apiAxios.get(
        `/reports/regularization?${params.toString()}`
      );
      return response;
  },

  // Get leave balance report (admin only)
  getLeaveBalanceReport: async (
    filters?: LeaveBalanceReportFilters
  ): Promise<LeaveBalanceReport> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiAxios.get(
      `/reports/leave-balance?${params.toString()}`
    );
    return response as unknown as LeaveBalanceReport;
  },

  // Get department-wise balance summary (admin only)
  getDepartmentWiseBalanceSummary: async (year?: number) => {
    const params = year ? `?year=${year}` : "";
    const response = await apiAxios.get(
      `/reports/leave-balance/department-summary${params}`
    );
    return response;
  },

  // Get leave utilization trends (admin only)
  getLeaveUtilizationTrends: async (year?: number) => {
    const params = year ? `?year=${year}` : "";
    const response = await apiAxios.get(
      `/reports/leave-balance/utilization-trends${params}`
    );
    return response;
  },
};
