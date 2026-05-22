/** Page size options for paginated tables/reports (e.g. leave balance report) */
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

export const LEAVE_TYPES = [
  { value: "earned", label: "Earned Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "lwp", label: "Leave Without Pay" },
  { value: "flexi_weekend", label: "Flexi Weekend Leave" },
];

export type WorkflowStatusCode =
  | "pending_l1"
  | "pending_l2"
  | "pending_admin"
  | "approved"
  | "approved_admin"
  | "rejected"
  | "rejected_l1"
  | "rejected_l2"
  | "rejected_admin"
  | "cancelled"
  | "pulled-back"
  | "pending"
  | "submitted";

export const WORKFLOW_PENDING_STATUSES: WorkflowStatusCode[] = [
  "pending_l1",
  "pending_l2",
  "pending_admin",
  "pending",
  "submitted",
];
export const WORKFLOW_APPROVED_STATUSES: WorkflowStatusCode[] = [
  "approved",
  "approved_admin",
];
export const WORKFLOW_REJECTED_STATUSES: WorkflowStatusCode[] = [
  "rejected",
  "rejected_l1",
  "rejected_l2",
  "rejected_admin",
];
export const WORKFLOW_CANCELLED_STATUSES: WorkflowStatusCode[] = [
  "cancelled",
  "pulled-back",
];

/** Semantic workflow status categories for API filtering (accordion grouping) */
export enum WorkflowQueryStatus {
  PENDING = "pending",
  HISTORY = "history",
}

/** Leave Approval "Pending" accordion - pass to API */
export const LEAVE_APPROVAL_STATUS_PENDING = WorkflowQueryStatus.PENDING;

/** Leave Approval "History" accordion - pass to API */
export const LEAVE_APPROVAL_STATUS_HISTORY = WorkflowQueryStatus.HISTORY;

export const LEAVE_STATUS_COLORS = {
  pending_l1: "bg-yellow-100 text-yellow-800",
  pending_l2: "bg-yellow-100 text-yellow-800",
  pending_admin: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  approved_admin: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  rejected_l1: "bg-red-100 text-red-800",
  rejected_l2: "bg-red-100 text-red-800",
  rejected_admin: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-800",
  "pulled-back": "bg-slate-200 text-slate-800",
  pending: "bg-yellow-100 text-yellow-800",
  submitted: "bg-yellow-100 text-yellow-800",
};







export type CompOffStatusCode = 
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";
  
export const COMP_OFF_PENDING_STATUSES: CompOffStatusCode = "pending";
export const COMP_OFF_APPROVED_STATUSES: CompOffStatusCode = "approved";
export const COMP_OFF_REJECTED_STATUSES: CompOffStatusCode = "rejected";
export const COMP_OFF_CANCELLED_STATUSES: CompOffStatusCode = "cancelled";  

export const COMP_OFF_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-800",
};

export const getCompOffStatusColor = (status: string | undefined): string =>
  (status && COMP_OFF_STATUS_COLORS[status as CompOffStatusCode]) ||
  "bg-slate-100 text-slate-800";

export const isPendingCompOffStatus = (status: string | undefined): boolean =>
  !!status && COMP_OFF_PENDING_STATUSES.includes(status as CompOffStatusCode);

/** Pattern-based: supports dynamic pending_seq_* and legacy pending_l1, pending_l2, etc. */
export const isPendingWorkflowStatus = (status: string | undefined): boolean =>
  !!status && status.startsWith("pending");

/** Pattern-based: supports approved, approved_admin, etc. */
export const isApprovedWorkflowStatus = (status: string | undefined): boolean =>
  !!status && status.toLowerCase().startsWith("approved");

/** Pattern-based: supports rejected, rejected_l1, rejected_l2, etc. */
export const isRejectedWorkflowStatus = (status: string | undefined): boolean =>
  !!status && status.toLowerCase().startsWith("rejected");

/** Pattern-based: supports cancelled, pulled-back */
export const isCancelledWorkflowStatus = (
  status: string | undefined
): boolean =>
  !!status &&
  (status.toLowerCase() === "cancelled" ||
    status.toLowerCase() === "pulled-back");

