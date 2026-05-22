import React from "react";

/* --------------------------------
   SHIMMER BLOCK (single source)
---------------------------------- */
export const ShimmerBlock = ({ className = "" }) => (
  <div
    className={`
      bg-slate-200
      animate-shimmer
      bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)]
      bg-[length:1000px_100%]
      rounded
      ${className}
    `}
  />
);

/* --------------------------------
   STATS CARD SKELETON
---------------------------------- */
export const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-4 sm:p-5 lg:p-6">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <ShimmerBlock className="h-5 w-28" />
          <ShimmerBlock className="h-10 w-14" />
        </div>
        <ShimmerBlock className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
};

/* --------------------------------
   GENERIC TABLE ROW SKELETON
---------------------------------- */
const TableRowSkeleton: React.FC<{ columns: number }> = ({ columns }) => (
  <div
    className="grid gap-4 py-3 px-6 border-b border-slate-100"
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {Array.from({ length: columns }).map((_, i) => (
      <ShimmerBlock key={i} className="h-4 w-full" />
    ))}
  </div>
);

/* --------------------------------
   TABLE SECTION SKELETON
---------------------------------- */
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  titleWidth?: string;
}

export const ManagementTableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 6,
  columns = 8,
  titleWidth = "w-48",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className={`h-6 ${titleWidth}`} />
      </div>

      {/* Table Header */}
      <div
        className="hidden md:grid gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerBlock key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200">
        <ShimmerBlock className="h-6 w-32" />
        <div className="flex space-x-4">
          <ShimmerBlock className="h-6 w-16 rounded" />
          <ShimmerBlock className="h-6 w-28 rounded" />
        </div>
      </div>
    </div>
  );
};
