import { useMemo } from "react";
import { useAuth } from "../store/hooks/useAuth";
import { useFeatureFlags } from "../contexts/FeatureFlagsContext";
import {
  useEffectivePermissions,
  useHasPermission,
} from "../store/hooks/useRbac";
import { FEATURE_FLAGS } from "../utils/constants";
import { PERMISSIONS } from "../utils/rbac/permissions";
import {
  getPathForPermissionCode,
  getFeatureFlagForPermissionCode,
} from "../utils/rbac/sidebarMapping";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  FileText,
  Settings,
  CheckSquare,
  PlusCircle,
  Star,
  CreditCard,
  RefreshCcw,
  Eye,
  Sliders,
  User,
  ToggleLeft,
  Receipt,
  Package,
  Box,
  Target,
  UserCog,
  Network,
  BarChart,
  Split,
  AlignCenterVerticalIcon,
  Award,
  Crown,
  Medal,
  FileStack,
  NotepadText,
  ClipboardPen,
  HandHelping,
  UserRoundCog,
  FileUser,
  SquareUserRound,
  CalendarClock,
  UsersRound,
  UserPlus,
  Users2Icon,
  Mail,
} from "lucide-react";

export interface SidebarMenuItem {
  icon: unknown;
  label: string;
  path?: string; // Optional for group items
  type?: "single" | "group";
  items?: SidebarMenuItem[];
  code?: string; // Permission code for dynamic updates
  disabled?: boolean; // For unmapped modules/submodules visible to admins
}

/**
 * Hook to get sidebar menu structure with dynamic names from backend
 * Uses hierarchy from rbac slice (useEffectivePermissions) to avoid duplicate API calls
 */
