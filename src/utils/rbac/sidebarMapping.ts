/**
 * Maps permission codes to sidebar paths
 * Used to match backend permission modules/submodules with frontend routes
 */

export interface SidebarItemConfig {
  code: string; // Permission code (MODULE or SUBMODULE)
  path: string; // Frontend route path
  icon?: string; // Icon name (for reference)
  featureFlag?: string; // Optional feature flag
}

/**
 * Mapping of permission codes to sidebar paths
 * This maps backend permission codes to frontend routes
 */
export const PERMISSION_TO_PATH_MAP: Record<string, SidebarItemConfig> = {
  // Admin Config submodules
  ADMIN_LEAVE_BALANCES: {
    code: "ADMIN_LEAVE_BALANCES",
    path: "/admin/leave-balance",
  },
  ADMIN_CONFIG_ACCESS_RIGHTS: {
    code: "ADMIN_CONFIG_ACCESS_RIGHTS",
    path: "/admin/access-right-management/setup-roles",
  },
  ADMIN_CONFIG_MASTER: {
    code: "ADMIN_CONFIG_MASTER",
    path: "/admin/config/feature-flags",
  },
  ADMIN_HOLIDAY_MANAGEMENT: {
    code: "ADMIN_HOLIDAY_MANAGEMENT",
    path: "/admin/holiday-management",
  },
  MASTER_CONFIG: {
    code: "MASTER_CONFIG",
    path: "/admin/config/master-config",
  },
  ADMIN_KPI_ASSIGNMENTS: {
    code: "ADMIN_KPI_ASSIGNMENTS",
    path: "/admin/kpi/assignment",
    featureFlag: "SHOW_KPIS",
  },
  ADMIN_PAYROLL: {
    code: "ADMIN_PAYROLL",
    path: "/admin/payroll",
  },
  EMPLOYEE_SERVICE: {
    code: "EMPLOYEE_SERVICE",
    path: "/admin/employee-service",
  },

  // Leave & Attendance submodules
  USER_APPLY_LEAVE: {
    code: "USER_APPLY_LEAVE",
    path: "/apply-leave",
  },
  USER_ATTENDANCE_REGULARIZATION: {
    code: "USER_ATTENDANCE_REGULARIZATION",
    path: "/attendance-regularization",
  },
  ADMIN_REGULARIZATION_MANAGEMENT: {
    code: "ADMIN_REGULARIZATION_MANAGEMENT",
    path: "/admin/regularization",
  },
  TEAM_AR_APPROVALS: {
    code: "TEAM_AR_APPROVALS",
    path: "/team/ar-approvals",
    featureFlag: "SHOW_TEAM_AR_APPROVAL",
  },
  ADMIN_LEAVE_APPROVALS: {
    code: "ADMIN_LEAVE_APPROVALS",
    path: "/leave-approvals",
  },
  TEAM_LEAVE_APPROVALS: {
    code: "TEAM_LEAVE_APPROVALS",
    path: "/team/leave-approvals",
    featureFlag: "SHOW_TEAM_LEAVE_APPROVAL",
  },
  ADMIN_CREATE_LEAVE: {
    code: "ADMIN_CREATE_LEAVE",
    path: "/leave-creation",
  },
  USER_MY_ATTENDANCE: {
    code: "USER_MY_ATTENDANCE",
    path: "/attendance",
  },

  // Timesheet submodules
  USER_MY_TIMESHEETS: {
    code: "USER_MY_TIMESHEETS",
    path: "/my-timesheets",
  },
  ADMIN_TIMESHEET_APPROVAL: {
    code: "ADMIN_TIMESHEET_APPROVAL",
    path: "/timesheet/approval",
  },
  TEAM_TIMESHEET_APPROVALS: {
    code: "TEAM_TIMESHEET_APPROVALS",
    path: "/team/timesheet-approvals",
    featureFlag: "SHOW_TEAM_TIMESHEET_APPROVAL",
  },
  ADMIN_TIMESHEET_MANAGEMENT: {
    code: "ADMIN_TIMESHEET_MANAGEMENT",
    path: "/timesheet/management",
  },

  // Performance submodules
  USER_MY_PERFORMANCE: {
    code: "USER_MY_PERFORMANCE",
    path: `/kpi/user-details`, // Will be appended with userId
  },
  ADMIN_KPI_SCORING: {
    code: "ADMIN_KPI_SCORING",
    path: "/kpi/scoring",
  },

  // Reports submodules
  ADMIN_REPORTS_ATTENDANCE: {
    code: "ADMIN_REPORTS_ATTENDANCE",
    path: "/reports/attendance",
  },
  ADMIN_REPORTS_REGULARIZATION: {
    code: "ADMIN_REPORTS_REGULARIZATION",
    path: "/reports/regularization",
  },
  ADMIN_REPORTS_LEAVE_BALANCE: {
    code: "ADMIN_REPORTS_LEAVE_BALANCE",
    path: "/reports/leave-balance-report",
  },

  // Surveys submodules
  USER_SURVEYS: {
    code: "USER_SURVEYS",
    path: "/surveys",
  },
  ADMIN_SURVEY_CAMPAIGNS: {
    code: "ADMIN_SURVEY_CAMPAIGNS",
    path: "/survey-creation",
  },
  ADMIN_SURVEY_RESPONSES: {
    code: "ADMIN_SURVEY_RESPONSES",
    path: "/survey-responses",
  },
  SURVEY_MANAGEMENT: {
    code: "SURVEY_MANAGEMENT",
    path: "/survey-management",
  },
  PROJECT_MANAGEMENT: {
    code: "PROJECT_MANAGEMENT",
    path: "/resource-allocation/project-management",
  },
  RESOURCE_MANAGEMENT: {
    code: "RESOURCE_MANAGEMENT",
    path: "/resource-allocation/resource-management",
  },
  SURVEY_BUILDER: {
    code: "SURVEY_BUILDER",
    path: "/survey-builder",
  },
  PROJECT_ANALYTICS: {
    code: "PROJECT_ANALYTICS",
    path: "/resource-allocation/project-analytics",
  },

  // Backend effective-permissions API codes (alias to same paths)
  LEAVE_BALANCES: { code: "LEAVE_BALANCES", path: "/admin/leave-balance" },
  ACCESS_RIGHT: {
    code: "ACCESS_RIGHT",
    path: "/admin/access-right-management/setup-roles",
  },
  FEATURE_FLAGS: { code: "FEATURE_FLAGS", path: "/admin/config/feature-flags" },
  HOLIDAY_MANAGEMENT: {
    code: "HOLIDAY_MANAGEMENT",
    path: "/admin/holiday-management",
  },
  KPI_MANAGEMENT: {
    code: "KPI_MANAGEMENT",
    path: "/admin/kpi/assignment",
    featureFlag: "SHOW_KPIS",
  },
  APPLY_LEAVE: { code: "APPLY_LEAVE", path: "/apply-leave" },
  APPLY_AR: { code: "APPLY_AR", path: "/attendance-regularization" },
  REGULARIZATION_MANAGEMENT: {
    code: "REGULARIZATION_MANAGEMENT",
    path: "/admin/regularization",
  },
  LEAVE_APPROVALS: { code: "LEAVE_APPROVALS", path: "/leave-approvals" },
  MY_ATTENDANCE: { code: "MY_ATTENDANCE", path: "/attendance" },
  MY_TIMESHEETS: { code: "MY_TIMESHEETS", path: "/my-timesheets" },
  TIMESHEET_MANAGEMENT: {
    code: "TIMESHEET_MANAGEMENT",
    path: "/timesheet/management",
  },
  MY_PERFORMANCE: {
    code: "MY_PERFORMANCE",
    path: `/kpi/user-details`,
    featureFlag: "SHOW_KPIS",
  },
  REPORTS_ATTENDANCE: {
    code: "REPORTS_ATTENDANCE",
    path: "/reports/attendance",
  },
  REPORTS_REGULARIZATION: {
    code: "REPORTS_REGULARIZATION",
    path: "/reports/regularization",
  },
  REPORTS_LEAVE_BALANCE: {
    code: "REPORTS_LEAVE_BALANCE",
    path: "/reports/leave-balance-report",
  },
  MY_SURVEYS: { code: "MY_SURVEYS", path: "/my-surveys" },
  SURVEY_RESPONSES: {
    code: "SURVEY_RESPONSES",
    path: "/survey-responses",
  },

  //workflow submodules
  MANAGE_WORKFLOW: {
    code: "MANAGE_WORKFLOW",
    path: "/dynamic-workflow",
  },
  MANAGE_GROUPS: {
    code: "MANAGE_GROUPS",
    path: "/workflow/group",
  },
  ORGANIZATION_ONBOARDING: {
    code: "ORGANIZATION_ONBOARDING",
    path: "/admin/organization",
  },
  REFER_CANDIDATE: {
    code: "REFER_CANDIDATE",
    path: "/referral/create",
  },
  MY_REFERRALS: {
    code: "MY_REFERRALS",
    path: "/referral-trackings",
  },
  BILLING: {
    code: "BILLING",
    path: "/billing-license",
  },
  LICENSE: {
    code: "LICENSE",
    path: "/billing-license",
  },

  // Config Management
  WEEK_OFF_CONFIG: {
    code: "WEEK_OFF_CONFIG",
    path: "/admin/config-management/holiday-config",
  },
  EMAIL_TEMPLATES: {
    code: "EMAIL_TEMPLATES",
    path: "/admin/email-templates",
  },
  EMAIL_CONFIG: {
    code: "EMAIL_CONFIG",
    path: "/admin/email-config",
  },
};

/**
 * Get path for a permission code
 */
export const getPathForPermissionCode = (code: string): string | null => {
  return PERMISSION_TO_PATH_MAP[code]?.path || null;
};

/**
 * Get feature flag for a permission code
 */
export const getFeatureFlagForPermissionCode = (
  code: string,
): string | null => {
  return PERMISSION_TO_PATH_MAP[code]?.featureFlag || null;
};
