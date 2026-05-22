import React from "react";
import Modal, { ModalButton, ModalFooter } from "../../common/Modal";

type AddModuleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  onModuleNameChange: (value: string) => void;
  createDefaultActions: boolean;
  onCreateDefaultActionsChange: (value: boolean) => void;
  onSave: () => void;
  submitting: boolean;
};

const AddModuleModal: React.FC<AddModuleModalProps> = ({
  isOpen,
  onClose,
  moduleName,
  onModuleNameChange,
  createDefaultActions,
  onCreateDefaultActionsChange,
  onSave,
  submitting,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Add Module"
    size="md"
    footer={
      <ModalFooter>
        <ModalButton
          variant="secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </ModalButton>
        <ModalButton variant="primary" onClick={onSave} loading={submitting}>
          Create
        </ModalButton>
      </ModalFooter>
    }
  >
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Module Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          value={moduleName}
          onChange={(e) => onModuleNameChange(e.target.value)}
          disabled={submitting}
          placeholder="e.g. Payroll Management"
          autoFocus
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">
          Default Actions
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={createDefaultActions}
          onClick={() => onCreateDefaultActionsChange(!createDefaultActions)}
          disabled={submitting}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            createDefaultActions ? "bg-primary-600" : "bg-slate-200"
          } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              createDefaultActions ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  </Modal>
);

export default AddModuleModal;
