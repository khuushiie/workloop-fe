

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
  error?: string;
}

/* ========================================
   Task 
======================================== */
export interface ITimesheetTask {
  name: string;
  startTime: string;
  endTime: string;
  hours: number;
  description?: string;
  project?: string;
}

/* ========================================
   Timesheet
======================================== */
export interface ITimesheet {
  id: string;
  userId: string;
  date: string;
  tasks: ITimesheetTask[];
  totalHours: number;

  status: string;
  statusLabel: string;

  createdAt: string;
  updatedAt: string;

  approvedById?: string;
  approvedAt?: string;
}

/* ========================================
   List Payload 
======================================== */
export interface ITimesheetListPayload {
  data: ITimesheet[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ========================================
   Stats
======================================== */
export interface ITimesheetStatsPayload {
  totalHours: number;
  approvedHours: number;
  thisMonthHours: number;
  totalEntries: number;
  pending: number;
  change: string;
}

/* ========================================
   Query Params
======================================== */
export enum TimesheetQueryStatus {
  DRAFT = "draft",
  PENDING = "pending",
  HISTORY = "history",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface ITimesheetQueryParams {
  page?: number;
  limit?: number;

  sortBy?: string;
  sortOrder?: "asc" | "desc";

  search?: string;

  userId?: string;
    department?: string;
  startDate?: string;
  endDate?: string;

  /** Semantic workflow/timesheet status category */
  status?: TimesheetQueryStatus;

  // statuses?: string;

  actorId?: string;

  reporteesOnly?: boolean;
}

/* ========================================
   DTOs
======================================== */
export interface ICreateTimesheetBody {
  date: string;
  tasks: ITimesheetTask[];
  totalHours: number;
}

export interface IUpdateTimesheetBody {
  date?: string;
  tasks?: ITimesheetTask[];
}

export interface IActOnTimesheetBody {
  decision: "approved" | "rejected";
  remarks?: string;
}