/** Pattern-based: supports dynamic pending_seq_* and legacy statuses */
export const getWorkflowStatusColor = (status: string | undefined): string => {
  if (!status) return "bg-gray-100 text-gray-800";
  const exact = LEAVE_STATUS_COLORS[status as WorkflowStatusCode];
  if (exact) return exact;
  if (status.startsWith("pending")) return "bg-yellow-100 text-yellow-800";
  if (status.startsWith("approved")) return "bg-green-100 text-green-800";
  if (status.startsWith("rejected")) return "bg-red-100 text-red-800";
  if (status === "cancelled" || status === "pulled-back")
    return "bg-gray-200 text-gray-800";
  return "bg-gray-100 text-gray-800";
};

export const getWorkflowStatusFallbackLabel = (
  status: string | undefined,
  approverName?: string
): string => {
  if (!status) {
    return "Unknown";
  }
  // Dynamic workflow: pending_seq_1, pending_seq_2, etc.
  if (status.startsWith("pending_seq_")) {
    const seq = status.split("_").pop();
    return approverName
      ? `Pending with ${approverName}`
      : `Pending (Step ${seq ?? ""})`;
  }
  switch (status) {
    case "pending_l1":
      return approverName
        ? `Pending with L1 - ${approverName}`
        : "Pending with L1";
    case "pending_l2":
      return approverName
        ? `Pending with L2 - ${approverName}`
        : "Pending with L2";
    case "pending_admin":
      return "Pending with Admin";
    case "submitted":
      return "Submitted";
    case "approved":
    case "approved_admin":
      return "Approved";
    case "rejected":
    case "rejected_l1":
    case "rejected_l2":
    case "rejected_admin":
      return status.startsWith("rejected_l")
        ? `Rejected by ${status.replace("rejected_", "").toUpperCase()}`
        : "Rejected";
    case "cancelled":
      return "Cancelled";
    case "pulled-back":
      return "Pulled Back";
    default:
      return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
};

export enum LeaveTypesEnum {
  EARNED = "earned",
  SICK = "sick",
  LWP = "lwp",
  WFH = "wfh",
  FLEXI_WEEKEND = "flexi_weekend",
  OPTIONAL_HOLIDAY = "optional_holiday",
  COMPENSATORY_LEAVE = "compensatory_leave",
}

export type Leaves = `${LeaveTypesEnum}`;

export const LeaveTypeLabel: Record<LeaveTypesEnum, string> = {
  [LeaveTypesEnum.EARNED]: "Earned Leave",
  [LeaveTypesEnum.SICK]: "Sick Leave",
  [LeaveTypesEnum.LWP]: "Leave Without Pay",
  [LeaveTypesEnum.WFH]: "Work From Home",
  [LeaveTypesEnum.FLEXI_WEEKEND]: "Flexi Weekend Leave",
  [LeaveTypesEnum.OPTIONAL_HOLIDAY]: "Optional Holiday",
  [LeaveTypesEnum.COMPENSATORY_LEAVE]: "Compensatory Leave",
};

export enum TransactionMode {
  CREDIT = "credit",
  DEBIT = "debit",
}

export enum RoleTypeEnum {
  SUPER_ADMIN = "SuperAdmin",
  ADMIN = "Admin",
  HR = "HR",
  EMPLOYEE = "Employee",
  MANAGER = "Manager",
}

export enum EmployeeStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  TERMINATED = "terminated",
}



//Project Management 


export enum ProjectPriority {
  ALL = "All Priorities",
  CRITICAL = "Critical",
  HIGH = "High",
  MEDIUM = "Medium",
  LOW = "Low",
}



export const ROLE_TYPE_OPTIONS: Array<{ value: RoleTypeEnum; label: string }> =
  [
    { value: RoleTypeEnum.ADMIN, label: "Admin" },
    { value: RoleTypeEnum.HR, label: "HR" },
    { value: RoleTypeEnum.EMPLOYEE, label: "Employee" },
    { value: RoleTypeEnum.MANAGER, label: "Manager" },
  ] as const;

// Timesheet Status Enums
export const TIMESHEET_STATUS = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  REJECTED: "rejected",
  PULLED_BACK: "pulled-back",
} as const;

export type TimesheetStatus =
  (typeof TIMESHEET_STATUS)[keyof typeof TIMESHEET_STATUS];

