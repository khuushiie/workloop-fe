import React from 'react'

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-4 sm:p-5 lg:p-6 transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">

        <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-2 space-y-4 card-content">
          <div className="bg-slate-200 animate-shimmer bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:1000px_100%] w-28 h-5 rounded" />
          <div className="bg-slate-200 animate-shimmer bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:1000px_100%] w-12 h-10 rounded" />
        </div>

        <div className="bg-slate-200 animate-shimmer bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:1000px_100%] w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300" />
      </div>
    </div>
  )
}

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


const EmployeeTableRowSkeleton: React.FC = () => (
  <div className="grid grid-cols-12 gap-4 py-3 px-6 border-b border-slate-100 last:border-b-0">
    <div className="col-span-2 flex items-center space-x-3">
      <ShimmerBlock className="w-10 h-10 rounded-full" />
      <div>
        <ShimmerBlock className="h-4 w-28 mb-1" />
        <ShimmerBlock className="h-3 w-16" />
      </div>
    </div>

    <div className="col-span-2 flex items-center">
      <ShimmerBlock className="h-4 w-20" />
    </div>
    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-4 w-16" />
    </div>
    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-4 w-24" />
    </div>
    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-4 w-20" />
    </div>

    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-4 w-16" />
    </div>
    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-4 w-12" />
    </div>

    <div className="col-span-1 flex flex-col justify-center">
      <ShimmerBlock className="h-4 w-16 mb-1" />
      <ShimmerBlock className="h-3 w-12" />
    </div>

    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-4 w-16" />
    </div>

    <div className="col-span-1 flex items-center">
      <ShimmerBlock className="h-5 w-16 rounded-full" />
    </div>

    <div className="col-span-1 flex items-center space-x-2 justify-center">
      <ShimmerBlock className="w-4 h-4 rounded-full" />
      <ShimmerBlock className="w-4 h-4 rounded-full" />
      <ShimmerBlock className="w-4 h-4 rounded-full" />
    </div>
  </div>
);

export const EmployeeTableSectionSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 4 });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 overflow-auto">
      
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className="h-6 w-48" />
      </div>

      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50">
          <div className="col-span-2"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-2"><ShimmerBlock className="h-4 w-12" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
          <div className="col-span-1"><ShimmerBlock className="h-4 w-16" /></div>
      </div>
      
      <div className="divide-y divide-slate-100">
        {skeletonRows.map((_, index) => (
          <EmployeeTableRowSkeleton key={index} />
        ))}
      </div>

      {/* Pagination Skeleton (mimic the footer) */}
      <div className="px-6 py-4 flex justify-between items-center border-t border-slate-200">
        <ShimmerBlock className="h-6 w-24" />
        <div className="flex space-x-4">
            <ShimmerBlock className="h-6 w-16 rounded" />
            <ShimmerBlock className="h-6 w-32 rounded" />
        </div>
      </div>
    </div>
  );
};