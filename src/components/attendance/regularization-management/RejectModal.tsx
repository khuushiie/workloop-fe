import React from "react";
import { IRegularizationRequest } from "../../../store/apis/attendanceRegularization.api";
import { Modal } from "../../common";
import { TextArea } from "../../common/TextArea";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  request?: IRegularizationRequest;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onReject: () => void;
  processing: string | null;
  loading?: boolean;
  formatDate: (date: string) => string;
}

const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  request,
  rejectReason,
  setRejectReason,
  onReject,
  processing,
  loading,
  formatDate,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Reject Regularization Request" size="md">
    <div className="space-y-4">
      {request ? (
        <p className="text-sm text-slate-600">
          You are about to reject the regularization request for {request?.userName} on{" "}
          {formatDate(request?.date)}.
        </p>
      ) : (
        <p className="text-sm text-slate-600">
          Are you sure you want to reject all the selected regularization requests.
        </p>
      )}
      <div>
        <TextArea
          label="Rejection Reason"
          value={rejectReason}
          onChange={(value) => setRejectReason(value)}
          placeholder="Please provide a reason for rejection..."
          required
          minRows={4}
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading || processing === request?.id}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onReject}
          disabled={loading || processing === request?.id || !rejectReason.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          {(loading || (request?.id && processing === request?.id))
            ? "Rejecting..."
            : "Reject Request"}
        </button>
      </div>
    </div>
  </Modal>
);

export default RejectModal;

