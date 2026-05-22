import { Pencil, Trash2 } from "lucide-react";
import { WorkflowVisualization } from "./WorkflowVisualization";
import { ConfirmationModal, SimpleTooltip } from "../../../common";
import { useState } from "react";
import { getLabelForModules } from "../../../../utils/dynamicworkflow/workflowUtils";

export interface WorkflowModule {
  id: string;
  name: string;
  description: string;
  module: string;
  isActive: boolean;
  levels: { label: string; type: "employee" | "level" }[];
  createdAt: string;
}

interface WorkflowCardProps {
  workflow: WorkflowModule;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-600",
  inactive: "bg-red-100 text-red-600",
};


function formatDateOnly(dateString : string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function WorkflowCard({
  workflow,
  onEdit,
  onDelete,
  isDeleting
}: WorkflowCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 hover:shadow-md transition">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-gray-900 text-md truncate mb-0">
              {workflow.name}
            </h3>

            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusStyles[workflow.isActive ? "active" : "inactive"]}`}
            >
              {workflow.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-2 truncate">
            {workflow.description}
          </p>

          <p className="text-[14px] text-gray-500">
            Module:{" "}
            <span className="font-medium text-gray-900">
              {getLabelForModules(workflow.module)}
            </span>
            <span className="mx-2 ">•</span>
            Created:{" "}
            <span className="font-medium text-gray-900">
             {formatDateOnly(workflow.createdAt)}
            </span>
          </p>
        </div>

        {/* Workflow visualization */}
        <div className="shrink-0 px-3 py-2 max-w-[401px] rounded-md">
          <WorkflowVisualization levels={workflow.levels} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(workflow.id)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100"
          >
            <SimpleTooltip label="Edit" side="top">
              <Pencil className="w-[18px] h-[18px] cursor-pointer text-blue-600" />
            </SimpleTooltip>
          </button>

          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100"
          >
            <SimpleTooltip label="Delete" side="top">
              <Trash2 className="w-[18px] h-[18px] cursor-pointer text-red-600" />
            </SimpleTooltip>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        type="danger"
        isLoading={isDeleting}
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => {
            onDelete(workflow.id);
            setDeleteConfirm(false); // Make sure to close the modal after confirming
        }}
        title="Delete Workflow"
        message="Are you sure you want to delete this workflow?"
      />
    </>
  );
}