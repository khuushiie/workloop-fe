import React from "react";

const ShimmerBlock: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
);

const StatCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-soft border border-slate-100 p-4 sm:p-5 flex flex-col">
    <div className="flex items-start justify-between gap-2 sm:gap-3">
      <ShimmerBlock className="h-3 w-24" />
      <ShimmerBlock className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex-shrink-0" />
    </div>
    <div className="flex items-start justify-between gap-2 sm:gap-3 mt-3">
      <ShimmerBlock className="h-7 w-20 sm:w-24 flex-1 min-w-0" />
      <ShimmerBlock className="h-3 w-10 sm:w-12 flex-shrink-0 mt-3" />
    </div>
  </div>
);

const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 last:border-b-0 gap-4">
    <ShimmerBlock className="h-4 w-[15%]" />
    <ShimmerBlock className="h-4 w-[15%]" />
    <ShimmerBlock className="h-4 w-[15%]" />
    <ShimmerBlock className="h-6 w-16 rounded-full" />
    <ShimmerBlock className="h-4 w-16" />
  </div>
);

/** Loading state for the merged Billing & license page. */
export const BillingLicensePageSkeleton: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex max-[830px]:flex-col items-start sm:items-start justify-between gap-4 mb-8">
      <div>
        <ShimmerBlock className="h-8 w-60 mb-2" />
      </div>
      <ShimmerBlock className="h-10 w-36 rounded-lg" />
    </div>

    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <ShimmerBlock className="h-10 w-full max-w-xs rounded-lg" />
    </div>

    <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className="h-6 w-36" />
      </div>
      <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center gap-4">
        <ShimmerBlock className="h-3 w-[15%]" />
        <ShimmerBlock className="h-3 w-[15%]" />
        <ShimmerBlock className="h-3 w-[15%]" />
        <ShimmerBlock className="h-3 w-16" />
        <ShimmerBlock className="h-3 w-16" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </div>
  </div>
);