// Timesheet Status Options for Select Components
export const TIMESHEET_STATUS_OPTIONS = [
  { value: "All Status", label: "All Status" },
  { value: TIMESHEET_STATUS.DRAFT, label: "Draft" },
  { value: TIMESHEET_STATUS.SUBMITTED, label: "Submitted" },
  { value: TIMESHEET_STATUS.APPROVED, label: "Approved" },
  { value: TIMESHEET_STATUS.REJECTED, label: "Rejected" },
  { value: TIMESHEET_STATUS.PULLED_BACK, label: "Pulled Back" },
];

export const TIMESHEET_STATUS_COLORS = {
  [TIMESHEET_STATUS.DRAFT]: "bg-slate-100 text-slate-800",
  [TIMESHEET_STATUS.SUBMITTED]: "bg-yellow-100 text-yellow-800",
  [TIMESHEET_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [TIMESHEET_STATUS.REJECTED]: "bg-red-100 text-red-800",
  [TIMESHEET_STATUS.PULLED_BACK]: "bg-slate-200 text-slate-800",
};

export const FILTER_ALL = {
  EMPLOYEES: "All Employees",
  DEPARTMENTS: "All Departments",
  STATUS: "All Status",
} as const;

export const VIEW_MODE = {
  ALL: "all",
  REPORTEES: "reportees",
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];



export const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export const PAYMENT_STATUS_COLORS: Record<"Paid" | "Unpaid", string> = {
  Paid: "bg-green-100 text-green-800",
  Unpaid: "bg-yellow-100 text-yellow-800",
};

/** Default badge colors for employment status (from master config). Unknown statuses fall back to neutral. */
export const EMPLOYEE_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-yellow-100 text-yellow-800",
  terminated: "bg-red-100 text-red-800",
};

// Designation (position) and discipline options come from master config API (id + displayName).
// Use masterConfigApi.getByCategory('designation') and getByCategory('employment_discipline').

export const PHONE_COUNTRY_CODES = [
  { value: "+91", label: "+91" },
  { value: "+1", label: "+1" },
  { value: "+44", label: "+44" },
  { value: "+61", label: "+61" },
  { value: "+65", label: "+65" },
  { value: "+971", label: "+971" },
];

// Helpers
export const getSurroundingYears = (
  centerYear: number,
  span: number = 3
): string[] => {
  return Array.from({ length: span * 2 + 1 }, (_, index) =>
    String(centerYear - span + index)
  );
};

// Address and relationship constants
export const COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Singapore",
  "UAE",
  "Other",
];

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];

// Emergency contact relationship options come from master config API (id + displayName).
// Use masterConfigApi.getByCategory('relationship').

// Feature Flags
export const FEATURE_FLAGS = {
  SHOW_KPIS: "showKpis",
  SHOW_TIMESHEET: "showTimesheet",
  SHOW_SURVEYS: "showSurveys",
  SHOW_AR_APPROVAL: "showArApproval",
  SHOW_TEAM_LEAVE_APPROVAL: "showTeamLeaveApproval",
  SHOW_GAME_BOOKING: "showGameBooking",
  SHOW_TEAM_AR_APPROVAL: "showTeamArApproval",
  SHOW_TEAM_TIMESHEET_APPROVAL: "showTeamTimesheetApproval",
  SHOW_DOWNTIME: "showDowntime",
  SHOW_KPI_APPROVAL: "showkpiapproval",
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];

// KPI Scoring Status Enums
export const KPI_SCORING_STATUS = {
  NOT_SCORED: "Not scored",
  PENDING_AT_L2: "Pending at L2",
  APPROVED: "Approved",
} as const;

export type KpiScoringStatus =
  (typeof KPI_SCORING_STATUS)[keyof typeof KPI_SCORING_STATUS];

// KPI Approval Status Enums (backend values)
export const KPI_APPROVAL_STATUS = {
  PENDING_L2: "pending_l2",
  APPROVED: "approved",
} as const;

export type KpiApprovalStatus =
  (typeof KPI_APPROVAL_STATUS)[keyof typeof KPI_APPROVAL_STATUS];









  //Resource management
//Project managment priority options
 
export const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Critical", value: ProjectPriority.CRITICAL },
  { label: "High", value: ProjectPriority.HIGH },
  { label: "Medium", value: ProjectPriority.MEDIUM },
  { label: "Low", value: ProjectPriority.LOW },
];

export const SURVEY_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type SurveyStatus =
  (typeof SURVEY_STATUS)[keyof typeof SURVEY_STATUS];