import { ConfigurableTable, Pagination, Select, Loading, Button, Input, RadioButton } from "../../common";
import { TableColumn } from "../../common/Table";
import type { IPermission } from "../../../types/rbac";
import PermissionTree from "./PermissionTree";
import { PERMISSIONS } from "../../../utils/rbac/permissions";
import PermissionGate from "../../common/PermissionGate";
import { Edit, FileText, RotateCcw, UserPlus } from "lucide-react";
import { TextArea } from "../../common/TextArea";
import { SelectOption } from "../../common/Select";

export type RoleType = "SuperAdmin" | "Admin" | "HR" | "Employee" | "Manager";

/** Aligned with v2 IRoleResponse */
export type RoleRecord = {
  id: string;
  name: string;
  type?: RoleType;
  description?: string;
  permissions: string[];
  isActive: boolean;
  createdBy?: string;
};

type RoleFormCardProps = {
  roleName: string;
  onRoleNameChange: (value: string) => void;
  roleType: RoleType | "";
  roleTypeOptions: SelectOption[];
  onRoleTypeChange: (value: RoleType | "") => void;
  isActive: boolean;
  onStatusChange: (value: boolean) => void;
  roleDesc: string;
  onRoleDescChange: (value: string) => void;
  onSubmit: () => void;
  saving: boolean;
  isEditing?: boolean;
  onCancel?: () => void;
};

export const RoleFormCard: React.FC<RoleFormCardProps> = ({
  roleName,
  onRoleNameChange,
  roleType,
  roleTypeOptions,
  onRoleTypeChange,
  isActive,
  onStatusChange,
  roleDesc,
  onRoleDescChange,
  onSubmit,
  saving,
  isEditing = false,
  onCancel,
}) => (
  <>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">
          {isEditing ? "Update Role" : "Create Role"}
        </h2>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Input
          label="Role Name"
          required
          placeholder="Enter role name"
          value={roleName}
          onChange={(value) => onRoleNameChange(value as string)}
        />
      </div>
      <div className="space-y-2">
        <Select
          label="Role Type"
          required
          options={roleTypeOptions}
          value={roleType}
          onChange={(value) => onRoleTypeChange((value as RoleType) || "")}
          placeholder="Select type"
          clearable
        />
      </div>
    </div>
    <div>
      <RadioButton
        name="roleActive"
        label="Status"
        required
        value={isActive ? "active" : "inactive"}
        onChange={(val) => onStatusChange(val === "active")}
        options={[
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ]}
      />
    </div>
    <div className="space-y-2">
      <TextArea
        label="Description"
        placeholder="Optional notes about this role"
        value={roleDesc}
        onChange={(value) => onRoleDescChange(value)}
        minRows={4}
      />
    </div>
    <div className="flex items-center justify-end gap-2">
      {isEditing && onCancel && (
        <Button appearance="ghost" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      )}

      <Button
        appearance="primary"
        onClick={onSubmit}
        disabled={saving}
        icon={
          isEditing ? (
            <Edit className="w-5 h-5 " />
          ) : (
            <FileText className="w-5 h-5" />
          )
        }
      >
        {saving ? (isEditing ? "Updating..." : "Saving...") : "Submit"}
      </Button>
    </div>
  </>
);

type PermissionCardProps = {
  title?: string;
  icon?: React.ReactNode;
  description?: React.ReactNode;
  selectedCount: number;
  tree: IPermission[];
  value: string[];
  onChange: (ids: string[]) => void;
  lockedIds?: Set<string>;
  disabled?: boolean;
  isBusy?: boolean;
  rounded?: string;
  busyMessage?: string;
};

export const PermissionCard: React.FC<PermissionCardProps> = ({
  title,
  icon,
  description,
  selectedCount,
  tree,
  value,
  onChange,
  lockedIds,
  disabled,
  isBusy,
  rounded = "rounded-2xl",
  busyMessage,
}) => (
  <div className={`${rounded} bg-white border border-slate-200 shadow-soft p-6 space-y-5`}>
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description && (
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 border border-indigo-100 px-3 py-1 rounded-full ">
          {selectedCount} node{selectedCount === 1 ? "" : "s"} selected
        </span>
      </div>
    </div>
    <div className="relative border border-slate-100 rounded-xl bg-slate-50 p-3 flex-1 overflow-auto">
      {isBusy && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <Loading size="md" message={busyMessage} centered />
        </div>
      )}
      <PermissionTree
        tree={tree}
        value={value}
        onChange={onChange}
        lockedIds={lockedIds}
        disabled={disabled}
      />
    </div>
  </div>
);

type RoleTableCardProps = {
  roles: RoleRecord[];
  totalRoles: number;
  roleColumns: TableColumn<RoleRecord>[];
  rolesLoading: boolean;
  rolePage: number;
  rolePageSize: number;
  onRolePageChange: (page: number) => void;
  onRolePageSizeChange: (size: number) => void;
};

