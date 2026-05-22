import React from "react";
import {
  getWorkflowStatusColor,
  getWorkflowStatusFallbackLabel,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
} from "../../utils/constants";
import { IAttendanceRegularization } from "../../types/regularization.types";
import { Modal } from "../common";
import { useTimezone } from "../../hooks/useTimezone";

interface ARViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IAttendanceRegularization | null;
}

const ARViewModal: React.FC<ARViewModalProps> = ({ isOpen, onClose, request }) => {
  const { formatDate, formatTime } = useTimezone();
  
  if (!request) {
    return null;
  }

  const statusColor = getWorkflowStatusColor(request.status);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Attendance Regularization Details" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Employee</p>
            <p className="text-sm text-slate-900">
              {request.userName} ({request.employeeId})
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Department</p>
            <p className="text-sm text-slate-900">{request.department ?? "N/A"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Date</p>
            <p className="text-sm text-slate-900">{formatDate(request.date)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Regularization Type</p>
            <p className="text-sm text-slate-900">
              {request.regularizationType?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Requested Time</p>
            <p className="text-sm text-slate-900">
              {formatTime(request.requestedCheckInTime)} - {formatTime(request.requestedCheckOutTime)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Actual Time</p>
            <p className="text-sm text-slate-900">
              {formatTime(request.actualCheckInTime)} - {formatTime(request.actualCheckOutTime)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Status</p>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
              {getWorkflowStatusFallbackLabel(request.status)}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Applied On</p>
            <p className="text-sm text-slate-900">{formatDate(request.appliedDate)}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-500">Reason</p>
          <p className="mt-1 text-sm text-slate-900 whitespace-pre-wrap">{request.reason}</p>
        </div>

        {isApprovedWorkflowStatus(request.status) && request.approvedByName && (
          <div>
            <p className="text-sm font-medium text-slate-500">Approved By</p>
            <p className="text-sm text-slate-900">{request.approvedByName}</p>
          </div>
        )}

        {isRejectedWorkflowStatus(request.status) && request.rejectionReason && (
          <div>
            <p className="text-sm font-medium text-slate-500">Rejection Reason</p>
            <p className="text-sm text-red-600">{request.rejectionReason}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ARViewModal;


