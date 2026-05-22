import React, { useState } from "react";
import toast from "react-hot-toast";
import Modal, { ModalFooter, ModalButton } from "../../common/Modal";
import Input from "../../common/Input";
import { useRequestMoreUsersMutation } from "../../../store/apis/organization.api";
import { AlertTriangle } from "lucide-react";

interface UserLimitExceededDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName?: string;
}

export const UserLimitExceededDialog: React.FC<UserLimitExceededDialogProps> = ({
  isOpen,
  onClose,
  organizationId,
  organizationName,
}) => {
  const [requestedCount, setRequestedCount] = useState<string>("1");
  const [requestUsers, { isLoading: isRequesting }] = useRequestMoreUsersMutation();

  const handleRequest = async () => {
    const num = parseInt(requestedCount, 10);
    if (isNaN(num) || num < 1) {
      toast.error("Please enter a valid number (minimum 1)");
      return;
    }

    try {
      await requestUsers({ organizationId, requestedCount: num }).unwrap();
      toast.success("Request submitted successfully. HR and Operations have been notified.");
      setRequestedCount("1");
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string }; message?: string })?.data?.message ??
        (err as { message?: string })?.message ??
        "Failed to submit request";
      toast.error(message);
    }
  };

  const handleClose = () => {
    if (!isRequesting) {
      setRequestedCount("1");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="User Limit Exceeded"
      size="md"
      loading={isRequesting}
      maskClosable={!isRequesting}
      closable={!isRequesting}
      footer={
        <ModalFooter>
          <ModalButton variant="secondary" onClick={handleClose} disabled={isRequesting}>
            Cancel
          </ModalButton>
          <ModalButton variant="primary" onClick={handleRequest} loading={isRequesting}>
            Send Request
          </ModalButton>
        </ModalFooter>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-3 rounded-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-slate-900">
              You have exceeded the number of users as per your plan.
            </p>
            <p className="mt-1 text-slate-700">
              {organizationName && (
                <span className="font-medium">{organizationName}</span>
              )}
              {" "}— Please request additional users. A request will be sent to HR and Operations.
            </p>
          </div>
        </div>

        <div>
          <Input
            label="Number of additional users needed"
            type="number"
            min={1}
            placeholder="e.g. 5"
            value={requestedCount}
            onChange={(val) => {
              const str = String(val ?? "");
              const num = str.replace(/[^\d]/g, "");
              setRequestedCount(num || "1");
            }}
          />
        </div>
      </div>
    </Modal>
  );
};