export const RoleTableCard: React.FC<RoleTableCardProps> = ({
  roles,
  totalRoles,
  roleColumns,
  rolesLoading,
  rolePage,
  rolePageSize,
  onRolePageChange,
  onRolePageSizeChange,
}) => (
  <div className="bg-white rounded-xl shadow-soft border border-slate-200 flex flex-col">
    <ConfigurableTable<RoleRecord>
      columns={roleColumns}
      data={roles}
      loading={rolesLoading}
      emptyMessage="No roles found. Create a role to get started."
      rowKey="id"
      size="sm"
      configOptions={{ persistenceKey: "access-rights-role-table" }}
      renderColumnSelector={(selector) => (
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-slate-900">
              Roles ({totalRoles})
            </h3>
          </div>
          {selector}
        </div>
      )}
    />
    {totalRoles > 0 && (
      <Pagination
        currentPage={rolePage}
        totalItems={totalRoles}
        itemsPerPage={rolePageSize}
        onPageChange={onRolePageChange}
        onItemsPerPageChange={onRolePageSizeChange}
        itemsPerPageOptions={[5, 10, 20, 50, 100]}
        className="rounded-none border-x-0 border-b-0 border-t"
      />
    )}
  </div>
);

type UserAssignmentCardProps = {
  userOptions: SelectOption[];
  roleOptions: SelectOption[];
  selectedUserIds: string[];
  selectedUserId: string | undefined;
  setSelectedUserid: (value: string | undefined) => void;
  selectedRoleId: string | undefined;
  onUserChange: (value: string[]) => void;
  onRoleChange: (value: string) => void;
  onReset: () => void;
  onAssign: () => void;
  isBulkAssignLoading: boolean;
  canAssign: boolean;
  rolePrefillLoading: boolean;
};

export const UserAssignmentCard: React.FC<UserAssignmentCardProps> = ({
  userOptions,
  roleOptions,
  selectedUserIds,
  selectedUserId,
  setSelectedUserid,
  selectedRoleId,
  onUserChange,
  onRoleChange,
  onReset,
  onAssign,
  isBulkAssignLoading,
  canAssign,
  rolePrefillLoading,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Role Assignment</h2>
        <p className="text-sm text-slate-500">Assign active roles to users.</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
      <div className="space-y-2">
        <Select
          value={selectedUserIds.length ? selectedUserIds : (selectedUserId ? [selectedUserId] : [])}
          label="Select Employee"
          options={userOptions}
          onChange={(value) => {
            if (!value || (Array.isArray(value) && value.length === 0)) {
              onUserChange([]);
              setSelectedUserid("");
              return;
            }

            const ids = Array.isArray(value) ? value.map(String) : [];
            onUserChange(ids);
          }}
          required
          placeholder="Select Employees..."
          searchable
          multiple
          clearable
        />
      </div>
      <div className="space-y-2">
        <Select
          label="Role"
          options={roleOptions}
          value={selectedRoleId}
          onChange={(value) => onRoleChange(value ? String(value) : "")}
          required
          placeholder="Search roles..."
          searchable
          clearable
          disabled={!selectedUserIds.length && !selectedUserId}
          loading={rolePrefillLoading}
        />
      </div>
    </div>
    <div className="flex items-center justify-end gap-2">
      <Button
        appearance="secondary"
        onClick={onReset}
        size="middle"
        icon={<RotateCcw className="w-5 h-5" />}
      >
        Reset
      </Button>

      <Button
        appearance="primary"
        onClick={onAssign}
        disabled={!canAssign && !isBulkAssignLoading}
        loading={isBulkAssignLoading}
        size="middle"
        icon={!isBulkAssignLoading ? <UserPlus className="w-5 h-5" /> : undefined}
      >
        {isBulkAssignLoading ? "Assigning..." : "Assign Role"}
      </Button>
    </div>
  </div>
);

type OverridesSidebarProps = {
  userOptions: SelectOption[];
  selectedUserId: string | undefined;
  onUserChange: (value: string) => void;
  onSubmit: () => void;
  disableSubmit: boolean;
  overridesSaving: boolean;
};

export const OverridesSidebar: React.FC<OverridesSidebarProps> = ({
  userOptions,
  selectedUserId,
  onUserChange,
  onSubmit,
  disableSubmit,
  overridesSaving,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft p-6 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Additional Permissions
        </h2>
        <p className="text-sm text-slate-500">
          Layer extra permissions on top of a user’s base role. Locked
          permissons indicate inherited privileges.
        </p>
      </div>
      <div className="space-y-2">
        <Select
          label="Select Employee"
          required
          options={userOptions}
          value={selectedUserId}
          onChange={(value) => onUserChange(value ? String(value) : "")}
          placeholder="Search Employee..."
          searchable
          clearable
        />
      </div>
      <PermissionGate code={PERMISSIONS.ACCESS_RIGHT_MANAGE}>
        <div className="flex justify-end">
          <Button
            appearance="primary"
            onClick={onSubmit}
            disabled={disableSubmit}
            icon={<FileText className="w-5 h-5" />}
          >
            {overridesSaving ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </PermissionGate>
    </div>
  );
};
