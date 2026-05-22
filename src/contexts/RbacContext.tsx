/**
 * RBAC hooks - no context/provider. Effective permissions are loaded via RTK Query
 * (useGetEffectivePermissionsQuery) on first use when authenticated.
 */
import { useEffect, useMemo } from "react";
import { useGetEffectivePermissionsQuery } from "../store/apis/rbac.api";
import { sidebarMenuApi } from "../services/sidebarMenuApi";
import { RoleTypeEnum } from "../utils/constants";
import { useAuth } from "../store/hooks/useAuth";
import type { IEffectivePermissionHierarchyModule } from "../types/rbac";

/**
 * Hook to read effective permissions and hierarchy. Triggers the effective-permissions
 * API on first use when authenticated (RTK Query caches and deduplicates).
 */
export function useEffectivePermissions(): {
  codes: Set<string>;
  hierarchy: IEffectivePermissionHierarchyModule[];
  isReady: boolean;
  reload: () => Promise<void>;
} {
  const { user, isAuthenticated } = useAuth();
  const { data, isFetching, refetch } = useGetEffectivePermissionsQuery(
    undefined,
    { skip: !isAuthenticated },
  );

  const codes = useMemo(
    () => new Set((data?.permissions ?? []).map((p) => p.code)),
    [data?.permissions],
  );

  const hierarchy = useMemo(() => data?.hierarchy ?? [], [data?.hierarchy]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      sidebarMenuApi.invalidateCache(user?.id ?? "");
      return;
    }
    if (data?.hierarchy) {
      sidebarMenuApi.setCache(user.id, data.hierarchy);
    }
  }, [isAuthenticated, user?.id, data?.hierarchy]);

  const reload = useMemo(
    () => async () => {
      await refetch();
    },
    [refetch],
  );

  return {
    codes,
    hierarchy,
    isReady: !isFetching,
    reload,
  };
}

/**
 * Check if the current user has a permission by code. Uses effective-permissions
 * API (same cache as useEffectivePermissions). SuperAdmin role bypasses check.
 */
export function useHasPermission(code: string): boolean {
  const { user, isAuthenticated } = useAuth();
  const { data } = useGetEffectivePermissionsQuery(undefined, {
    skip: !isAuthenticated,
  });

  return useMemo(() => {
    const u = user as { role?: string; isSuperAdmin?: boolean } | null;
    if (
      u?.role?.toLowerCase() === RoleTypeEnum.SUPER_ADMIN?.toLowerCase() ||
      u?.isSuperAdmin
    ) {
      return true;
    }
    const codes = new Set((data?.permissions ?? []).map((p) => p.code));
    return codes.has(code);
  }, [user, data?.permissions, code]);
}
