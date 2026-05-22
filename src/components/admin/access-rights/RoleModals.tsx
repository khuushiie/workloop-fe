import React from "react";
import Modal, { ModalButton, ModalFooter } from "../../common/Modal";
import ConfirmationModal from "../../common/ConfirmationModal";
import type { IPermission } from "../../../types/rbac";
import PermissionTree from "./PermissionTree";
import { RoleRecord, RoleType } from "./RoleCards";
import { TextArea } from "../../common/TextArea";

type RoleViewModalProps = {
  isOpen: boolean;
  loading: boolean;
  viewRole: RoleRecord | null;
  viewNodeIds: string[];
  tree: IPermission[];
  onClose: () => void;
};

export const RoleViewModal: React.FC<RoleViewModalProps> = ({
  isOpen,
  loading,
  viewRole,
  viewNodeIds,
  tree,
  onClose,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={viewRole ? `View Role: ${viewRole.name}` : "View Role"}
    size="3xl"
    loading={loading}
  >
    {viewRole ? (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-slate-500">Role Name</p>
            <p className="text-base font-medium text-slate-900">
              {viewRole.name}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Role Type</p>
            <p className="text-base text-slate-900">{viewRole.type || "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-500">Status</p>
            <p className="text-base text-slate-900">
              {viewRole.isActive !== false ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
        {viewRole.description && (
          <div>
            <p className="text-xs uppercase text-slate-500">Description</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {viewRole.description}
            </p>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-slate-900 mb-2">Permissions</p>
          <PermissionTree
            tree={tree}
            value={viewNodeIds}
            onChange={() => {}}
            disabled
          />
        </div>
      </div>
    ) : (
      <p className="text-sm text-slate-500">No role data available.</p>
    )}
  </Modal>
);

type RoleEditModalProps = {
  isOpen: boolean;
  loading: boolean;
  saving: boolean;
  tree: IPermission[];
  editRole: RoleRecord | null;
  editRoleName: string;
  editRoleType: RoleType | "";
  editRoleDesc: string;
  editIsActive: boolean;
  editNodeIds: string[];
  allTreeNodeIds: string[];
  onClose: () => void;
  onSave: () => void;
  onRoleNameChange: (value: string) => void;
  onRoleTypeChange: (value: RoleType | "") => void;
  onRoleDescChange: (value: string) => void;
  onRoleStatusChange: (value: boolean) => void;
  onNodeIdsChange: (ids: string[]) => void;
};

export const RoleEditModal: React.FC<RoleEditModalProps> = ({
  isOpen,
  loading,
  saving,
  tree,
  editRole,
  editRoleName,
  editRoleType,
  editRoleDesc,
  editIsActive,
  editNodeIds,
  allTreeNodeIds,
  onClose,
  onSave,
  onRoleNameChange,
  onRoleTypeChange,
  onRoleDescChange,
  onRoleStatusChange,
  onNodeIdsChange,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={editRole ? `Edit Role: ${editRole.name}` : "Edit Role"}
    size="4xl"
    loading={loading}
    footer={
      <ModalFooter>
        <ModalButton variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </ModalButton>
        <ModalButton
          variant="primary"
          onClick={onSave}
          loading={saving}
          disabled={loading}
        >
          Save Changes
        </ModalButton>
      </ModalFooter>
    }
  >
    {editRole ? (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="Enter role name"
              value={editRoleName}
              onChange={(e) => onRoleNameChange(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Role Type<span className="text-red-500">*</span>
            </label>
            <select
              className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              value={editRoleType}
              onChange={(e) =>
                onRoleTypeChange(e.target.value as RoleType | "")
              }
              disabled={loading || saving}
            >
              <option value="">Select type</option>
              <option value="Admin">Admin</option>
              <option value="HR">HR</option>
              <option value="Employee">Employee</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <span className="block text-sm font-semibold text-slate-700">
            Status<span className="text-red-500">*</span>
          </span>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-400">
              <input
                type="radio"
                name="editRoleActive"
                checked={editIsActive}
                onChange={() => onRoleStatusChange(true)}
                disabled={loading || saving}
              />
              Active
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary-400">
              <input
                type="radio"
                name="editRoleActive"
                checked={!editIsActive}
                onChange={() => onRoleStatusChange(false)}
                disabled={loading || saving}
              />
              Inactive
            </label>
          </div>
        </div>
        <div className="space-y-2">
          <TextArea
            label="Description"
            placeholder="Optional notes about this role"
            value={editRoleDesc}
            onChange={(value) => onRoleDescChange(value)}
            minRows={4}
            disabled={loading || saving}
          />
        </div>
        <div className="border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-600 mb-4">
            Update the permissions assigned to this role. Changes apply to all
            users currently assigned to this role.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              {editNodeIds.length} node{editNodeIds.length === 1 ? "" : "s"}{" "}
              selected
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => onNodeIdsChange(allTreeNodeIds)}
                disabled={loading || saving || !allTreeNodeIds.length}
              >
                Select All
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 disabled:opacity-60"
                onClick={() => onNodeIdsChange([])}
                disabled={loading || saving || !editNodeIds.length}
              >
                Clear All
              </button>
            </div>
          </div>
          <PermissionTree
            key={editRole?.id}
            tree={tree}
            value={editNodeIds}
            onChange={onNodeIdsChange}
            disabled={loading || saving}
          />
        </div>
      </div>
    ) : (
      <p className="text-sm text-slate-500">No role selected.</p>
    )}
  </Modal>
);

type DeleteRoleModalProps = {
  isOpen: boolean;
  deleteTarget: RoleRecord | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
};

export const DeleteRoleModal: React.FC<DeleteRoleModalProps> = ({
  isOpen,
  deleteTarget,
  onClose,
  onConfirm,
  loading,
}) => (
  <ConfirmationModal
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Role"
    message={
      deleteTarget
        ? `Are you sure you want to delete the "${deleteTarget.name}"role?`
        : "Are you sure you want to  delete this role ?"
    }
    type="danger"
    confirmText="Delete"
    cancelText="Cancel"
    isLoading={loading}
  />
);

type DeleteBlockedInfo = {
  roleName: string;
  assignedUserCount: number;
  assignedUsers: Array<{
    id: string;
    name?: string;
    email?: string;
    workEmail?: string;
    username?: string;
  }>;
};

type DeleteBlockedModalProps = {
  info: DeleteBlockedInfo | null;
  onClose: () => void;
};

export const DeleteBlockedModal: React.FC<DeleteBlockedModalProps> = ({
  info,
  onClose,
}) => (
  <Modal
    isOpen={!!info}
    onClose={onClose}
    title="Role Assigned To Users"
    size="md"
  >
    {info ? (
      <div className="space-y-4">
        <p className="text-sm text-slate-700">
          The role <span className="font-semibold">{info.roleName}</span> is
          currently assigned to{" "}
          <span className="font-semibold">{info.assignedUserCount}</span>{" "}
          {info.assignedUserCount === 1 ? "user" : "users"}. Please reassign or
          remove the role from these users before attempting to deactivate it.
        </p>
        <div>
          <p className="text-xs uppercase text-slate-500 mb-2">
            Sample Assigned Users
          </p>
          <ul className="space-y-2">
            {(info.assignedUsers || []).map((user) => (
              <li key={user.id} className="flex flex-col text-sm text-slate-800">
                <span>
                  {user.name ||
                    user.username ||
                    user.workEmail ||
                    "Unnamed User"}
                </span>
                {user.workEmail && (
                  <span className="text-xs text-slate-500">
                    {user.workEmail}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {info.assignedUserCount > (info.assignedUsers || []).length && (
            <p className="text-xs text-slate-500 mt-1">
              …and {info.assignedUserCount - (info.assignedUsers || []).length}{" "}
              more.
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <ModalButton variant="primary" onClick={onClose}>
            Got it
          </ModalButton>
        </div>
      </div>
    ) : (
      <p className="text-sm text-slate-500">No assignment details available.</p>
    )}
  </Modal>
);
