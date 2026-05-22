import React from 'react';

const ShimmerBlock: React.FC<{ className: string }> = ({ className }) => (
  <div
    className={`${className} bg-slate-200 
        animate-shimmer 
        bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] 
        bg-[length:1000px_100%] 
        rounded `}
    aria-hidden="true"
  />
);

const ConfigTableRowSkeleton: React.FC = () => (
  <tr className="hover:bg-slate-50">
    <td className="px-6 py-4">
      <ShimmerBlock className="h-4 w-24" /> {/* Key/Name */}
    </td>
    <td className="px-6 py-4">
      <ShimmerBlock className="h-4 w-60" /> {/* Value/Description */}
    </td>
    <td className="px-6 py-4">
      <ShimmerBlock className="h-5 w-16 rounded-full" /> {/* Status/Type Pill */}
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center space-x-3">
        <ShimmerBlock className="w-4 h-4" /> {/* Edit Icon */}
        <ShimmerBlock className="w-4 h-4" /> {/* Delete Icon */}
      </div>
    </td>
  </tr>
);

const ConfigsTableContentSkeleton: React.FC = () => {
    const skeletonRows = Array.from({ length: 5 }); // Show 5 rows

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-soft mt-4">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <ShimmerBlock className="h-3 w-16" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <ShimmerBlock className="h-3 w-20" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <ShimmerBlock className="h-3 w-12" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <ShimmerBlock className="h-3 w-14" />
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {skeletonRows.map((_, index) => (
                        <ConfigTableRowSkeleton key={index} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};


export const ConfigsPanelSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* 1. Filters Panel Skeleton */}
      <div className="bg-white rounded-lg shadow-soft p-4">
        <div className="flex items-center justify-between">
          {/* Title */}
          <ShimmerBlock className="h-6 w-20" />
          
          {/* Filter Dropdown Area */}
          <div className="flex items-center space-x-2">
            <ShimmerBlock className="h-4 w-16" /> {/* Label */}
            <ShimmerBlock className="h-10 w-40 rounded-md" /> {/* Select Input */}
          </div>
        </div>
      </div>

      {/* 2. Content (Table + Pagination) Skeleton */}
      <ConfigsTableContentSkeleton />

      {/* 3. Pagination Skeleton */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-soft">
        <ShimmerBlock className="h-5 w-32" /> {/* Total Items Text */}
        <div className="flex items-center space-x-4">
          <ShimmerBlock className="h-5 w-24" /> {/* Items per page select */}
          <div className="flex items-center space-x-2">
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Prev button */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Page number 1 */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Page number 2 */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Next button */}
          </div>
        </div>
      </div>
    </div>
  );
};