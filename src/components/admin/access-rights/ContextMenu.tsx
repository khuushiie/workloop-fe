import React, { useEffect, useRef } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { IPermission } from "../../../types/rbac";

interface ContextMenuProps {
  node: IPermission | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAddModule?: () => void;
  onAddSubmodule?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canManage?: boolean;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  node,
  position,
  onClose,
  onAddModule,
  onAddSubmodule,
  onEdit,
  onDelete,
  canManage = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate adjusted position immediately
  const calculateAdjustedPosition = (pos: { x: number; y: number }) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;
    const menuMinWidth = 160;
    const estimatedItemHeight = 40;

    // Estimate menu height based on number of items
    let estimatedHeight = 8; // py-1 padding
    if (!node || (node.code === "HRMS" && node.type === "MODULE")) {
      estimatedHeight += estimatedItemHeight; // Add Module
    } else {
      const isModule = node.type === "MODULE";
      if (isModule) estimatedHeight += estimatedItemHeight; // Add Submodule
      if (isModule || node.type === "SUBMODULE") {
        estimatedHeight += estimatedItemHeight; // Edit
        estimatedHeight += estimatedItemHeight; // Delete
      }
    }

    let adjustedX = pos.x;
    let adjustedY = pos.y;

    // Adjust horizontal position if menu would overflow on the right
    if (pos.x + menuMinWidth + padding > viewportWidth) {
      adjustedX = Math.max(padding, viewportWidth - menuMinWidth - padding);
    }
    // Adjust horizontal position if menu would overflow on the left
    if (adjustedX < padding) {
      adjustedX = padding;
    }

    // Adjust vertical position if menu would overflow at the bottom
    if (pos.y + estimatedHeight + padding > viewportHeight) {
      adjustedY = Math.max(padding, viewportHeight - estimatedHeight - padding);
    }
    // Adjust vertical position if menu would overflow at the top
    if (adjustedY < padding) {
      adjustedY = padding;
    }

    return { x: adjustedX, y: adjustedY };
  };

  // Refine position after render with actual dimensions
  useEffect(() => {
    if (!position || !menuRef.current) return;

    const menu = menuRef.current;
    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Check right edge
    if (menuRect.right + padding > viewportWidth) {
      adjustedX = viewportWidth - menuRect.width - padding;
    }
    // Check left edge
    if (menuRect.left < padding) {
      adjustedX = padding;
    }

    // Check bottom edge
    if (menuRect.bottom + padding > viewportHeight) {
      adjustedY = viewportHeight - menuRect.height - padding;
    }
    // Check top edge
    if (menuRect.top < padding) {
      adjustedY = padding;
    }

    // Only update if position changed significantly
    if (
      Math.abs(adjustedX - position.x) > 1 ||
      Math.abs(adjustedY - position.y) > 1
    ) {
      menu.style.left = `${adjustedX}px`;
      menu.style.top = `${adjustedY}px`;
    }
  }, [position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (position) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [position, onClose]);

  if (!position) return null;

  // Calculate initial adjusted position
  const finalPosition = calculateAdjustedPosition(position);

  // HRMS root menu (when node is null or node is HRMS root)
  if (!node || (node.code === "HRMS" && node.type === "MODULE")) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-soft py-1 min-w-[160px]"
        style={{
          left: `${finalPosition.x}px`,
          top: `${finalPosition.y}px`,
        }}
      >
        {onAddModule && canManage && (
          <button
            onClick={() => {
              onAddModule();
              onClose();
            }}
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        )}
      </div>
    );
  }

  const isModule = node.type === "MODULE";
  const isSubmodule = node.type === "SUBMODULE";

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-soft py-1 min-w-[160px]"
      style={{
        left: `${finalPosition.x}px`,
        top: `${finalPosition.y}px`,
      }}
    >
      {isModule && onAddSubmodule && canManage && (
        <button
          onClick={() => {
            onAddSubmodule();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Submodule</span>
        </button>
      )}
      {(isModule || isSubmodule) && onEdit && canManage && (
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-100 flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </button>
      )}
      {(isModule || isSubmodule) && onDelete && canManage && (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete</span>
        </button>
      )}
    </div>
  );
};

export default ContextMenu;
