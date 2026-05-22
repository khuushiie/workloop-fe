import { RegularizationType } from "../../../types";
import { IRegularizationRequest } from "../../../store/apis/attendanceRegularization.api";
import {
  getWorkflowStatusFallbackLabel,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
  WorkflowStatusCode,
} from "../../../utils/constants";
import { Modal } from "../../common";

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IRegularizationRequest;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getRegularizationTypeLabel: (type: RegularizationType) => string;
  getStatusColor: (status: WorkflowStatusCode) => string;
}

const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  formatDate,
  formatTime,
  getRegularizationTypeLabel,
  getStatusColor,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Regularization Request Details" size="lg">
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Employee</label>
          <p className="mt-1 text-sm text-slate-900">
            {request.fullName} ({request.employeeId})
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Department</label>
          <p className="mt-1 text-sm text-slate-900">{request.departmentName}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Date</label>
          <p className="mt-1 text-sm text-slate-900">{formatDate(request.date)}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Type</label>
          <p className="mt-1 text-sm text-slate-900">
            {request.regularizationTypeName}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Requested Time</label>
          <p className="mt-1 text-sm text-slate-900">
            {formatTime(request.requestedCheckInTime)} - {formatTime(request.requestedCheckOutTime)}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Actual Time</label>
          <p className="mt-1 text-sm text-slate-900">
            {formatTime(request.actualCheckInTime || "")} - {formatTime(request.actualCheckOutTime || "")}
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700">Status</label>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}
          >
            {(request as IRegularizationRequest & { statusLabel?: string, currentApproverName?: string }).statusLabel ||
              getWorkflowStatusFallbackLabel(request.status, (request as IRegularizationRequest & { currentApproverName?: string }).currentApproverName)}
          </span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700">Reason</label>
        <p className="mt-1 text-sm text-slate-900">{request.reason}</p>
      </div>
      {(() => {
        const extendedRequest = request as IRegularizationRequest & { approvedByName?: string };
        const approverName = extendedRequest.approvedByName;
        return approverName ? (
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              {isApprovedWorkflowStatus(request.status)
                ? "Approved By"
                : isRejectedWorkflowStatus(request.status)
                  ? "Rejected By"
                  : "Processed By"}
            </label>
            <p className="mt-1 text-sm text-slate-900">{approverName}</p>
          </div>
        ) : null;
      })()}
      {request.rejectionReason && (
        <div>
          <label className="block text-sm font-semibold text-slate-700">Rejection Reason</label>
          <p className="mt-1 text-sm text-red-600">{request.rejectionReason}</p>
        </div>
      )}
    </div>
  </Modal>
);

export default RequestDetailsModal;

