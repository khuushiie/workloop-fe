import React from "react";
import ConfirmationModal from "../../common/ConfirmationModal";
import type { IPermission } from "../../../types/rbac";

type DeletePermissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  node: IPermission | null;
  onConfirm: () => void;
  submitting: boolean;
  error: string | null;
};

const DeletePermissionModal: React.FC<DeletePermissionModalProps> = ({
  isOpen,
  onClose,
  node,
  onConfirm,
  submitting,
  error,
}) => {
  if (!node) return null;

  const isModule = node.type === "MODULE";
  const isSubmodule = node.type === "SUBMODULE";

  // Build the message with additional warnings
  let message = `Are you sure you want to delete ${
    isModule ? "module" : "submodule"
  } "${node.name}"?`;

  if (isModule) {
    message +=
      " This will also delete all submodules and actions under this module.";
  }

  message += " This action cannot be undone.";

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Confirmation"
      message={message}
      type="danger"
      confirmText="Delete"
      cancelText="Cancel"
      isLoading={submitting}
    />
  );
};

export default DeletePermissionModal;
