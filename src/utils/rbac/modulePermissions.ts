import {
  BILLING_LICENSE_ACCESS_PERMISSIONS,
  PermissionCode,
  PERMISSIONS,
} from "./permissions";

type PermissionPattern = {
  pattern: string;
  permission: PermissionCode | PermissionCode[];
};

const PATTERNS: PermissionPattern[] = [
  // Admin Config routes (keep /admin prefix)
  {
    pattern: "/admin/leave-balance",
    permission: [
      PERMISSIONS.LEAVE_BALANCES_VIEW,
      PERMISSIONS.LEAVE_BALANCES_MANAGE,
    ],
  },
  {
    pattern: "/admin/access-right-management/setup-roles",
    permission: [
      PERMISSIONS.ACCESS_RIGHT_VIEW,
      PERMISSIONS.ACCESS_RIGHT_MANAGE,
    ],
  },
  {
    pattern: "/admin/config/feature-flags",
    permission: [
      PERMISSIONS.FEATURE_FLAGS_VIEW,
      PERMISSIONS.FEATURE_FLAGS_MANAGE,
    ],
  },
  {
    pattern: "/admin/holiday-management",
    permission: [
      PERMISSIONS.HOLIDAY_MANAGEMENT_VIEW,
      PERMISSIONS.HOLIDAY_MANAGEMENT_MANAGE,
    ],
  },
  {
    pattern: "/admin/config/master-config",
    permission: [
      PERMISSIONS.MASTER_CONFIG_VIEW,
      PERMISSIONS.MASTER_CONFIG_MANAGE,
    ],
  },
  {
    pattern: "/admin/kpi/assignment",
    permission: [
      PERMISSIONS.KPI_ASSIGNMENTS_VIEW,
      PERMISSIONS.KPI_ASSIGNMENTS_MANAGE,
    ],
  },
  {
    pattern: "/admin/employee-service",
    permission: [
      PERMISSIONS.EMPLOYEE_SERVICE_VIEW,
      PERMISSIONS.EMPLOYEE_SERVICE_MANAGE,
    ],
  },
  {
    pattern: "/employees",
    permission: [
      PERMISSIONS.EMPLOYEE_MANAGEMENT_VIEW,
      PERMISSIONS.EMPLOYEE_MANAGEMENT_MANAGE,
    ],
  },
  {
    pattern: "/leave-creation",
    permission: [PERMISSIONS.APPLY_LEAVE_VIEW, PERMISSIONS.APPLY_LEAVE_MANAGE],
  },
  {
    pattern: "/leave-approvals",
    permission: [
      PERMISSIONS.LEAVE_REQUESTS_VIEW,
      PERMISSIONS.LEAVE_REQUESTS_MANAGE,
    ],
  },
  {
    pattern: "/timesheet/management",
    permission: [
      PERMISSIONS.TIMESHEET_MANAGEMENT_VIEW,
      PERMISSIONS.TIMESHEET_MANAGEMENT_MANAGE,
    ],
  },
  {
    pattern: "/timesheet/approval",
    permission: [
      PERMISSIONS.TIMESHEET_MANAGEMENT_VIEW,
      PERMISSIONS.TIMESHEET_MANAGEMENT_MANAGE,
    ],
  },
  {
    pattern: "/kpi/scoring",
    permission: [PERMISSIONS.KPI_SCORES_VIEW, PERMISSIONS.KPI_SCORES_MANAGE],
  },
  {
    pattern: "/reports/attendance",
    permission: [
      PERMISSIONS.REPORTS_ATTENDANCE_VIEW,
      PERMISSIONS.REPORTS_ATTENDANCE_MANAGE,
      PERMISSIONS.MY_ATTENDANCE_VIEW,
    ],
  },
  {
    pattern: "/reports/regularization",
    permission: [
      PERMISSIONS.REPORTS_REGULARIZATION_VIEW,
      PERMISSIONS.REPORTS_REGULARIZATION_MANAGE,
    ],
  },
  {
    pattern: "/reports/leave-balance-report",
    permission: [
      PERMISSIONS.REPORTS_LEAVE_BALANCE_VIEW,
      PERMISSIONS.REPORTS_LEAVE_BALANCE_MANAGE,
    ],
  },
  {
    pattern: "/survey-creation",
    permission: [
      PERMISSIONS.SURVEY_RESPONSE_VIEW,
      PERMISSIONS.SURVEY_RESPONSE_MANAGE,
    ],
  },
  {
    pattern: "/survey-responses",
    permission: [
      PERMISSIONS.SURVEY_RESPONSE_VIEW,
      PERMISSIONS.SURVEY_RESPONSE_MANAGE,
    ],
  },
  {
    pattern: "/admin/regularization",
    permission: [
      PERMISSIONS.REGULARIZATION_MANAGEMENT_VIEW,
      PERMISSIONS.REGULARIZATION_MANAGEMENT_MANAGE,
    ],
  },
  {
    pattern: "/admin/attendance",
    permission: [
      PERMISSIONS.REPORTS_ATTENDANCE_VIEW,
      PERMISSIONS.REPORTS_ATTENDANCE_MANAGE,
    ],
  },
  {
    pattern: "/resource-allocation/project-analytics",
    permission: [
      PERMISSIONS.PROJECT_MANAGEMENT_VIEW,
      PERMISSIONS.PROJECT_MANAGEMENT_MANAGE,
    ],
  },
  {
    pattern: "/team/leave-approvals",
    permission: [PERMISSIONS.LEAVE_REQUESTS_MANAGE],
  },
  {
    pattern: "/team/ar-approvals",
    permission: [PERMISSIONS.APPLY_AR_MANAGE],
  },
  {
    pattern: "/team/timesheet-approvals",
    permission: [PERMISSIONS.TIMESHEET_MANAGEMENT_MANAGE],
  },

  {
    pattern: "/kpi/user-details/",
    permission: [
      PERMISSIONS.MY_PERFORMANCE_VIEW,
      PERMISSIONS.MY_PERFORMANCE_MANAGE,
    ],
  },
  {
    pattern: "/apply-leave",
    permission: [PERMISSIONS.APPLY_LEAVE_VIEW, PERMISSIONS.APPLY_LEAVE_MANAGE],
  },
  {
    pattern: "/attendance",
    permission: [
      PERMISSIONS.MY_ATTENDANCE_VIEW,
      PERMISSIONS.MY_ATTENDANCE_MANAGE,
    ],
  },
  {
    pattern: "/attendance-regularization",
    permission: [PERMISSIONS.APPLY_AR_VIEW, PERMISSIONS.APPLY_AR_MANAGE],
  },
  {
    pattern: "/my-profile",
    permission: [
      PERMISSIONS.EMPLOYEE_PROFILE_VIEW,
      PERMISSIONS.EMPLOYEE_PROFILE_MANAGE,
    ],
  },
  {
    pattern: "/my-timesheets",
    permission: [
      PERMISSIONS.MY_TIMESHEETS_VIEW,
      PERMISSIONS.MY_TIMESHEETS_MANAGE,
    ],
  },
  {
    pattern: "/my-attendance",
    permission: [
      PERMISSIONS.MY_ATTENDANCE_VIEW,
      PERMISSIONS.MY_ATTENDANCE_MANAGE,
    ],
  },
  {
    pattern: "/admin/organization",
    permission: [
      PERMISSIONS.ORGANIZATION_ONBOARDING_VIEW,
      PERMISSIONS.ORGANIZATION_ONBOARDING_MANAGE,
    ],
  },
  {
    pattern: "/billing-license",
    permission: [
      PERMISSIONS.BILLING_LICENSE_VIEW,
      PERMISSIONS.BILLING_LICENSE_MANAGE,
    ],
  },
  {
    pattern: "/dynamic-workflow",
    permission: [
      PERMISSIONS.MANAGE_WORKFLOW_VIEW,
      PERMISSIONS.MANAGE_WORKFLOW_MANAGE,
    ],
  },
  {
    pattern: "/workflow/group",
    permission: [
      PERMISSIONS.MANAGE_GROUPS_VIEW,
      PERMISSIONS.MANAGE_GROUPS_MANAGE,
    ],
  },
  {
    pattern: "/referrals",
    permission: [PERMISSIONS.REFER_CANDIDATE_VIEW, PERMISSIONS.REFER_CANDIDATE_MANAGE],
  },
  {
    pattern: "/referral-trackings",
    permission: [PERMISSIONS.MY_REFERRALS_VIEW, PERMISSIONS.MY_REFERRALS_MANAGE],
  },
];

const matchPattern = (pattern: string, path: string): boolean => {
  if (pattern.endsWith("/*")) {
    const prefix = pattern.slice(0, -1);
    return path.startsWith(prefix);
  }
  if (pattern.endsWith("/")) {
    return path.startsWith(pattern);
  }
  return path === pattern;
};

export const getPermissionForPath = (
  path: string,
): PermissionCode | PermissionCode[] | undefined => {
  const entry = PATTERNS.find((p) => matchPattern(p.pattern, path));
  return entry?.permission;
};
