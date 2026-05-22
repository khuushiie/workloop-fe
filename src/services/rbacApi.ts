import { apiAxios } from "./api";

interface EffectivePermissionsResponse {
  userId: string;
  permissions: EffectivePermission[];
  hierarchy?: {
    modules: PermissionModule[];
  };
}

interface CheckPermissionResponse {
  userId: string;
  code: string;
  hasPermission: boolean;
}

export interface EffectivePermission {
  id: string;
  code: string;
  name: string;
}

export interface PermissionSubmodule {
  id: string;
  code: string;
  name: string;
  order: number;
}

export interface PermissionModule {
  id: string;
  code: string;
  name: string;
  order: number;
  submodules: PermissionSubmodule[];
}

export const rbacApi = {
  async getEffectivePermissions(userId: string): Promise<{
    permissions: EffectivePermission[];
    hierarchy?: { modules: PermissionModule[] };
  }> {
    const res = (await apiAxios.get(
      `/v2/user-access/effective-permissions`
    )) as EffectivePermissionsResponse;
    return {
      permissions: res.permissions || [],
      hierarchy: res.hierarchy,
    };
  },

  async checkPermission(userId: string, code: string): Promise<boolean> {
    const res = (await apiAxios.get(
      `/v2/user-access/effective-permissions`
    )) as CheckPermissionResponse;
    return !!res?.hasPermission;
  },
};
