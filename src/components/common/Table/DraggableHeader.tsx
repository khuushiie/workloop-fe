import React, { useLayoutEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

/**
 * Props for the DraggableHeader component
 */
interface DraggableHeaderProps {
  /** Unique ID for the sortable item (usually column.key) */
  id: string;
  /** Whether the column can be reordered */
  isReorderable?: boolean;
  /** The content to be rendered within the draggable container */
  children: React.ReactNode;
}

/**
 * Component that wraps table header content to enable drag-and-drop reordering
 */
export const DraggableHeader: React.FC<DraggableHeaderProps> = ({ id, isReorderable = true, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ 
    id, 
    disabled: !isReorderable 
  });

  /**
   * High-performance synchronization:
   * Publishes the current sortable transform to a CSS variable on the parent table.
   * This allows the Table body cells to shift concurrently with their headers.
   */
  useLayoutEffect(() => {
    if (containerRef.current) {
      const table = containerRef.current.closest('table');
      if (table) {
        const x = transform ? transform.x : 0;
        table.style.setProperty(`--col-drag-x-${id}`, `${x}px`);
      }
    }
  }, [transform, id]);

  const style = {
    // The visual shifts are now handled by the parent <th> in Table.tsx
    // to prevent "double-speed" movement.
    zIndex: isDragging ? 50 : 'auto',
  } as React.CSSProperties;

  /**
   * Prevents accidental sorting clicks when a drag interaction is intended
   */
  const handleClick = (e: React.MouseEvent) => {
    if (!isReorderable) return;
    // If we were dragging, prevent the click from reaching the sort handler in parent
    if (transform) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (containerRef as any).current = node;
      }}
      style={style}
      {...(isReorderable ? attributes : {})}
      {...(isReorderable ? listeners : {})}
      onClickCapture={handleClick}
      className={`
        group flex items-center gap-2 h-full w-full select-none touch-none
        ${isReorderable ? 'cursor-grab active:cursor-grabbing' : ''}
        transition-all duration-200
      `}
    >
      {/* Main header content (Title, sorting icons) */}
      <div className={`flex-1 min-w-0 ${isReorderable ? 'pointer-events-none' : ''}`}>
        {children}
      </div>

      {/* Drag handle icon - visual hint */}
      {isReorderable && (
        <div
          className="
            flex items-center justify-center p-1.5
            opacity-40 group-hover:opacity-100 
            transition-all duration-200
          "
        >
          <GripVertical size={14} className="text-slate-400" />
        </div>
      )}
    </div>
  );
};
