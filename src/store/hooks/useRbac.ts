/**
 * RBAC hooks - read from rbac slice (fed by RTK Query getEffectivePermissions).
 * Use these instead of any context; the query runs when authenticated and updates the slice.
 */
import { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useGetEffectivePermissionsQuery } from "../apis/rbac.api";
import {
  selectPermissionCodes,
  selectRbacHierarchy,
} from "../slices/rbacSlice";
import { sidebarMenuApi } from "../../services/sidebarMenuApi";
import { RoleTypeEnum } from "../../utils/constants";
import { useAuth } from "./useAuth";
import type { IEffectivePermissionHierarchyModule } from "../../types/rbac";

/**
 * Effective permissions and hierarchy from the rbac slice. Triggers the API
 * when authenticated (query updates the slice on success). Syncs hierarchy to sidebar cache.
 */
export function useEffectivePermissions(): {
  codes: Set<string>;
  hierarchy: IEffectivePermissionHierarchyModule[];
  isReady: boolean;
  reload: () => Promise<void>;
} {
  const { user, isAuthenticated } = useAuth();
  const { isLoading, refetch } = useGetEffectivePermissionsQuery(undefined, {
    skip: !isAuthenticated,
  });
  const permissionCodes = useSelector(selectPermissionCodes);
  const hierarchy = useSelector(selectRbacHierarchy);

  const codes = useMemo(() => new Set(permissionCodes), [permissionCodes]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      sidebarMenuApi.invalidateCache(user?.id ?? "");
      return;
    }
    if (hierarchy.length) {
      sidebarMenuApi.setCache(user.id, hierarchy);
    }
  }, [isAuthenticated, user?.id, hierarchy]);

  const reload = useMemo(
    () => async () => {
      await refetch();
    },
    [refetch],
  );

  // Use isLoading (initial load only) so refetches (e.g. after assign role) don't
  // unmount layout and reset page state like the active tab.
  return {
    codes,
    hierarchy,
    isReady: !isLoading,
    reload,
  };
}

/**
 * True if the current user has the given permission code (or is SuperAdmin).
 */
export function useHasPermission(code: string): boolean {
  const { user, isAuthenticated } = useAuth();
  useGetEffectivePermissionsQuery(undefined, { skip: !isAuthenticated });
  const permissionCodes = useSelector(selectPermissionCodes);

  return useMemo(() => {
    const u = user as { role?: string; isSuperAdmin?: boolean } | null;
    if (u?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase()) {
      return true;
    }
    return permissionCodes.includes(code);
  }, [user, permissionCodes, code]);
}
