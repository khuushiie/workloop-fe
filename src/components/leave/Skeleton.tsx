import { ShimmerBlock } from "../../utils/SkeletonUtils";

const LeaveCreditRowSkeleton: React.FC = () => {
  const baseClasses = "px-6 py-4 whitespace-nowrap";
  
  return (
    <tr className="animate-pulse">
      
      {/* Employee Column */}
      <td className={baseClasses}>
        <span className="flex items-center space-x-3">
          <ShimmerBlock className="w-10 h-10 rounded-full" />
          <span className="min-w-0 flex-1">
            <ShimmerBlock className="h-4 w-28" />
          </span>
        </span>
      </td>
      
      {/* Leave Type Column */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-5 w-24 rounded-full" />
      </td>
      
      {/* Month/Year Column */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-4 w-20" />
      </td>
      
      {/* Credited Column (Number) */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-4 w-10" />
      </td>
      
      {/* Credited On Column (Date/dash) */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-4 w-16" />
      </td>
    </tr>
  );
};

// Main Skeleton Component
interface LeaveCreditTableSkeletonProps {
  rows?: number;
}

export const LeaveCreditTableSkeleton: React.FC<LeaveCreditTableSkeletonProps> = ({ 
  rows = 5 
}) => {
  const skeletonRows = Array.from({ length: rows });
  
  // These mimic classes from your original component
  const scrollContainerClasses = "overflow-x-auto overflow-y-auto"; 
  const tableClasses = "min-w-full divide-y divide-slate-200 relative";

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200">
      
      {/* Note: The original component has a complex table wrapper structure,
           I am providing the skeleton for the inner table structure here. */}
      
      <div className={scrollContainerClasses}>
        <table className={tableClasses}>
          
          {/* Table Header Skeleton */}
          <thead className="bg-slate-50 sticky top-0 z-20">
            <tr>
              {/* Column Titles Placeholders */}
              <th className="px-6 py-4 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Employee */}
              <th className="px-6 py-4 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Leave Type */}
              <th className="px-6 py-4 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Month/Year */}
              <th className="px-6 py-4 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Credited */}
              <th className="px-6 py-4 text-left"><ShimmerBlock className="h-4 w-20" /></th> {/* Credited On */}
            </tr>
          </thead>
          
          {/* Table Body Rows Skeleton */}
          <tbody className="bg-white divide-y divide-slate-200">
            {skeletonRows.map((_, index) => (
              <LeaveCreditRowSkeleton key={index} />
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
    </div>
  );
};

const LeaveRowSkeleton: React.FC = () => {
  const baseClasses = "px-4 py-4 whitespace-nowrap";
  
  return (
    <tr className="animate-pulse hover:bg-slate-100 transition-colors duration-150">
      
      {/* 1. Leave Type */}
      <td className={`${baseClasses} min-w-[150px]`}>
        <div className="flex items-center">
          <ShimmerBlock className="w-4 h-4 mr-2 rounded-full" />
          <ShimmerBlock className="h-4 w-20" />
        </div>
      </td>
      
      {/* 2. Period (Start Date - End Date) */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-4 w-32" />
      </td>
      
      {/* 3. Days (Number + half/full day) */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-4 w-16" />
      </td>
      
      {/* 4. Status */}
      <td className={baseClasses}>
        <div className="flex items-center">
          <ShimmerBlock className="w-4 h-4 rounded-full" />
          <ShimmerBlock className="h-5 w-20 ml-2 rounded-full" />
        </div>
      </td>
      
      {/* 5. Applied Date */}
      <td className={baseClasses}>
        <ShimmerBlock className="h-4 w-20" />
      </td>
      
      {/* 6. Reason (Truncated) */}
      <td className="px-4 py-4">
        <ShimmerBlock className="h-4 w-32 max-w-[220px]" />
      </td>
      
      {/* 7. Actions */}
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center space-x-3">
          <ShimmerBlock className="w-4 h-4 rounded-full" /> {/* View button */}
          <ShimmerBlock className="w-4 h-4 rounded-full" /> {/* Pullback button */}
        </div>
      </td>
    </tr>
  );
};

// Main Skeleton Component
interface LeaveTableSectionSkeletonProps {
  rows?: number;
}

export const LeaveTableSectionSkeleton: React.FC<LeaveTableSectionSkeletonProps> = ({ 
  rows = 5 
}) => {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200">
      
      {/* 1. Header Section Skeleton */}
      <div className="px-6 py-4 border-b border-slate-200">
        <ShimmerBlock className="h-6 w-32" /> {/* Title Placeholder */}
      </div>

      {/* 2. Table Structure and Body Skeleton */}
      <div className="px-4 py-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            
            {/* Table Header Skeleton */}
            <thead className="bg-slate-50">
              <tr>
                {/* Column Titles Placeholders (7 columns) */}
                <th className="px-4 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Leave Type */}
                <th className="px-4 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* Period */}
                <th className="px-4 py-3 text-left"><ShimmerBlock className="h-4 w-10" /></th> {/* Days */}
                <th className="px-4 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* Status */}
                <th className="px-4 py-3 text-left"><ShimmerBlock className="h-4 w-16" /></th> {/* Applied Date */}
                <th className="px-4 py-3 text-left"><ShimmerBlock className="h-4 w-12" /></th> {/* Reason */}
                <th className="px-4 py-3 text-center"><ShimmerBlock className="h-4 w-12" /></th> {/* Actions */}
              </tr>
            </thead>
            
            {/* Table Body Rows Skeleton */}
            <tbody className="bg-white divide-y divide-slate-200">
              {skeletonRows.map((_, index) => (
                <LeaveRowSkeleton key={index} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 3. Pagination Footer Skeleton (Mimicking the conditional Pagination component) */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
        
        {/* Left side: Pagination summary details */}
        <div className="flex items-center gap-4">
          <ShimmerBlock className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-28" /> {/* Rows per page label */}
            <ShimmerBlock className="h-8 w-16 rounded" /> {/* Select dropdown */}
          </div>
        </div>
        
        {/* Right side: Navigation buttons and page numbers */}
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-8 w-20 rounded" /> {/* Previous button */}
          <div className="flex items-center gap-1">
            <ShimmerBlock className="h-8 w-8 rounded" /> {/* Page 1 */}
            <ShimmerBlock className="h-8 w-8 rounded" /> {/* Page 2 */}
            <ShimmerBlock className="h-8 w-8 rounded" /> {/* Page 3 */}
          </div>
          <ShimmerBlock className="h-8 w-16 rounded" /> {/* Next button */}
        </div>
      </div>
    </div>
  );
};

const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          {/* Label Placeholder */}
          <ShimmerBlock className="h-4 w-24" /> 
          {/* Value/Number Placeholder */}
          <ShimmerBlock className="h-8 w-12" />
        </div>
        
        {/* Icon Square Placeholder */}
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
          <ShimmerBlock className="w-6 h-6 rounded-md" />
        </div>
      </div>
    </div>
  );
};

// Main Stats Grid Skeleton
export const StatsGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  );
};

const EmployeeLeaveRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      {/* Column 1: Employee (Avatar + Name/Email) */}
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0" />
          <div className="ml-4 space-y-2">
            <ShimmerBlock className="h-4 w-32" /> {/* Name */}
            <ShimmerBlock className="h-3 w-40" /> {/* ID & Email */}
          </div>
        </div>
      </td>

      {/* Column 2: Department */}
      <td className="px-6 py-4">
        <ShimmerBlock className="h-4 w-24" />
      </td>

      {/* Column 3: Leave Balances (Badge Pills) */}
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          <ShimmerBlock className="h-6 w-20 rounded-full" />
          <ShimmerBlock className="h-6 w-24 rounded-full" />
          <ShimmerBlock className="h-6 w-16 rounded-full" />
        </div>
      </td>

      {/* Column 4: Pending Requests */}
      <td className="px-6 py-4">
        <ShimmerBlock className="h-6 w-28 rounded-full" />
      </td>

      {/* Column 5: Total Balance */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center">
          <ShimmerBlock className="h-4 w-12" />
          <ShimmerBlock className="h-4 w-4 ml-1 rounded" /> {/* Trending Icon */}
        </div>
      </td>
    </tr>
  );
};

export const EmployeeLeaveOverviewSkeleton = ({ rows = 5 }) => {
  const skeletonRows = Array.from({ length: rows });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200">
      {/* Header Section */}
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-slate-200 rounded mr-2" /> {/* Icon Placeholder */}
            <ShimmerBlock className="h-6 w-48" /> {/* Title */}
          </div>
          <ShimmerBlock className="h-10 w-32 rounded-lg" /> {/* Export Button */}
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-20" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-24" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-32" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-32" /></th>
              <th className="px-6 py-3 text-left"><ShimmerBlock className="h-4 w-24" /></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {skeletonRows.map((_, index) => (
              <EmployeeLeaveRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        <ShimmerBlock className="h-4 w-40" />
        <div className="flex gap-2">
          <ShimmerBlock className="h-8 w-8 rounded" />
          <ShimmerBlock className="h-8 w-8 rounded" />
          <ShimmerBlock className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
};