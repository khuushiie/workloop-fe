import { ShimmerBlock } from "../../utils/SkeletonUtils";


export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white felx items-center justify-center self-center p-8 rounded-lg shadow-soft border border-slate-200 animate-pulse">
      <div className="flex items-center">
        {/* Icon Placeholder */}
        <div className="p-2 rounded-lg">
          {/* Mimicking the icon background and shape */}
          <ShimmerBlock className="w-10 h-10 rounded-lg" />
        </div>
        
        <div className="ml-4">
          
          {/* Label Placeholder (Total Hours) */}
          <ShimmerBlock className="h-4 w-24 mb-4" />
          
          {/* Value Placeholder (24.50) */}
          <ShimmerBlock className="h-6 w-16" />
          
        </div>
      </div>
    </div>
  );
};

const TimesheetRowSkeleton: React.FC = () => {
  const baseClasses = "px-6 py-4 whitespace-nowrap";

  return (
    <tr className="animate-pulse hover:bg-slate-50">
      
      {/* Date Column */}
      <td className={baseClasses}>
        <div className="flex items-center gap-3">
          <ShimmerBlock className="w-4 h-4 flex-shrink-0 rounded-full" />
          <ShimmerBlock className="h-4 w-16" />
        </div>
      </td>
      
      {/* Tasks Column */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          {/* Main Task Name */}
          <ShimmerBlock className="h-4 w-28" />
          {/* Task Time/Hours */}
          <ShimmerBlock className="h-3 w-40" />
          {/* '+X more' indicator */}
          <ShimmerBlock className="h-3 w-12 mt-1" />
        </div>
      </td>
      
      {/* Hours Column */}
      <td className="px-6 py-4">
        <div>
          {/* Total Hours */}
          <ShimmerBlock className="h-4 w-12 mb-1" />
          {/* Task Count */}
          <ShimmerBlock className="h-3 w-16" />
        </div>
      </td>
      
      {/* Status Column */}
      <td className="px-6 py-4">
        <ShimmerBlock className="h-6 w-20 rounded-full" />
      </td>
      
      {/* Actions Column */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {/* Mimic a set of action buttons (Edit/Submit/Delete/View) */}
          <ShimmerBlock className="w-4 h-4 rounded-full" />
          <ShimmerBlock className="w-4 h-4 rounded-full" />
          <ShimmerBlock className="w-4 h-4 rounded-full" />
        </div>
      </td>
    </tr>
  );
};

// Main Skeleton Component
interface TimesheetTableSkeletonProps {
  rows?: number;
}

export const TimesheetTableSkeleton: React.FC<TimesheetTableSkeletonProps> = ({ 
  rows = 5 
}) => {
  const skeletonRows = Array.from({ length: rows });

  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full">
        
        {/* Table Header Skeleton */}
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* Date */}
            <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Tasks */}
            <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* Hours */}
            <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Status */}
            <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Actions */}
          </tr>
        </thead>
        
        {/* Table Body Rows Skeleton */}
        <tbody className="divide-y divide-slate-200">
          {skeletonRows.map((_, index) => (
            <TimesheetRowSkeleton key={index} />
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-4" /> 
      <div className="bg-white rounded-lg border p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ShimmerBlock className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <ShimmerBlock className="h-4 w-28" /> 
              <ShimmerBlock className="h-4 w-16" />
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
    </>
  );
};

const TimesheetManagementRowSkeleton: React.FC<{ hasActions: boolean }> = ({ hasActions }) => {
  const baseClasses = "px-6 py-4 whitespace-nowrap";
  
  return (
    <tr className="animate-pulse">
      
      {/* Date Column */}
      <td className={baseClasses}>
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-4 h-4 rounded-full flex-shrink-0" />
          <ShimmerBlock className="h-4 w-16" />
        </div>
      </td>
      
      {/* User Column (Name and Email) */}
      <td className={baseClasses}>
        <div className="space-y-1">
          <ShimmerBlock className="h-4 w-24" />
          <ShimmerBlock className="h-3 w-32" />
        </div>
      </td>

      {/* Tasks Column (Main task name, time range, and count) */}
      <td className="px-6 py-4">
        <div className="space-y-1">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-3 w-40" />
          <ShimmerBlock className="h-3 w-10 mt-1" />
        </div>
      </td>
      
      {/* Hours Column (Total hours and task count) */}
      <td className={baseClasses}>
        <div className="space-y-1">
          <ShimmerBlock className="h-4 w-12" />
          <ShimmerBlock className="h-3 w-16" />
        </div>
      </td>
      
      {/* Status Column */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-6 w-20 rounded-full" />
      </td>
      
      {/* Actions Column */}
      {hasActions && (
        <td className={baseClasses}>
          <ShimmerBlock className="w-4 h-4 rounded-full" />
        </td>
      )}
    </tr>
  );
};

// Main Timesheet Management Skeleton
interface TimesheetManagementSkeletonProps {
  // Corresponds to canViewTimesheetModule to show the actions column
  hasActions?: boolean; 
  rows?: number;
}

export const TimesheetManagementSkeleton: React.FC<TimesheetManagementSkeletonProps> = ({ 
  hasActions = true, 
  rows = 5 
}) => {
  const skeletonRows = Array.from({ length: rows });
  
  // These mimic classes from your original component
  const scrollContainerClasses = "overflow-x-auto overflow-y-auto max-h-[600px]"; 
  const tableClasses = "min-w-full divide-y divide-slate-200";
  const stickyHeaderClasses = "sticky top-0 z-20";

  return (
    <div className="bg-white rounded-lg shadow-soft border border-slate-200">
      
      {/* 1. Header Section Skeleton */}
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className="h-6 w-40" />
      </div>

      {/* 2. Table Structure and Body Skeleton */}
      <div className={scrollContainerClasses}>
        <table className={tableClasses}>
          
          {/* Table Header Skeleton (Simulating Sticky behavior) */}
          <thead className={`bg-slate-50 ${stickyHeaderClasses}`}>
            <tr>
              {/* Column Titles Placeholders based on your defined columns */}
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* Date */}
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* User */}
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Tasks */}
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Hours */}
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Status */}
              {hasActions && <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th>} {/* Actions */}
            </tr>
          </thead>
          
          {/* Table Body Rows Skeleton */}
          <tbody className="bg-white divide-y divide-slate-200">
            {skeletonRows.map((_, index) => (
              <TimesheetManagementRowSkeleton key={index} hasActions={hasActions} />
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 3. Pagination Footer Skeleton */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
        
        {/* Left side: Pagination summary details */}
        <div className="flex items-center gap-4">
          <ShimmerBlock className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-28" /> {/* Rows per page label */}
            <ShimmerBlock className="h-8 w-16 rounded" /> {/* Select dropdown */}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-8 w-20 rounded" /> {/* Previous button */}
          <div className="flex items-center gap-1">
            <ShimmerBlock className="h-8 w-8 rounded-full" /> {/* Page 1 */}
            <ShimmerBlock className="h-8 w-8 rounded-full" /> {/* Page 2 */}
            <ShimmerBlock className="h-8 w-8 rounded-full" /> {/* Page 3 */}
          </div>
          <ShimmerBlock className="h-8 w-16 rounded" /> {/* Next button */}
        </div>
      </div>
    </div>
  );
};