export const useSidebarMenu = () => {
  const { user } = useAuth();
  const { isEnabled } = useFeatureFlags();
  const { hierarchy, isReady, reload } = useEffectivePermissions();
  const hasAccessRightsManage = useHasPermission(
    PERMISSIONS.ACCESS_RIGHT_MANAGE,
  );

  // Use hierarchy directly from rbac slice (no separate API call)
  const menuStructure = hierarchy || [];

  // Build menu items from backend structure
  const menuItems = useMemo((): SidebarMenuItem[] => {
    if (!menuStructure.length) {
      return [];
    }

    const items: SidebarMenuItem[] = [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/dashboard",
        type: "single",
      },

    ];

    // Process all modules in order (they're already sorted by backend)
    for (const module of menuStructure) {
      // Handle Employee Management as single item (backend: EMPLOYEE_MANAGEMENT or ADMIN_EMPLOYEE_MANAGEMENT)
      if (
        module.code === "ADMIN_EMPLOYEE_MANAGEMENT" ||
        module.code === "EMPLOYEE_MANAGEMENT"
      ) {
        items.push({
          icon: Users,
          label: module.name,
          path: "/employees",
          type: "single",
          code: module.code,
        });
        continue;
      }

      // Handle My Profile as single item (backend: EMPLOYEE_PROFILE or USER_EMPLOYEE_PROFILE)
      if (
        module.code === "USER_EMPLOYEE_PROFILE" ||
        module.code === "EMPLOYEE_PROFILE"
      ) {
        items.push({
          icon: User,
          label: module.name,
          path: "/my-profile",
          type: "single",
          code: module.code,
        });
        continue;
      }

      if (module.code === "EMPLOYEE_SELF_SERVICE") {
        items.push({
          icon: UserRoundCog,
          label: module.name,
          path: "/employee-self-service",
          type: "single",
          code: module.code,
        });
        continue;
      }

      if (module.code === "ORGANIZATION_ONBOARDING") {
        items.push({
          icon: HandHelping,
          label: module.name,
          path: "/admin/organization",
          type: "single",
          code: module.code,
        });
        continue;
      }


      if (module.code === "BILLING_LICENSE") {
        items.push({
          icon: CreditCard,
          label: module.name,
          path: "/billing-license",
          type: "single",
          code: module.code,
        });
        continue;
      }

      // For users with ACCESS_RIGHTS_MANAGE, show all modules (even unmapped)
      // For regular users, only show modules with config
      const moduleConfig = getModuleConfig(module.code);
      if (!moduleConfig && !hasAccessRightsManage) continue;

      const subItems: SidebarMenuItem[] = [];

      // Add submodules (already sorted by backend)
      for (const submodule of module.submodules) {
        const path = getPathForPermissionCode(submodule.code);
        const featureFlag = getFeatureFlagForPermissionCode(submodule.code);

        // For regular users: skip if no path or feature flag disabled
        if (!hasAccessRightsManage) {
          if (!path) continue;
          if (
            featureFlag &&
            !isEnabled(FEATURE_FLAGS[featureFlag as keyof typeof FEATURE_FLAGS])
          ) {
            continue;
          }
        } else {
          // For ACCESS_RIGHTS_MANAGE users: skip only if feature flag disabled
          if (
            featureFlag &&
            !isEnabled(FEATURE_FLAGS[featureFlag as keyof typeof FEATURE_FLAGS])
          ) {
            continue;
          }
        }

        const icon = path ? getIconForSubmodule(submodule.code) : Box;
        const isDisabled = !path;

        if (
          isDisabled &&
          (import.meta.env?.DEV || import.meta.env?.MODE === "development")
        ) {
          console.warn(
            `[Sidebar] Unmapped Submodule Found:\n` +
              `  Code: ${submodule.code}\n` +
              `  Name: ${submodule.name}\n` +
              `  Parent Module: ${module.name} (${module.code})\n` +
              `  To map this submodule, add it to PERMISSION_TO_PATH_MAP in sidebarMapping.ts\n` +
              `  Example: ${submodule.code}: { code: "${submodule.code}", path: "/your-route-path" }`,
          );
        }

        subItems.push({
          icon,
          label: submodule.name,
          path: path
            ? path === `/kpi/user-details`
              ? `/kpi/user-details/${user?.id}`
              : path
            : undefined,
          code: submodule.code,
          disabled: isDisabled,
        });
      }

      // Show module if it has submodules OR if user has ACCESS_RIGHTS_MANAGE (to show unmapped modules)
      if (subItems.length > 0 || hasAccessRightsManage) {
        const moduleIcon = moduleConfig?.icon || Package;
        const isModuleUnmapped = !moduleConfig && hasAccessRightsManage;

        // Developer helper: Log unmapped modules in development
        if (
          isModuleUnmapped &&
          (import.meta.env?.DEV || import.meta.env?.MODE === "development")
        ) {
          console.warn(
            `[Sidebar] Unmapped Module Found:\n` +
              `  Code: ${module.code}\n` +
              `  Name: ${module.name}\n` +
              `  To map this module, add it to getModuleConfig() in useSidebarMenu.ts\n` +
              `  Example: ${module.code}: { icon: Settings }`,
          );
        }

        // If module has no submodules but user has ACCESS_RIGHTS_MANAGE, show as disabled single item
        if (subItems.length === 0 && hasAccessRightsManage) {
          items.push({
            icon: moduleIcon,
            label: module.name,
            type: "single",
            code: module.code,
            disabled: true,
          });
        } else {
          // Module has submodules, show as group
          items.push({
            icon: moduleIcon,
            label: module.name,
            type: "group",
            items: subItems,
            code: module.code,
            disabled: isModuleUnmapped,
          });
        }
      }
    }

    return items;
  }, [menuStructure, isEnabled, user?.id, hasAccessRightsManage]);

  return {
    menuItems,
    loading: !isReady,
    error: null,
    reload,
  };
};

/**
 * Get module configuration (icon, etc.)
 */
function getModuleConfig(code: string): { icon: unknown } | null {
  const configs: Record<string, { icon: unknown }> = {
    ADMIN_CONFIG: { icon: Settings },
    LEAVE_ATTENDANCE: { icon: Calendar },
    TIMESHEET: { icon: Clock },
    PERFORMANCE: { icon: Star },
    ADMIN_REPORTS: { icon: FileUser },
    REPORTS: { icon: FileText }, // backend code
    SURVEYS: { icon: FileStack },
    RESOURCE_ALLOCATION: { icon: Network },
    WORKFLOW: { icon: Split },
    ORGANIZATION_ONBOARDING: { icon: UserCog },
    REFERRAL: { icon: UserPlus },
    BILLING_LICENSE: { icon: CreditCard },
    CONFIG_MANAGEMENT: { icon: Settings },
    EMAIL_MANAGEMENT: { icon: Mail },
  };
  return configs[code] || null;
}

