import React from 'react';

const ShimmerBlock: React.FC<{ className: string }> = ({ className }) => (
  <div
    className={`${className} bg-slate-200 
        animate-shimmer 
        bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] 
        bg-[length:1000px_100%] 
        rounded`}
    aria-hidden="true"
  />
);

const SelectSkeleton: React.FC<{ className: string }> = ({ className }) => (
  <ShimmerBlock className={`h-8 rounded ${className}`} />
);

const HolidayRowSkeleton: React.FC<{ hasActions: boolean }> = ({ hasActions }) => {
  const baseClasses = "px-6 py-4 whitespace-nowrap";
  
  return (
    <tr className="animate-pulse">
      <td className={baseClasses}><ShimmerBlock className="h-4 w-32" /></td>
      <td className={baseClasses}><ShimmerBlock className="h-4 w-20" /></td>
      <td className={baseClasses}><ShimmerBlock className="h-4 w-24 rounded-full" /></td>
      <td className="px-6 py-4"><ShimmerBlock className="h-4 w-40" /></td>
      {hasActions && (
        <td className={`${baseClasses} text-sm font-medium`}>
          <div className="flex space-x-2">
            <ShimmerBlock className="w-4 h-4 rounded-full" />
            <ShimmerBlock className="w-4 h-4 rounded-full" />
          </div>
        </td>
      )}
    </tr>
  );
};

interface HolidaysSectionSkeletonProps {
  hasActions?: boolean; 
  rows?: number;
}

export const HolidaysSectionSkeleton: React.FC<HolidaysSectionSkeletonProps> = ({ 
  hasActions = true, 
  rows = 5 
}) => {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div>
      <div className="bg-white rounded-lg shadow-soft">
        
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <ShimmerBlock className="h-6 w-56" />
          <div className="flex items-center w-[20%] space-x-2">
            <SelectSkeleton className="w-full" /> 
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3"><ShimmerBlock className="h-3 w-20" /></th>
                <th className="px-6 py-3"><ShimmerBlock className="h-3 w-12" /></th>
                <th className="px-6 py-3"><ShimmerBlock className="h-3 w-12" /></th>
                <th className="px-6 py-3"><ShimmerBlock className="h-3 w-20" /></th>
                {hasActions && <th className="px-6 py-3"><ShimmerBlock className="h-3 w-16" /></th>}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-slate-200">
             
              {skeletonRows.map((_, index) => (
                <HolidayRowSkeleton key={index} hasActions={hasActions} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4" /> 
      <div className="bg-white rounded-lg border p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShimmerBlock className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <ShimmerBlock className="h-4 w-28" /> 
              <SelectSkeleton className="w-16" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-8 w-20 rounded" /> 
            <div className="flex items-center gap-1">
              <ShimmerBlock className="h-8 w-8 rounded" /> 
              <ShimmerBlock className="h-8 w-8 rounded" /> 
              <ShimmerBlock className="h-8 w-8 rounded" />
            </div>
            <ShimmerBlock className="h-8 w-16 rounded" /> 
          </div>
        </div>
      </div>
    </div>
  );
};