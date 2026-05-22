import { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useColumnDrag } from "./Table/ColumnDragContext";
import OverflowTooltip from "./OverflowTooltip";

export interface TableColumn<T = object> {
  key: string;
  title: string | ReactNode;
  label?: string;
  dataIndex?: keyof T;
  render?: (value: unknown, record: T, index: number) => ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  className?: string;
  required?: boolean;
  isReorderable?: boolean;
  defaultVisible?: boolean;
  truncate?: boolean;
  wrap?: boolean;
}

export interface TableProps<T = object> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: keyof T | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  size?: "sm" | "md" | "lg";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (column: string, order: "asc" | "desc") => void;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  tableFixed?: boolean;
  skeleton?: React.ReactNode;
  renderHeaderCell?: (
    column: TableColumn<T>,
    index: number,
    defaultContent: ReactNode
  ) => ReactNode;
}

const Table = <T extends object>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data available",
  className = "",
  rowKey = "_id" as keyof T,
  onRowClick,
  striped = true,
  hoverable = true,
  bordered = true,
  size = "md",
  sortBy,
  sortOrder,
  onSort,
  maxHeight,
  stickyHeader = false,
  renderHeaderCell,
  tableFixed = false,
  skeleton,
}: TableProps<T>) => {
  const { activeId } = useColumnDrag();
  const [scrollState, setScrollState] = useState({
    showLeftShadow: false,
    showRightShadow: false,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      const showLeftShadow = el.scrollLeft > 0;
      const showRightShadow =
        el.scrollLeft < el.scrollWidth - el.clientWidth - 5;
      setScrollState({ showLeftShadow, showRightShadow });
    }
  };

  useEffect(() => {
    handleScroll();
    const handleResize = () => handleScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, columns]);

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record);
    }
    const key = rowKey as keyof T;
    return record[key]?.toString() || index.toString();
  };

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable || !onSort) return;

    const newOrder =
      sortBy === column.key && sortOrder === "asc" ? "desc" : "asc";
    onSort(column.key, newOrder);
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  const getCellPadding = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2";
      case "lg":
        return "px-6 py-4";
      default:
        return "px-4 py-3";
    }
  };

  const renderCellContent = (
    column: TableColumn<T>,
    record: T,
    index: number
  ) => {
    let content: ReactNode = "";

    if (column.render) {
      const val = column.dataIndex ? record[column.dataIndex] : undefined;
      content = column.render(val, record, index);
    } else if (column.dataIndex) {
      const value = record[column.dataIndex];
      content = value?.toString() || "";
    }

    if (column.wrap) {
      return (
        <span className="whitespace-normal break-words">
          {content}
        </span>
      );
    }

    // Default: truncate unless explicitly disabled or wrapping enabled
    if (column.truncate !== false) {
      return (
        <OverflowTooltip className="truncate" align={column.align}>
          {content}
        </OverflowTooltip>
      );
    }

    return content;
  };

  const tableClasses = [
    "min-w-full border-separate border-spacing-0",
    getSizeClasses(),
    tableFixed ? "table-fixed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const containerClasses = [
    "relative overflow-hidden",
    bordered ? "border border-slate-200 rounded-lg" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const scrollContainerClasses = [
    "relative overflow-x-auto overflow-y-auto",
    maxHeight ? `max-h-[${maxHeight}]` : "",
    stickyHeader ? "scrollbar-thin scrollbar-thumb-slate-200" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {loading && !skeleton && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-[36]">
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="text-sm font-medium text-slate-600">Loading data...</span>
          </div>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className={scrollContainerClasses}
        onScroll={handleScroll}
      >
        <table className={tableClasses}>
          <thead
            className={`bg-slate-50 relative ${stickyHeader ? "sticky top-0 z-20 shadow-sm" : ""}`}
          >
            <tr className="overflow-hidden">
              {columns.map((column, index) => {
                const defaultContent = (
                  <div
                    className={`flex items-center gap-1 ${column.align === "center"
                        ? "justify-center"
                        : column.align === "right"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                  >
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 ${sortBy === column.key && sortOrder === "asc"
                              ? "text-primary-600"
                              : "text-slate-400"
                            }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 -mt-1 ${sortBy === column.key && sortOrder === "desc"
                              ? "text-primary-600"
                              : "text-slate-400"
                            }`}
                        />
                      </div>
                    )}
                  </div>
                );

                return (
                  <th
                    key={column.key}
                    className={`
                      ${getCellPadding()}
                      text-xs font-semibold text-slate-700 uppercase tracking-wider
                      border-b border-slate-200
                      ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left"}
                      ${column.sortable ? "cursor-pointer hover:bg-slate-100 select-none" : ""}
                      ${activeId === column.key ? "bg-slate-100 ring-1 ring-primary-500 rounded-sm" : ""}
                      ${column.className || ""}
                    `}
                    style={{ 
                      width: column.width,
                      maxWidth: column.width || 400,
                      minWidth: column.width || 150,
                      transform: `translateX(var(--col-drag-x-${column.key}, 0px))`,
                      transition: activeId ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
                      position: 'relative',
                      zIndex: activeId === column.key ? 30 : 1,
                    }}
                    onClick={() => handleSort(column)}
                  >
                    {renderHeaderCell
                      ? renderHeaderCell(column, index, defaultContent)
                      : defaultContent}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading && skeleton ? (
              <tr>
                <td colSpan={columns.length} className="p-0 border-0">
                  {skeleton}
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${getCellPadding()} text-center text-slate-500`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`
                    ${striped && index % 2 === 1 ? "bg-slate-50" : ""}
                    ${hoverable ? "hover:bg-slate-100" : ""}
                    ${onRowClick ? "cursor-pointer" : ""}
                    transition-colors duration-150 group
                  `}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => (
                    <td
                      key={`${getRowKey(record, index)}-${column.key}`}
                      className={`
                        ${getCellPadding()}
                        overflow-hidden
                        border-b border-slate-200
                        ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left"}
                        ${column.wrap ? "whitespace-normal break-words" : "whitespace-nowrap"}
                        ${activeId === column.key ? "bg-slate-50/50" : ""}
                        ${column.className || ""}
                      `}
                      style={{ 
                        width: column.width,
                        maxWidth: column.width || 400,
                        minWidth: column.width || 150,
                        transform: `translateX(var(--col-drag-x-${column.key}, 0px))`,
                        transition: activeId ? 'none' : 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
                        position: 'relative',
                        zIndex: activeId === column.key ? 20 : 1,
                      }}
                    >
                      {renderCellContent(column, record, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {scrollState.showLeftShadow && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white/80 to-transparent pointer-events-none z-[35] transition-opacity duration-300" />
      )}
      {scrollState.showRightShadow && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/80 to-transparent pointer-events-none z-[35] transition-opacity duration-300" />
      )}
    </div>
  );
};

export default Table;
