import React, { useEffect, useMemo, useState } from "react";
import Modal, { ModalFooter, ModalButton } from "../common/Modal";
import Badge from "../common/Badge";
import {formatDate, formatLocalDate } from "../../utils/timeUtils";
import { CheckCircle, XCircle } from "lucide-react";
import { capitalizeWords } from "../../utils/nameUtils";
import toast from "react-hot-toast";
import { ProjectViewRecord } from "../../store/apis/resource-allocation/project-management.api";

interface ViewProjectModalProps {
  project: ProjectViewRecord | null;
  loading: boolean;
  onClose: () => void;
}

export interface CategoryOption {
  displayName: string;
  filterCode: string;
}

const ViewProjectModal: React.FC<ViewProjectModalProps> = ({
  project,
  loading,
  onClose,
}) => {


  if (!project) return null;

const pocFullName =
  project?.poc && typeof project?.poc === "object"
    ? `${project?.poc?.firstName || ""} ${project?.poc?.lastName || ""}`.trim()
    : "—";

  return (
    <Modal isOpen={!!project} onClose={onClose} title="Project Details" loading={loading} size="lg">
      <div className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <div className="text-sm text-slate-500">Project Name</div>
            <div className="text-sm font-medium text-slate-900">{project?.name}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Client Name</div>
            <div className="text-sm font-medium text-slate-900">{project?.clientName}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Category</div>
            <div className="text-sm font-medium text-slate-900">{project?.category}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Domain</div>
            <div className="text-sm font-medium text-slate-900">{capitalizeWords(project?.domain)}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Priority</div>
            <div className="text-sm font-medium text-slate-900">{project?.priority}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Billable</div>
            <div className="text-sm font-medium text-slate-900">{project?.billable ? "Yes" : "No"}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Capacity</div>
            <div className="text-sm font-medium text-slate-900">{project?.capacity}</div>
          </div>

          {/* FIXED POC */}
          <div>
            <div className="text-sm text-slate-500">POC</div>
            <div className="text-sm font-medium text-slate-900">{capitalizeWords(pocFullName)}</div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Status</div>
            <Badge variant={project?.status?.toLocaleLowerCase() === "active" ? "green" : "red"}>
              <span className="flex items-center gap-2">
                {project?.status?.toLocaleLowerCase() === "active" ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600" />
                )}
                {project?.status?.toLocaleLowerCase() === "active" ? "Active" : "Inactive"}
              </span>
            </Badge>
          </div>

          <div>
            <div className="text-sm text-slate-500">Created By</div>
            <div className="text-sm font-medium text-slate-900">
               {typeof project?.createdBy === "object" && project?.createdBy !== null
    ? capitalizeWords(`${project?.createdBy?.firstName || ""} ${project?.createdBy?.lastName || ""}`.trim())
    : "—"}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">Start Date</div>
            <div className="text-sm font-medium text-slate-900">
              {formatDate(project?.startDate)}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-500">End Date</div>
            <div className="text-sm font-medium text-slate-900">
              {formatDate(project.endDate)}
            </div>
          </div>

        </div>

        {project?.status === "in-active" && (
          <div>
            <div className="text-sm text-slate-500">Inactive Reason</div>
            <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
              {project?.inActiveReason || "—"}
            </div>
          </div>
        )}

        <div>
          <div className="text-sm text-slate-500">Description</div>
          <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
            {project?.description}
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-500">Allocated Resources</div>
          {project?.allocatedResources?.length > 0 ? (
            <ul className="list-disc ml-5">
              {project?.allocatedResources.map((r, i) => (
                <li key={i} className="text-sm font-medium text-slate-800">
                  {capitalizeWords(`${r?.userId?.firstName || ""} ${r?.userId?.lastName || ""}`)} — {r.allocationPercentage}%
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-slate-700">No resources allocated</div>
          )}
        </div>
        {
          project?.status.toLocaleLowerCase() === "in-active" || project?.status.toLocaleLowerCase() === "inactive" && (
            <div>
              <div className="text-sm text-slate-500">Inactive Reason</div>
              <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap">
                {project?.inActiveReason || "—"}
              </div>
            </div>
          )
        }

        <ModalFooter>
          <ModalButton variant="secondary" onClick={onClose}>
            Close
          </ModalButton>
        </ModalFooter>
      </div>
    </Modal>
  );
};

export default ViewProjectModal;
