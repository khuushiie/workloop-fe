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

const SelectSkeleton: React.FC<{ className: string }> = ({ className }) => (
  <ShimmerBlock className={`h-8 rounded ${className}`} />
);

const RegularizationRowSkeleton: React.FC = () => {
  const baseClasses = "px-6 py-4 whitespace-nowrap";
  
  return (
    <tr className="animate-pulse hover:bg-slate-100 transition-colors duration-150">
      {/* Employee Name (Assumed first column) */}
      <td className={baseClasses}>
        <div className="flex items-center space-x-3">
          <ShimmerBlock className="w-8 h-8 rounded-full" />
          <ShimmerBlock className="h-4 w-24" />
        </div>
      </td>
      {/* Date/Period */}
      <td className="px-6 py-4"><ShimmerBlock className="h-4 w-20" /></td>
      <td className="px-6 py-4"><ShimmerBlock className="h-4 w-20" /></td>
      {/* Reason/Type */}
      <td className="px-6 py-4"><ShimmerBlock className="h-4 w-28" /></td>
      {/* Status (e.g., Pending, Approved) */}
      <td className="px-6 py-4">
        <ShimmerBlock className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <ShimmerBlock className="h-5 w-20 rounded-full" />
      </td>
      {/* Actions (Approve/Reject) */}
      <td className="px-6 py-4 text-left">
        <div className="flex space-x-2 justify-left">
          <ShimmerBlock className="w-5 h-5 rounded-full" />
          <ShimmerBlock className="w-5 h-5 rounded-full" />
        </div>
      </td>
    </tr>
  );
};

// Main Skeleton Component
interface RegularizationTableSkeletonProps {
  rows?: number;
}

export const RegularizationTableSkeleton: React.FC<RegularizationTableSkeletonProps> = ({ 
  rows = 5 
}) => {
  const skeletonRows = Array.from({ length: rows });
  
  // These are placeholders for the sticky classes and styles used in the original component
  const scrollContainerClasses = "overflow-x-auto overflow-y-auto max-h-[600px]"; 
  const tableClasses = "min-w-full divide-y divide-slate-200";
  const stickyHeaderClasses = "sticky top-0 z-20";

  return (
    <div className="bg-white rounded-lg shadow-soft">
      
      {/* 1. Header Section Skeleton */}
      <div className="p-3 border-b border-slate-200 sticky left-0 bg-white z-10">
        <h2 className="text-lg font-bold text-slate-900 flex items-center">
          <ShimmerBlock className="w-5 h-5 mr-2 rounded-full" /> {/* Icon placeholder */}
          <ShimmerBlock className="h-6 w-72" /> {/* Title text placeholder */}
        </h2>
      </div>

      {/* 2. Table and Body Skeleton */}
      <div className={scrollContainerClasses}>
        <table className={tableClasses}>
          
          {/* Table Header Skeleton (Simulating Sticky behavior) */}
          <thead className={`bg-slate-50 ${stickyHeaderClasses}`}>
            <tr>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-20" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-24" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th>
              <th className="px-6 py-3 text-center"><ShimmerBlock className="h-4 w-16" /></th> {/* Actions */}
            </tr>
          </thead>
          
          {/* Table Body Rows Skeleton */}
          <tbody className="bg-white divide-y divide-slate-200">
            {skeletonRows.map((_, index) => (
              <RegularizationRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 3. Pagination Footer Skeleton (Assumed to be rendered below the main table) */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
        
        {/* Left side: Showing X of Y items and Rows per page select */}
        <div className="flex items-center gap-4">
          <ShimmerBlock className="h-4 w-20 sm:w-40" />
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-28 sm:block hidden" /> {/* Rows per page label */}
          </div>
        </div>
        
        {/* Right side: Navigation buttons and page numbers */}
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-8 w-12 sm:w-16 rounded" /> {/* Previous button */}
          <div className="flex items-center gap-1">
            <ShimmerBlock className="h-8 w-8 rounded" /> {/* Page 1 */}
          </div>
          <ShimmerBlock className="h-8 w-12 sm:w-16 rounded" /> {/* Next button */}
        </div>
      </div>
    </div>
  );
};

const BreakManagementStartSkeleton: React.FC = () => (
  <div className="space-y-3">
    <ShimmerBlock className="h-4 w-28 mb-3" /> {/* Start a break: label */}
    <div className="flex flex-wrap gap-3">
      {/* Lunch Button */}
      <ShimmerBlock className="h-10 w-32 rounded-lg" /> 
      {/* Tea Button */}
      <ShimmerBlock className="h-10 w-32 rounded-lg" />
      {/* Personal Button */}
      <ShimmerBlock className="h-10 w-36 rounded-lg" />
    </div>
  </div>
);

/**
 * Skeleton UI for the Break History section.
 */
const BreakHistorySkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 2 });
  return (
    <div className="mt-6">
      <ShimmerBlock className="h-5 w-32 mb-3" /> {/* Today's Breaks title */}
      <div className="space-y-2">
        {skeletonRows.map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <div>
              <ShimmerBlock className="h-4 w-24 mb-1" /> {/* Break Type */}
              <ShimmerBlock className="h-3 w-40" />     {/* Time Range */}
            </div>
            <ShimmerBlock className="h-4 w-12" />       {/* Duration */}
          </div>
        ))}
      </div>
    </div>
  );
};


