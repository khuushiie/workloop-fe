/**
 * RBAC V2 types - same property names as backend v2 (no transformation).
 */

export enum PermissionNodeType {
  ROOT = "ROOT",
  MODULE = "MODULE",
  SUBMODULE = "SUBMODULE",
  ACTION = "ACTION",
}

export enum PermissionCode {
  HRMS = "HRMS",
}

export type PermissionType = `${PermissionNodeType}`;

export interface IPermission {
  id: string;
  code: string;
  name: string;
  type: PermissionType;
  parentId?: string | null;
  order: number;
  children?: IPermission[];
}

export interface IPermissionTreeResponse {
  tree: IPermission[];
  totalCount: number;
}

export interface ICreatePermissionEntity {
  name: string;
  parentId: string | null;
  entityType: PermissionType;
  createDefaultActions?: boolean;
}

export interface ICreatedPermissionEntityResponse {
  entity: {
    id: string;
    code: string;
    name: string;
    type: PermissionType;
  };
  actions?: Array<{ id: string; code: string; name: string }>;
}

export interface IUpdatePermission {
  name: string;
}

// --- Roles ---
export type RoleType = "SuperAdmin" | "Admin" | "HR" | "Manager" | "Employee";

export interface IRoleResponse {
  id: string;
  name: string;
  type?: RoleType;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdBy?: string;
}

export interface IRoleListResponse {
  items: IRoleResponse[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  summary: { total: number; active: number; inactive: number };
}

export interface IRoleListDropdownItem {
  id: string;
  name: string;
}

export interface IRoleQueryParams {
  active?: string;
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: string;
}

export interface ICreateRole {
  name: string;
  type?: RoleType;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface IUpdateRole {
  name?: string;
  type?: RoleType;
  description?: string;
  permissionIds?: string[];
  isActive?: boolean;
}

export interface IDeleteRoleResponse {
  roleId: string;
  deleted: boolean;
}

// --- User access ---
export interface IUserRoleInfo {
  userId: string;
  role?: { id: string; name: string; type?: string } | null;
}

export interface IAssignRole {
  roleId: string;
}

export interface IBulkAssignRole {
  roleId: string;
  userIds: string[];
}

export interface IAssignRoleResponse {
  userId: string;
  roleId: string;
  previousRoleId?: string | null;
  assigned: boolean;
}

export interface IAdditionalPermissions {
  userId: string;
  roleId?: string;
  rolePermissions: string[];
  additionalPermissions: string[];
}

export interface IUpdateUserPermissions {
  add?: string[];
  remove?: string[];
}

/** Single module in effective-permissions hierarchy (for sidebar menu) */
export interface IEffectivePermissionHierarchyModule {
  id: string;
  code: string;
  name: string;
  order: number;
  submodules: Array<{
    id: string;
    code: string;
    name: string;
    order: number;
  }>;
}

export interface IEffectivePermissionsResponse {
  userId: string;
  permissions: Array<{ id: string; code: string; name: string }>;
  hierarchy: IEffectivePermissionHierarchyModule[];
}

export interface IDeletePermissionResponse {
  deleted: boolean;
  count: number;
}
