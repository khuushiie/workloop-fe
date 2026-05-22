import { Pencil, Trash2, Users } from "lucide-react";
import { SimpleTooltip, ConfirmationModal } from "../../../common";
import { useState } from "react";

export interface ApprovalGroup {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive";
  members: string[]; // Array of employee IDs or Names
  createdAt: string;
}

interface GroupCardProps {
  group: ApprovalGroup;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-600",
  inactive: "bg-red-100 text-red-600",
};

export function GroupCard({
  group,
  onEdit,
  onDelete,
}: GroupCardProps) {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-6 hover:shadow-md transition">
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-gray-900 text-md truncate mb-0">
              {group.name}
            </h3>

            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${statusStyles[group.status]}`}
            >
              {group.status}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-2 truncate">
            {group.description}
          </p>

          <p className="text-[14px] text-gray-500 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            <span className="font-medium text-gray-900">
              {group.members.length} Members
            </span>
            <span className="mx-2">•</span>
            Created: {group.createdAt}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(group.id)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors"
          >
            <SimpleTooltip label="Edit" side="top">
              <Pencil className="w-[18px] h-[18px] cursor-pointer text-blue-600" />
            </SimpleTooltip>
          </button>

          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors"
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
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={() => {
          onDelete(group.id);
          setDeleteConfirm(false);
        }}
        title="Delete Group"
        message={`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`}
      />
    </>
  );
}