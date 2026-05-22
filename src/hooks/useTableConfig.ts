import { useState, useMemo, useEffect } from "react";
import { TableColumn } from "../components/common/Table";

/**
 * Configuration options for the table system
 */
export interface TableConfigOptions {
  /** Unique key for persistent storage (localStorage) */
  persistenceKey?: string;
}

/**
 * Hook to manage table column visibility and reordering state
 */
export const useTableConfig = <T extends object>(
  allColumns: TableColumn<T>[],
  options?: TableConfigOptions
) => {
  const { persistenceKey } = options || {};

  // Initialize ordered keys from storage or defaults
  const [orderedKeys, setOrderedKeys] = useState<string[]>(() => {
    if (persistenceKey) {
      const saved = localStorage.getItem(`${persistenceKey}_order`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error("Error parsing table order from localStorage", e);
        }
      }
    }
    return allColumns.map((col) => col.key);
  });

  // Initialize visible keys from storage or defaults
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => {
    if (persistenceKey) {
      const saved = localStorage.getItem(`${persistenceKey}_visibility`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          console.error("Error parsing table visibility from localStorage", e);
        }
      }
    }
    return allColumns
      .filter((col) => col.defaultVisible !== false)
      .map((col) => col.key);
  });

  // Persist order changes
  useEffect(() => {
    if (persistenceKey) {
      localStorage.setItem(`${persistenceKey}_order`, JSON.stringify(orderedKeys));
    }
  }, [orderedKeys, persistenceKey]);

  // Persist visibility changes
  useEffect(() => {
    if (persistenceKey) {
      localStorage.setItem(
        `${persistenceKey}_visibility`,
        JSON.stringify(visibleKeys)
      );
    }
  }, [visibleKeys, persistenceKey]);

  /**
   * Toggles the visibility of a column by its key
   */
  const toggleVisibility = (key: string) => {
    const column = allColumns.find((col) => col.key === key);
    // Required columns cannot be hidden
    if (column?.required) return;

    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  /**
   * Reorders columns based on drag-and-drop interaction
   */
  const reorderColumns = (activeId: string, overId: string) => {
    if (activeId === overId) return;

    const activeColumn = allColumns.find((col) => col.key === activeId);
    const overColumn = allColumns.find((col) => col.key === overId);

    // Required columns are fixed anchors and cannot be moved or replaced
    if (activeColumn?.required || overColumn?.required) return;

    setOrderedKeys((prev) => {
      const oldIndex = prev.indexOf(activeId);
      const newIndex = prev.indexOf(overId);

      if (oldIndex === -1 || newIndex === -1) return prev;

      const newOrder = [...prev];
      newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, activeId);
      return newOrder;
    });
  };

  /**
   * Computed columns for the UI based on current order and visibility
   */
  const configuredColumns = useMemo(() => {
    // 1. Get columns based on orderedKeys
    const orderedCols = orderedKeys
      .map((key) => allColumns.find((col) => col.key === key))
      .filter((col): col is TableColumn<T> => !!col);

    // 2. Handle columns not yet in the ordered list (schema additions)
    const missingCols = allColumns.filter(
      (col) => !orderedKeys.includes(col.key)
    );
    const fullOrderedCols = [...orderedCols, ...missingCols];

    // 3. Filter by visibility (always include required columns)
    return fullOrderedCols.filter(
      (col) => col.required || visibleKeys.includes(col.key)
    );
  }, [allColumns, orderedKeys, visibleKeys]);

  return {
    configuredColumns,
    visibleKeys,
    orderedKeys,
    toggleVisibility,
    reorderColumns,
    allColumns, // Expose for the selection UI
  };
};
