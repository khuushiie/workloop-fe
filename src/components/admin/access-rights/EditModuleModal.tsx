import React, { useEffect } from "react";
import toast from "react-hot-toast";
import Modal, { ModalButton, ModalFooter } from "../../common/Modal";
import type { IPermission } from "../../../types/rbac";

type EditModuleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  availableModules: IPermission[];
  getSubmodulesForModule: IPermission[];
  editModuleSelectedModuleId: string;
  onModuleSelect: (value: string) => void;
  editModuleSelectedSubmoduleId: string;
  onSubmoduleSelect: (value: string) => void;
  editModuleNewSubmoduleName: string;
  onNewSubmoduleChange: (value: string) => void;
  editModuleNewActionName: string;
  onNewActionChange: (value: string) => void;
  onSave: () => void;
  submitting: boolean;
  error: string | null;
  success: string | null;
  // New props for editing existing modules/submodules
  editingNode?: IPermission | null;
  editModuleName?: string;
  onEditModuleNameChange?: (value: string) => void;
  onUpdateName?: () => void;
};

const EditModuleModal: React.FC<EditModuleModalProps> = ({
  isOpen,
  onClose,
  availableModules,
  getSubmodulesForModule,
  editModuleSelectedModuleId,
  onModuleSelect,
  editModuleSelectedSubmoduleId,
  onSubmoduleSelect,
  editModuleNewSubmoduleName,
  onNewSubmoduleChange,
  editModuleNewActionName,
  onNewActionChange,
  onSave,
  submitting,
  error,
  success,
  editingNode,
  editModuleName,
  onEditModuleNameChange,
  onUpdateName,
}) => {
  const isEditingExisting = !!editingNode;
  const isModule = editingNode?.type === "MODULE";
  const isSubmodule = editingNode?.type === "SUBMODULE";

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEditingExisting
          ? `Edit ${isModule ? "Module" : "Submodule"} Name`
          : "Edit Module Permissions"
      }
      size="2xl"
      footer={
        <ModalFooter>
          <ModalButton
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </ModalButton>
          {isEditingExisting ? (
            <ModalButton
              variant="primary"
              onClick={onUpdateName}
              loading={submitting}
            >
              Save Changes
            </ModalButton>
          ) : (
            <ModalButton
              variant="primary"
              onClick={onSave}
              loading={submitting}
            >
              Add Permission
            </ModalButton>
          )}
        </ModalFooter>
      }
    >
      <div className="space-y-6">
        {isEditingExisting ? (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                {isModule ? "Module" : "Submodule"} Name
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                value={editModuleName || ""}
                onChange={(e) => onEditModuleNameChange?.(e.target.value)}
                disabled={submitting}
                placeholder={`Enter ${isModule ? "module" : "submodule"} name`}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Select Module<span className="text-red-500">*</span>
              </label>
              <select
                className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                value={editModuleSelectedModuleId}
                onChange={(e) => onModuleSelect(e.target.value)}
                disabled={submitting}
              >
                <option value="">Choose a module</option>
                {availableModules.map((module) => (
                  <option key={module._id} value={module._id}>
                    {module.name}
                  </option>
                ))}
              </select>
            </div>

            {editModuleSelectedModuleId && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Select Existing Submodule
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    value={editModuleSelectedSubmoduleId}
                    onChange={(e) => onSubmoduleSelect(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">
                      None (add action directly to module)
                    </option>
                    {getSubmodulesForModule.map((submodule) => (
                      <option key={submodule.id} value={submodule.id}>
                        {submodule.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    New Submodule Name
                  </label>
                  <input
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="e.g. Export"
                    value={editModuleNewSubmoduleName}
                    onChange={(e) => onNewSubmoduleChange(e.target.value)}
                    disabled={submitting || !!editModuleSelectedSubmoduleId}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Action<span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    value={editModuleNewActionName}
                    onChange={(e) => onNewActionChange(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select an action</option>
                    <option value="View">View</option>
                    <option value="View & Edit">View & Edit</option>
                  </select>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default EditModuleModal;
