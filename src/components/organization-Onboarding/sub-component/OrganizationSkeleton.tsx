import React from "react";

/* ─────────────────────────────────────────────────────────────
   Shimmer Block (reuse same style as employee)
───────────────────────────────────────────────────────────── */
const ShimmerBlock = ({ className = "" }) => (
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

/* ─────────────────────────────────────────────────────────────
   Filters Skeleton
───────────────────────────────────────────────────────────── */
export const OrganizationFiltersSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      
      {/* LEFT SIDE */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        {/* Search */}
        <ShimmerBlock className="h-10 w-full sm:w-64 rounded-lg" />

        {/* Status dropdown */}
        <ShimmerBlock className="h-10 w-full sm:w-44 rounded-lg" />
      </div>

      {/* RIGHT SIDE (export etc) */}
      <div className="flex gap-3">
        <ShimmerBlock className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Table Row Skeleton
───────────────────────────────────────────────────────────── */
const OrganizationTableRowSkeleton: React.FC = () => (
  <div className="grid grid-cols-12 gap-4 py-3 px-6 border-b border-slate-100 last:border-b-0">
    
    {/* Organization */}
    <div className="col-span-4 sm:col-span-3 flex items-center space-x-3">
      <ShimmerBlock className="w-10 h-10 rounded-lg" />
      <div>
        <ShimmerBlock className="h-4 w-32 mb-1" />
        <ShimmerBlock className="h-3 w-20" />
      </div>
    </div>

    {/* Email */}
    <div className="hidden sm:flex col-span-2 items-center">
      <ShimmerBlock className="h-4 w-32" />
    </div>

    {/* Country */}
    <div className="hidden md:flex col-span-2 items-center">
      <ShimmerBlock className="h-4 w-24" />
    </div>

    {/* Admin */}
    <div className="hidden lg:flex col-span-2 items-center">
      <ShimmerBlock className="h-4 w-24" />
    </div>

    {/* Status */}
    <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-center">
      <ShimmerBlock className="h-5 w-16 rounded-full" />
    </div>

    {/* Actions */}
    <div className="col-span-4 sm:col-span-2 flex items-center justify-end sm:justify-center space-x-2">
      <ShimmerBlock className="w-4 h-4 rounded-full" />
      <ShimmerBlock className="w-4 h-4 rounded-full" />
      <ShimmerBlock className="w-4 h-4 rounded-full" />
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Table Section Skeleton
───────────────────────────────────────────────────────────── */
export const OrganizationTableSectionSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-auto">
      
      {/* Table title */}
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className="h-6 w-56" />
      </div>

      {/* Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
        <div className="col-span-3">
          <ShimmerBlock className="h-4 w-24" />
        </div>
        <div className="col-span-2">
          <ShimmerBlock className="h-4 w-20" />
        </div>
        <div className="col-span-2">
          <ShimmerBlock className="h-4 w-20" />
        </div>
        <div className="col-span-2">
          <ShimmerBlock className="h-4 w-20" />
        </div>
        <div className="col-span-1">
          <ShimmerBlock className="h-4 w-16" />
        </div>
        <div className="col-span-2">
          <ShimmerBlock className="h-4 w-16" />
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {skeletonRows.map((_, index) => (
          <OrganizationTableRowSkeleton key={index} />
        ))}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-slate-200">
        <ShimmerBlock className="h-6 w-24" />
        <div className="flex space-x-4">
          <ShimmerBlock className="h-6 w-16 rounded" />
          <ShimmerBlock className="h-6 w-32 rounded" />
        </div>
      </div>
    </div>
  );
};