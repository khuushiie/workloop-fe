import {
  CreateTimesheetDto,
  TimesheetEntry,
  TimesheetFilters,
  TimesheetStats,
  UpdateTimesheetDto,
} from "../types/timesheet";
import { WorkflowDecision } from "../utils/workflow.enum";
import { apiService } from "./api";

class TimesheetApiService {
  // Get timesheet statistics
  async getStats(): Promise<TimesheetStats> {
    try {
      const response = (await apiService.getTimesheetStats()) as Partial<TimesheetStats>;
      const stats: TimesheetStats =
        response && typeof response === "object" && "totalHours" in response
          ? (response as TimesheetStats)
          : {
            totalHours: 0,
            approvedHours: 0,
            thisMonthHours: 0,
            totalEntries: 0,
          };
      return stats;
    } catch (error) {
      return {
        totalHours: 0,
        approvedHours: 0,
        thisMonthHours: 0,
        totalEntries: 0,
      };
    }
  }

  // Get all timesheet entries with filters
  async getTimesheets(filters?: TimesheetFilters): Promise<{ data: TimesheetEntry[]; total?: number; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.userId) params.append("userId", filters.userId);
      if (filters?.currentApproverId)
        params.append("currentApproverId", filters.currentApproverId);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);
      if ((filters as any)?.department)
        params.append("department", (filters as any).department);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));
      if ((filters as any)?.reporteesOnly)
        params.append("reporteesOnly", "true");

      const response = (await apiService.getTimesheets(params)) as any;
      // When paginated, interceptor returns { data, pagination }
      if (response && response.data && response.pagination) {
        return {
          data: this.transformTimesheets(response.data),
          pagination: response.pagination,
          total: response.pagination.total,
        };
      }
      const timesheets = Array.isArray(response) ? response : [];
      return {
        data: this.transformTimesheets(timesheets),
        total: timesheets.length,
      };
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      return { data: [], total: 0, pagination: null };
    }
  }

  // Get timesheet by ID
  async getTimesheetById(id: string): Promise<TimesheetEntry> {
    const response = (await apiService.getTimesheets()) as any;
    const timesheet = (Array.isArray(response) ? response : [])?.find(
      (t: any) => t._id === id
    );
    if (!timesheet) {
      throw new Error("Timesheet not found");
    }
    return this.transformTimesheet(timesheet);
  }

  // Create new timesheet entry
  async createTimesheet(data: CreateTimesheetDto): Promise<TimesheetEntry> {
    const response = await apiService.createTimesheet(data);
    const timesheetData = response;
    return this.transformTimesheet(timesheetData);
  }

  // Update timesheet entry
  async updateTimesheet(
    id: string,
    data: UpdateTimesheetDto
  ): Promise<TimesheetEntry> {
    const response = await apiService.updateTimesheet(id, data);
    return this.transformTimesheet(response);
  }

  // Delete timesheet entry
  async deleteTimesheet(id: string): Promise<void> {
    await apiService.deleteTimesheet(id);
  }

  // Approve timesheet entry (admin only)
  async approveTimesheet(id: string): Promise<TimesheetEntry> {
    const response = await apiService.decideTimesheet(
      id,
      WorkflowDecision.APPROVED
    );
    return this.transformTimesheet(response);
  }

  // Reject timesheet entry (admin only)
  async rejectTimesheet(
    id: string,
    rejectedReason?: string
  ): Promise<TimesheetEntry> {
    const response = await apiService.decideTimesheet(
      id,
      WorkflowDecision.REJECTED,
      rejectedReason
    );
    return this.transformTimesheet(response);
  }

  // Decide on timesheet using workflow (for managers and admins)
  async decideTimesheet(
    id: string,
    action: WorkflowDecision.APPROVED | WorkflowDecision.REJECTED,
    remarks?: string
  ): Promise<TimesheetEntry> {
    const response = await apiService.decideTimesheet(id, action, remarks);
    return this.transformTimesheet(response);
  }

  // Get user's own timesheets
  async getMyTimesheets(filters?: TimesheetFilters): Promise<{ data: TimesheetEntry[]; total?: number; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.fromDate) params.append("fromDate", filters.fromDate);
      if (filters?.toDate) params.append("toDate", filters.toDate);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));

      const response = (await apiService.getMyTimesheets(params)) as any;
      // When paginated, interceptor returns { data, pagination }
      if (response && response.data && response.pagination) {
        return {
          data: this.transformTimesheets(response.data),
          pagination: response.pagination,
          total: response.pagination.total,
        };
      }
      const timesheets = Array.isArray(response.data) ? response.data : Array.isArray(response) ? response : [];
      return {
        data: this.transformTimesheets(timesheets),
        total: timesheets.length,
      };
    } catch (error) {
      console.error('Error fetching my timesheets:', error);
      return { data: [], total: 0, pagination: null };
    }
  }

  // Get pending timesheets for approval (admin only)
  async getPendingTimesheets(): Promise<TimesheetEntry[]> {
    const response = (await apiService.getPendingTimesheets()) as any;
    const timesheets = Array.isArray(response) ? response : [];
    return this.transformTimesheets(timesheets);
  }

  private transformTimesheet(backendTimesheet: any): TimesheetEntry {
    return {
      id: backendTimesheet._id,
      date: backendTimesheet.date,
      userId: backendTimesheet.userId?._id || backendTimesheet.userId || "",
      userName:
        backendTimesheet.userId?.firstName
          ? `${backendTimesheet.userId.firstName} ${backendTimesheet.userId.lastName || ''}`
          : "Unknown User",
      userEmail: backendTimesheet.userId?.workEmail || "",
      tasks: backendTimesheet.tasks.map((task: any, index: number) => ({
        id: task._id || `${backendTimesheet._id}-${index}`,
        name: task.name,
        startTime: task.startTime,
        endTime: task.endTime,
        hours: task.hours,
        breakMinutes: task.breakMinutes,
        description: task.description || "",
        project: task.project || backendTimesheet.project,
      })),
      project: backendTimesheet.project,
      totalHours: backendTimesheet.totalHours,
      status: backendTimesheet.status,
      statusLabel: backendTimesheet.statusLabel,
      currentApproverId: backendTimesheet.currentApproverId,
      currentApproverName: backendTimesheet.currentApproverName,
      createdAt: backendTimesheet.createdAt,
      updatedAt: backendTimesheet.updatedAt,
    };
  }

  // Transform array of backend timesheets
  private transformTimesheets(backendTimesheets: any[]): TimesheetEntry[] {
    return backendTimesheets.map((timesheet) =>
      this.transformTimesheet(timesheet)
    );
  }
}

export default new TimesheetApiService();
