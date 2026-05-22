import React from "react";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import {
  getWorkflowStatusFallbackLabel,
  LeaveTypeLabel,
  LeaveTypesEnum,
  WorkflowStatusCode,
} from "../../utils/constants";
import { formatDate } from "../../utils/timeUtils";
import { getWorkflowStatusVariant } from "../../utils/badgeVariants";
import Badge from "../common/Badge";
import { capitalizeWords } from "../../utils/nameUtils";

export interface LeaveViewRecord {
  id: string;
  userId: string;
  employeeId?: string;
  userName: string;
  leaveType: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: WorkflowStatusCode;
  statusLabel?: string;
  currentApproverName?: string;
  appliedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  department?: string;
  departmentName?: string;
  reportingManagerName?: string;
  functionalManagerName?: string;
  approvedByName?: string;
}

interface LeaveViewModalProps {
  record: LeaveViewRecord | null;
  onClose: () => void;
}

const LeaveViewModal: React.FC<LeaveViewModalProps> = ({ record, onClose }) => {

  return (
    <Modal isOpen={!!record} onClose={onClose} title="Leave Details" size="lg">

      {record && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500">Employee ID</div>
              <div className="text-sm font-medium text-slate-900">
                {record.employeeId || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">User</div>
              <div className="text-sm font-medium text-slate-900">
                {capitalizeWords(record.userName)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Department</div>
              <div className="text-sm font-medium text-slate-900">
                {record.departmentName || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Reporting Manager</div>
              <div className="text-sm font-medium text-slate-900">
                {capitalizeWords(record.reportingManagerName) || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Functional Manager</div>
              <div className="text-sm font-medium text-slate-900">
                {capitalizeWords(record.functionalManagerName) || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Type</div>
              <div className="text-sm font-medium text-slate-900">
             {LeaveTypeLabel[record.leaveType as LeaveTypesEnum] || record.leaveTypeName || "-"}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Days</div>
              <div className="text-sm font-medium text-slate-900">
                {record.days}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Duration</div>
              <div className="text-sm font-medium text-slate-900">
                {formatDate(record.startDate)} → {formatDate(record.endDate)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Status</div>

              <Badge
                variant={getWorkflowStatusVariant(record.status)}
                size="small"
              >
                {record.statusLabel ||
                  getWorkflowStatusFallbackLabel(
                    record.status,
                    record.currentApproverName
                  )}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-slate-500">Applied Date</div>
              <div className="text-sm font-medium text-slate-900">
           
             {record.appliedDate
  ? formatDate(record.appliedDate.split("T")[0])
  : "-"}
            
              </div>
            </div>
            {record.approvedBy && (
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500">Approved By / Date</div>
                <div className="text-sm font-medium text-slate-900">
                  {capitalizeWords(record.approvedByName)}{" "}
                  on {formatDate(record.appliedDate?.split("T")[0] || "")}
                </div>
              </div>
            )}
            {record.rejectionReason && (
              <div className="md:col-span-2">
                <div className="text-sm text-slate-500">Rejection Reason</div>
                <div className="text-sm font-medium text-slate-900">
                  {record.rejectionReason}
                </div>
              </div>
            )}
            <div className="md:col-span-2">
              <div className="text-sm text-slate-500">Reason</div>
              <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
                {record.reason}
              </div>
            </div>
          </div>
          <ModalFooter>
            <ModalButton variant="secondary" onClick={onClose}>
              Close
            </ModalButton>
          </ModalFooter>
        </div>
      )}
    </Modal>
  );
};

export default LeaveViewModal;
