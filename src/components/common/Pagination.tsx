import React, { memo } from "react";
import Select from "./Select";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  className?: string;
}

const Pagination: React.FC<PaginationProps> = memo(
  ({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10, 20, 50],
    className = "",
  }) => {
    const totalPages = Math.max(
      1,
      Math.ceil(totalItems / Math.max(1, itemsPerPage))
    );
    const startItem =
      totalItems === 0
        ? 0
        : Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const renderPageNumbers = () => {
      const pages: React.ReactNode[] = [];
      const maxVisiblePages = 5;

      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(
            <button
              key={i}
              className={`px-3 py-1 text-sm rounded ${
                currentPage === i
                  ? "bg-primary-600 text-white"
                  : "border border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => onPageChange(i)}
              aria-current={currentPage === i ? "page" : undefined}
            >
              {i}
            </button>
          );
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(
              <button
                key={i}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === i
                    ? "bg-primary-600 text-white"
                    : "border border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => onPageChange(i)}
              >
                {i}
              </button>
            );
          }
          pages.push(
            <span key="ellipsis1" className="px-2 text-slate-500">
              ...
            </span>
          );
          pages.push(
            <button
              key={totalPages}
              className="px-3 py-1 text-sm rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          );
        } else if (currentPage >= totalPages - 2) {
          pages.push(
            <button
              key={1}
              className="px-3 py-1 text-sm rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
          );
          pages.push(
            <span key="ellipsis1" className="px-2 text-slate-500">
              ...
            </span>
          );
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(
              <button
                key={i}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === i
                    ? "bg-primary-600 text-white"
                    : "border border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => onPageChange(i)}
              >
                {i}
              </button>
            );
          }
        } else {
          pages.push(
            <button
              key={1}
              className="px-3 py-1 text-sm rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => onPageChange(1)}
            >
              1
            </button>
          );
          pages.push(
            <span key="ellipsis1" className="px-2 text-slate-500">
              ...
            </span>
          );
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(
              <button
                key={i}
                className={`px-3 py-1 text-sm rounded ${
                  currentPage === i
                    ? "bg-primary-600 text-white"
                    : "border border-slate-300 hover:bg-slate-50"
                }`}
                onClick={() => onPageChange(i)}
              >
                {i}
              </button>
            );
          }
          pages.push(
            <span key="ellipsis2" className="px-2 text-slate-500">
              ...
            </span>
          );
          pages.push(
            <button
              key={totalPages}
              className="px-3 py-1 text-sm rounded border border-slate-300 hover:bg-slate-50"
              onClick={() => onPageChange(totalPages)}
            >
              {totalPages}
            </button>
          );
        }
      }

      return pages;
    };

    return (
      <div className={`w-full bg-white rounded-lg border p-4 ${className}`}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 w-full">
          {/* LEFT: summary + rows-per-page */}
          <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
            <div className="min-w-0 flex-1">
              <div
                className="text-xs sm:text-sm text-slate-600 whitespace-nowrap truncate"
                title={`Showing ${startItem} to ${endItem} of ${totalItems} items`}
              >
                Showing{" "}
                <span className="font-medium text-slate-800">{startItem}</span>{" "}
                to <span className="font-medium text-slate-800">{endItem}</span>{" "}
                of{" "}
                <span className="font-medium text-slate-800">{totalItems}</span>{" "}
                items
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
              <span className="text-xs sm:text-sm text-slate-600">
                Rows per page:
              </span>
              <Select
                options={itemsPerPageOptions.map((option) => ({
                  value: option,
                  label: option.toString(),
                }))}
                value={itemsPerPage}
                onChange={(value) => {
                  if (Array.isArray(value)) return;
                  onItemsPerPageChange(Number(value));
                }}

                size="sm"
                clearable={false}
                className="w-24"
                position="top"
              />

            </div>
          </div>

          {/* RIGHT: pager controls */}
          <div className="flex items-center gap-0.5 shrink-0 justify-center lg:justify-end">
            <button
              className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              aria-label="Previous page"
            >
              Prev
            </button>

            {/* page numbers - scrollable on small screens */}
            <div
              className="overflow-x-auto no-scrollbar md:max-w-none"
              style={{ WebkitOverflowScrolling: "touch" }}
              aria-label="Page numbers"
            >
              <div className="flex items-center gap-1 px-0 md:px-2">
                {renderPageNumbers()}
              </div>
            </div>

            <button
              className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage >= totalPages}
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Pagination.displayName = "Pagination";

export default Pagination;