/**
 * Get icon for submodule based on code
 */
function getIconForSubmodule(code: string): unknown {
  const iconMap: Record<string, unknown> = {
    LEAVE_BALANCES: CreditCard,
    ADMIN_CONFIG_ACCESS_RIGHTS: Sliders,
    ACCESS_RIGHT: Sliders,
    ADMIN_CONFIG_MASTER: ToggleLeft,
    FEATURE_FLAGS: ToggleLeft,
    ADMIN_HOLIDAY_MANAGEMENT: Calendar,
    HOLIDAY_MANAGEMENT: Calendar,
    MASTER_CONFIG: AlignCenterVerticalIcon,
    ADMIN_KPI_ASSIGNMENTS: Users,
    KPI_MANAGEMENT: Award,
    EMPLOYEE_SERVICE: SquareUserRound,
    ADMIN_PAYROLL: Receipt,
    USER_APPLY_LEAVE: PlusCircle,
    APPLY_LEAVE: PlusCircle,
    USER_ATTENDANCE_REGULARIZATION: RefreshCcw,
    MY_ATTENDANCE: Calendar,
    APPLY_AR: RefreshCcw,
    ADMIN_REGULARIZATION_MANAGEMENT: Settings,
    REGULARIZATION_MANAGEMENT: Settings,
    TEAM_AR_APPROVALS: CheckSquare,
    ADMIN_LEAVE_APPROVALS: CheckSquare,
    LEAVE_APPROVALS: CheckSquare,
    TEAM_LEAVE_APPROVALS: CheckSquare,
    ADMIN_CREATE_LEAVE: PlusCircle,
    USER_MY_TIMESHEETS: Clock,
    MY_TIMESHEETS: CalendarClock,
    ADMIN_TIMESHEET_APPROVAL: CheckSquare,
    TEAM_TIMESHEET_APPROVALS: CheckSquare,
    ADMIN_TIMESHEET_MANAGEMENT: Settings,
    TIMESHEET_MANAGEMENT: Settings,
    USER_MY_PERFORMANCE: Star,
    MY_PERFORMANCE: Crown,
    ADMIN_KPI_SCORING: Medal,
    ADMIN_REPORTS_ATTENDANCE: Clock,
    REPORTS_ATTENDANCE: Clock,
    ADMIN_REPORTS_REGULARIZATION: RefreshCcw,
    REPORTS_REGULARIZATION: RefreshCcw,
    ADMIN_REPORTS_LEAVE_BALANCE: Eye,
    REPORTS_LEAVE_BALANCE: Eye,
    USER_SURVEYS: FileText,
    MY_SURVEYS: NotepadText,
    ADMIN_SURVEY_CAMPAIGNS: CreditCard,
    ADMIN_SURVEY_RESPONSES: CheckSquare,
    SURVEY_RESPONSES: CheckSquare,
    SURVEY_MANAGEMENT: ClipboardPen,
    PROJECT_MANAGEMENT: Target,
    RESOURCE_MANAGEMENT: UsersRound,
    PROJECT_ANALYTICS: BarChart,
    ORGANIZATION_ONBOARDING: HandHelping,
    MANAGE_WORKFLOW: Sliders,
    MANAGE_GROUPS: UserCog,
    REFERRAL: UserPlus,
    REFERRAL_TRACKING: UserPlus,
    REFERRAL_MANAGEMENT: UserCog,
    BILLING: Receipt,
    LICENSE: CreditCard,
    MY_REFERRALS: Users2Icon,
    WEEK_OFF_CONFIG: Calendar,
    EMAIL_TEMPLATES: Mail,
    EMAIL_CONFIG: Settings,
  };
  return iconMap[code] || FileText;
}
