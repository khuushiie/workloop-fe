import { apiAxios } from "./api";

export type PermissionNode = {
  _id: string;
  code: string;
  name: string;
  type: "MODULE" | "SUBMODULE" | "ACTION";
  parentId: string | null;
  order: number;
  children?: PermissionNode[];
};

export interface IRoleItem {
  _id: string;
  id?: string;
  name: string;
  type?: string;
  description?: string;
  active?: boolean;
  nodeIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IRolePaginatedResult {
  items: IRoleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
  summary?: { total: number; active: number; inactive: number };
}

export interface IPermissionOperationResult {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

export interface ISetOverridesResult {
  userId: string;
  added: string[];
  removed: string[];
  message?: string;
}

export const rbacAdminApi = {
  async getPermissionTree(): Promise<PermissionNode[]> {
    const res = await apiAxios.get("/permissions");
    return (res as unknown as PermissionNode[]) || [];
  },

  async listRoles(options?: {
    activeOnly?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<IRolePaginatedResult | IRoleItem[]> {
    const params: Record<string, string | number> = {};
    if (options?.activeOnly !== undefined)
      params.active = options.activeOnly ? "true" : "false";
    if (options?.page) params.page = options.page;
    if (options?.limit) params.limit = options.limit;
    if (options?.search) params.search = options.search;
    const res = await apiAxios.get("/roles", {
      params: Object.keys(params).length ? params : undefined,
    });
    return (res as unknown as IRolePaginatedResult | IRoleItem[]) || [];
  },

  async getRole(roleId: string): Promise<IRoleItem> {
    const res = await apiAxios.get(`/roles/${roleId}`);
    return res as unknown as IRoleItem;
  },

  async createRole(payload: {
    name: string;
    type?: string;
    description?: string;
    nodeIdsOrCodes: string[];
  }): Promise<IRoleItem> {
    const res = await apiAxios.post("/roles/create", payload);
    return res as unknown as IRoleItem;
  },

  async updateRole(
    roleId: string,
    payload: {
      name?: string;
      description?: string;
      type?: string;
      active?: boolean;
      nodeIdsOrCodes?: string[];
    },
  ): Promise<IRoleItem> {
    const res = await apiAxios.put(`/roles/${roleId}`, payload);
    return res as unknown as IRoleItem;
  },

  async deleteRole(roleId: string): Promise<IPermissionOperationResult> {
    const res = await apiAxios.delete(`/roles/${roleId}`);
    return res as unknown as IPermissionOperationResult;
  },

  async assignRole(userId: string, roleId: string): Promise<IPermissionOperationResult> {
    const res = await apiAxios.post(`/user-access/${userId}/role`, { roleId });
    return res as unknown as IPermissionOperationResult;
  },

  async listAssignableUsers(options?: {
    page?: number;
    limit?: number;
  }): Promise<
    Array<{
      id: string;
      name: string;
      username?: string | null;
      workEmail?: string | null;
      employeeId?: string | null;
      department?: string | null;
      role?: string | null;
      roleId?: string | null;
      status?: string | null;
      reportingManagerName?: string | null;
      functionalManagerName?: string | null;
    }>
  > {
    const params =
      options?.page && options.page > 0
        ? { page: options.page, limit: options.limit ?? 10 }
        : undefined;
    const res = await apiAxios.get("/user-access/users", { params });
    return (res as unknown as Array<{
      id: string;
      name: string;
      username?: string | null;
      workEmail?: string | null;
      employeeId?: string | null;
      department?: string | null;
      role?: string | null;
      roleId?: string | null;
      status?: string | null;
      reportingManagerName?: string | null;
      functionalManagerName?: string | null;
    }>) || [];
  },

  async getUserRole(userId: string): Promise<{
    userId: string;
    role: { id: string; name?: string; type?: string } | null;
  }> {
    const res = await apiAxios.get(`/user-access/${userId}/role`);
    return (
      (res as unknown as { userId: string; role: { id: string; name?: string; type?: string } | null }) || {
        userId,
        role: null,
      }
    );
  },

  async getUserPermissions(userId: string): Promise<{
    userId: string;
    basePermissionIds: string[];
    extraPermissionIds: string[];
    effectivePermissionIds?: string[];
  }> {
    const res = await apiAxios.get(`/user-access/${userId}/overrides`);
    return (
      (res as unknown as { userId: string; basePermissionIds: string[]; extraPermissionIds: string[]; effectivePermissionIds?: string[] }) || { userId, basePermissionIds: [], extraPermissionIds: [] }
    );
  },

  async setOverrides(
    userId: string,
    add: string[],
    remove: string[] = [],
  ): Promise<ISetOverridesResult> {
    const res = await apiAxios.post(`/user-access/${userId}/overrides`, {
      add,
      remove,
    });
    return res as unknown as ISetOverridesResult;
  },

  async createCustomPermission(payload: {
    moduleId?: string;
    moduleName: string;
    submoduleId?: string;
    submoduleName?: string;
    actionName: string;
  }): Promise<PermissionNode> {
    const res = await apiAxios.post("/permissions/custom", payload);
    return res as unknown as PermissionNode;
  },

  async updatePermission(
    permissionId: string,
    payload: {
      name?: string;
      order?: number;
    },
  ): Promise<PermissionNode> {
    const res = await apiAxios.patch(`/permissions/${permissionId}`, payload);
    return res as unknown as PermissionNode;
  },

  async createEntity(payload: {
    name: string;
    parentId: string | null;
    entityType: "MODULE" | "SUBMODULE";
  }): Promise<PermissionNode> {
    const res = await apiAxios.post("/permissions/entity", payload);
    return res as unknown as PermissionNode;
  },

  async deletePermission(permissionId: string): Promise<IPermissionOperationResult> {
    const res = await apiAxios.delete(`/permissions/${permissionId}`);
    return res as unknown as IPermissionOperationResult;
  },
};
