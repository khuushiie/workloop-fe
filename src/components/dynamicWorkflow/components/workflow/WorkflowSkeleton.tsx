import React from "react";
import { ShimmerBlock } from "../../../../utils/SkeletonUtils";

/* --------------------------------
   WORKFLOW CARD SKELETON
---------------------------------- */
export const WorkflowCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-6 shadow-sm">
      {/* Info Section */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
            <ShimmerBlock className="h-5 w-48 rounded" />
            <ShimmerBlock className="h-5 w-16 rounded-full" />
        </div>
        <ShimmerBlock className="h-4 w-full max-w-[400px] rounded" />
        <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-28 rounded" />
            <div className="text-slate-300">•</div>
            <ShimmerBlock className="h-4 w-32 rounded" />
        </div>
      </div>

      {/* Visualization Mock */}
      <div className="shrink-0 px-4 py-3 w-full md:w-[350px] bg-slate-50 rounded-lg h-[46px] flex items-center justify-center gap-3">
         <ShimmerBlock className="h-6 w-6 rounded-full flex-shrink-0" />
         <ShimmerBlock className="h-1 w-8 rounded-full opacity-60 flex-shrink-0" />
         <ShimmerBlock className="h-6 w-6 rounded-full flex-shrink-0" />
         <ShimmerBlock className="h-1 w-8 rounded-full opacity-60 flex-shrink-0" />
         <ShimmerBlock className="h-6 w-6 rounded-full flex-shrink-0" />
      </div>

      {/* Actions Mock */}
      <div className="flex items-center gap-1 shrink-0">
          <ShimmerBlock className="h-8 w-8 rounded-md" />
          <ShimmerBlock className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
};

/* --------------------------------
   WORKFLOW LIST SKELETON
---------------------------------- */
interface WorkflowSkeletonProps {
  count?: number;
}

export const WorkflowSkeleton: React.FC<WorkflowSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <WorkflowCardSkeleton key={i} />
      ))}
    </div>
  );
};