export const AttendanceDashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      
      {/* --- 1. Attendance Status and Check In/Out Section --- */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">
          <ShimmerBlock className="h-6 w-36" />
        </h2>

        <div className="space-y-4">
          
          {/* Status Overview Skeleton */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <ShimmerBlock className="h-4 w-24 mb-1" />  {/* Current Status Label */}
              <ShimmerBlock className="h-6 w-20 rounded-full" /> {/* Status Badge */}
            </div>
            <div className="text-right">
              <ShimmerBlock className="h-4 w-20 mb-1" />  {/* Work Hours Label */}
              <ShimmerBlock className="h-5 w-16" />        {/* Work Hours Value */}
            </div>
          </div>

          {/* Check In/Out Times Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary-50 rounded-lg p-4">
              <ShimmerBlock className="h-4 w-16 mb-2" />  {/* Check In Label */}
              <ShimmerBlock className="h-5 w-20" />       {/* Check In Time */}
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <ShimmerBlock className="h-4 w-16 mb-2" />  {/* Check Out Label */}
              <ShimmerBlock className="h-5 w-20" />       {/* Check Out Time */}
            </div>
          </div>

          {/* Action Buttons Skeleton (Mimicking Check In/Out buttons) */}
          <div className="flex flex-wrap gap-3">
            <ShimmerBlock className="h-12 w-28 rounded-lg" />
            <ShimmerBlock className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <hr className="my-6" />

      {/* --- 2. Break Management Section Skeleton --- */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <ShimmerBlock className="w-5 h-5 mr-2 rounded-full" />
          <ShimmerBlock className="h-6 w-40" />
        </h2>

        <BreakManagementStartSkeleton /> 
        
        {/* Break History Skeleton */}
        <BreakHistorySkeleton /> 
      </div>
      
      <hr className="my-6" />

      {/* --- 3. Work Summary Section Skeleton --- */}
      <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <ShimmerBlock className="w-5 h-5 mr-2 rounded-full" />
          <ShimmerBlock className="h-6 w-32" />
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Total Work Hours */}
          <div className="bg-primary-50 rounded-lg p-4">
            <ShimmerBlock className="h-4 w-28 mb-2" />
            <ShimmerBlock className="h-5 w-16" />
          </div>
          
          {/* Break Hours */}
          <div className="bg-orange-50 rounded-lg p-4">
            <ShimmerBlock className="h-4 w-20 mb-2" />
            <ShimmerBlock className="h-5 w-16" />
          </div>
          
          {/* Net Work Hours */}
          <div className="bg-green-50 rounded-lg p-4">
            <ShimmerBlock className="h-4 w-24 mb-2" />
            <ShimmerBlock className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

const DailyStatusCellSkeleton: React.FC = () => (
    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-500">
        <ShimmerBlock className="w-6 h-6 rounded-full mx-auto" />
    </td>
);

/**
 * Skeleton component for the summary cells at the end of the row.
 */
const SummaryCellSkeleton: React.FC = () => (
    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
        <ShimmerBlock className={`h-4 mx-auto w-16`} />
    </td>
);

const AttendanceTableRowSkeleton: React.FC = () => (
    <tr className="hover:bg-slate-50 border-b border-slate-100">
        {/* 1. Employee Name (Sticky) */}
        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
            <div>
                {/* Name */}
                <ShimmerBlock className="h-4 w-36 font-semibold mb-1" />
                {/* Meta (ID & Department) */}
                <ShimmerBlock className="h-3 w-28 text-xs" />
            </div>
        </td>

        {/* Daily Status Columns (Simulated Days) */}
        {Array.from({ length: 5 }, (_, i) => (
            <DailyStatusCellSkeleton key={i} />
        ))}
        
        {/* Summary Columns */}
        <SummaryCellSkeleton />       {/* Total Days */}
        <SummaryCellSkeleton />       {/* Present */}
        <SummaryCellSkeleton />       {/* Absent */}
        <SummaryCellSkeleton />       {/* Leave */}
        <SummaryCellSkeleton /> {/* Total Work Hours */}
        <SummaryCellSkeleton /> {/* Total Break Hours */}
        <SummaryCellSkeleton /> {/* Net Work Hours */}
        <SummaryCellSkeleton />       {/* Summary */}
    </tr>
);


export const AttendanceTableSkeleton: React.FC = () => {
    const skeletonRows = Array.from({ length: 5 }); // Display 5 employees

    return (
        <div className="bg-white rounded-xl shadow-soft border border-slate-200">
            
            {/* Header Skeleton */}
            <div className="p-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        {/* File Icon */}
                        <ShimmerBlock className="w-5 h-5 mr-2 rounded-full" />
                        {/* Title: Attendance Report - Month Year */}
                        <ShimmerBlock className="h-6 w-60" />
                    </h2>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            {/* Employee Column Header (Sticky) */}
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                                <ShimmerBlock className="h-4 w-20" />
                            </th>
                            
                            {/* Daily Column Headers (Days 1-28) */}
                            {Array.from({ length: 5 }, (_, i) => (
                                <th key={i} className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                                    <div className="flex flex-col items-center">
                                        {/* Day Number */}
                                        <ShimmerBlock className="h-4 w-4 font-semibold mb-1" />
                                        {/* Day Name (Short) */}
                                        <ShimmerBlock className="h-3 w-6" />
                                    </div>
                                </th>
                            ))}
                            
                            {/* Summary Column Headers */}
                            {[
                                "Total Days", "Present", "Absent", "Leave", 
                                "Total Work Hours", "Total Break Hours", "Net Work Hours", "Summary"
                            ].map((title, i) => (
                                <th key={i} className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    <ShimmerBlock className="h-4 w-20 mx-auto" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    
                    <tbody className="bg-white divide-y divide-slate-200">
                        {skeletonRows.map((_, index) => (
                            <AttendanceTableRowSkeleton key={index} />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Skeleton (Simulated to show the potential UI) */}
            <div className="border-t border-slate-200">
                <div className="px-6 py-4 flex items-center justify-between">
                    <ShimmerBlock className="h-5 w-32" /> 
                    <div className="flex items-center space-x-4">
                        <ShimmerBlock className="h-8 w-24 rounded-md" />
                        <div className="flex items-center space-x-2">
                            <ShimmerBlock className="h-8 w-8 rounded-md" />
                            <ShimmerBlock className="h-8 w-8 rounded-md" />
                            <ShimmerBlock className="h-8 w-8 rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};