import React from "react";
import Modal, { ModalButton, ModalFooter } from "../../common/Modal";

type AddSubmoduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  submoduleName: string;
  onSubmoduleNameChange: (value: string) => void;
  moduleName: string;
  onSave: () => void;
  submitting: boolean;
};

const AddSubmoduleModal: React.FC<AddSubmoduleModalProps> = ({
  isOpen,
  onClose,
  submoduleName,
  onSubmoduleNameChange,
  moduleName,
  onSave,
  submitting,
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Add Submodule"
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
          Parent Module
        </label>
        <input
          type="text"
          className="w-full h-10 px-3 border border-slate-300 rounded-lg bg-slate-50 text-sm"
          value={moduleName}
          disabled
        />
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          Submodule Name<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          value={submoduleName}
          onChange={(e) => onSubmoduleNameChange(e.target.value)}
          disabled={submitting}
          placeholder="e.g. Export Reports"
          autoFocus
        />
      </div>
    </div>
  </Modal>
);

export default AddSubmoduleModal;
