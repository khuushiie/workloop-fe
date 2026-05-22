

/**
 * Task used in UI tables
 */
export interface TimesheetTask {
  id?: string; // optional because backend may not send id
  name: string;
  startTime: string;
  endTime: string;
  hours: number;

  breakMinutes?: number;
  description?: string;
  project?: string;
}

/**
 * UI Timesheet row model
 * Enriched with extra display fields
 */
export interface TimesheetEntry {
  id: string;

  date: string;

  userId: string;
  fullName?: string;
  workEmail?: string;
  userName?: string;
  tasks: TimesheetTask[];
  userEmail?: string;
  totalHours: number;
  project?: string;
  status: string;
  statusLabel?: string;

  currentActorIds?: string[];
  currentApproverName?: string;
  currentActorName?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Stats used in dashboard cards
 */
export interface TimesheetStats {
  totalHours: number;
  approvedHours: number;
  thisMonthHours: number;
  totalEntries: number;
}

/**
 * Filters used only in UI forms
 */
export interface TimesheetFilters {
  status?: string;
  userId?: string;
  currentApproverId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  department?: string;
}

/**
 * Form DTOs (UI forms only)
 */
export interface CreateTimesheetDto {
  date: string;
  tasks: Omit<TimesheetTask, "id">[];
  totalHours: number;
}

export interface UpdateTimesheetDto {
  date?: string;
  tasks?: Omit<TimesheetTask, "id">[];
}
