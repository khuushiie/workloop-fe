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

export const KpiMetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-100 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between h-full">
        
        {/* Left Section: Title, Value, Description */}
        <div className="flex-1 min-w-0 mb-3 sm:mb-0 pr-2">
          
          {/* Title Placeholder */}
          <ShimmerBlock className="h-4 w-1/2 max-w-[100px] mb-2 sm:mb-3" />
          
          {/* Value Placeholder (Large) */}
          <ShimmerBlock className="h-8 sm:h-10 lg:h-12 w-3/4 max-w-[150px] mb-2 sm:mb-3" />
          
          {/* Description Placeholder */}
          <ShimmerBlock className="h-3 w-4/5 max-w-[180px]" />
        </div>
        
        {/* Right Section: Icon Placeholder */}
        <div className="flex-shrink-0">
          <ShimmerBlock className="w-8 h-8 rounded-lg" />
        </div>
        
      </div>
    </div>
  );
};

const UserRoleTableRowSkeleton: React.FC<{ hasActions: boolean }> = ({ hasActions }) => (
  <tr className="border-b border-slate-100 h-16">
    {/* 1. Employee Name (Avatar + Name) */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center space-x-3">
        {/* Avatar Placeholder */}
        <ShimmerBlock className="w-10 h-10 rounded-full" />
        <div>
          {/* Name Placeholder */}
          <ShimmerBlock className="h-4 w-32" />
        </div>
      </div>
    </td>

    {/* 2. Employee ID */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-4 w-20" />
    </td>

    {/* 3. Department */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-4 w-24" />
    </td>

    {/* 4. Role */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-4 w-28" />
    </td>

    {/* 5. Reporting Manager */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-4 w-32" />
    </td>

    {/* 6. Functional Manager */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-4 w-32" />
    </td>
    
    {/* 7. Actions (Conditional) */}
    {hasActions && (
      <td className="px-6 py-4 whitespace-nowrap">
        <ShimmerBlock className="w-4 h-4 rounded-sm" />
      </td>
    )}
  </tr>
);


export const UserRoleTableSkeleton: React.FC<{ hasActions?: boolean }> = ({ hasActions = true }) => {
  const skeletonRows = Array.from({ length: 3 }); 

  // Column titles based on the useMemo array
  const columns = [
    "Employee Name", "Employee ID", "Department", "Role", "Reporting Manager", "Functional Manager"
  ];
  if (hasActions) {
    columns.push("Actions");
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
      
      {/* Header Skeleton (Title and Total Items) */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          {/* Users (Total Items) Title */}
          <ShimmerBlock className="h-6 w-36" />
        </div>
      </div>
      
      {/* Table Content Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          
          {/* Table Header Skeleton */}
          <thead className="bg-slate-50">
            <tr>
              {columns.map((title, index) => (
                <th 
                  key={index} 
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  <ShimmerBlock className="h-3 w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body Skeleton */}
          <tbody className="divide-y divide-slate-100">
            {skeletonRows.map((_, index) => (
              <UserRoleTableRowSkeleton key={index} hasActions={hasActions} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
        {/* Total Items count/status */}
        <ShimmerBlock className="h-5 w-24" /> 
        
        {/* Pagination Controls */}
        <div className="flex items-center space-x-4">
          <ShimmerBlock className="h-8 w-24 rounded-md" /> {/* Items per page select */}
          <div className="flex items-center space-x-2">
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Prev button */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Page number */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Next button */}
          </div>
        </div>
      </div>
    </div>
  );
};


const RoleTableRowSkeleton: React.FC = () => (
  <tr className="border-b border-slate-100 h-16">
    
    {/* 1. Role Name & Description (Stacked) */}
    <td className="px-6 py-4 whitespace-nowrap" style={{ width: "30%" }}>
      <div className="flex flex-col space-y-1">
        <ShimmerBlock className="h-4 w-40 font-medium" /> {/* Role Name */}
        <ShimmerBlock className="h-3 w-3/4 max-w-xs" /> {/* Description */}
      </div>
    </td>

    {/* 2. Role Type (Pill) */}
    <td className="px-6 py-4 whitespace-nowrap" style={{ width: "15%" }}>
      <ShimmerBlock className="h-6 w-20 rounded" />
    </td>

    {/* 3. Status (Pill) */}
    <td className="px-6 py-4 whitespace-nowrap" style={{ width: "15%" }}>
      <ShimmerBlock className="h-6 w-20 rounded-full" />
    </td>

    {/* 4. Last Updated (Date) */}
    <td className="px-6 py-4 whitespace-nowrap" style={{ width: "20%" }}>
      <ShimmerBlock className="h-4 w-24" />
    </td>

    {/* 5. Actions (Buttons) */}
    <td className="px-6 py-4 whitespace-nowrap" style={{ width: "20%" }}>
      <div className="flex items-center justify-center gap-3">
        {/* View Button */}
        <ShimmerBlock className="w-4 h-4 rounded-sm" /> 
        {/* Edit Button */}
        <ShimmerBlock className="w-4 h-4 rounded-sm" /> 
        {/* Delete Button */}
        <ShimmerBlock className="w-4 h-4 rounded-sm" /> 
      </div>
    </td>
  </tr>
);


export const RoleTableCardSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 3 });

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-100 overflow-hidden">
      
      {/* Header Skeleton (Title and Total Roles) */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            {/* Roles (Total Roles) Title */}
            <ShimmerBlock className="h-6 w-36" />
          </div>
        </div>
      </div>
      
      {/* Table Content Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          
          {/* Table Header Row */}
          <thead className="bg-slate-50">
            <tr>
              {[
                "Role Name", "Role Type", "Status", "Last Updated", "Actions"
              ].map((title, index) => (
                <th 
                  key={index} 
                  className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  <ShimmerBlock className="h-3 w-3/4" />
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {skeletonRows.map((_, index) => (
              <RoleTableRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton (Mimics the bottom bar when totalRoles > 0) */}
      <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between">
        {/* Total Items count/status */}
        <ShimmerBlock className="h-5 w-24" /> 
        
        {/* Pagination Controls */}
        <div className="flex items-center space-x-4">
          <ShimmerBlock className="h-8 w-24 rounded-md" /> {/* Items per page select */}
          <div className="flex items-center space-x-2">
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Prev button */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Page number */}
            <ShimmerBlock className="h-8 w-8 rounded-md" /> {/* Next button */}
          </div>
        </div>
      </div>
    </div>
  );
};

const PermissionTreeItemSkeleton: React.FC<{ level: number }> = ({ level }) => {
  const indentClass = `ml-${level * 4}`; // Tailwind classes for indentation
  const hasChildren = level < 2; // Simulate children up to level 2

  return (
    <div className={`${indentClass} py-1`}>
      <div className="flex items-center space-x-2">
        {/* Expand/Collapse Button Placeholder */}
        {hasChildren && <ShimmerBlock className="w-4 h-4 rounded-sm flex-shrink-0" />}
        
        {/* Checkbox Placeholder (Checkbox + Label) */}
        <div className="flex items-center space-x-2">
          <ShimmerBlock className="w-4 h-4 border border-slate-300 rounded-sm flex-shrink-0" />
          <ShimmerBlock className="h-4 w-40" />
        </div>
      </div>
      
      {/* Recursively render children skeletons if simulating children */}
      {hasChildren && (
        <div className="mt-1">
          <PermissionTreeItemSkeleton level={level + 1} />
          {level === 1 && <PermissionTreeItemSkeleton level={level + 1} />} {/* More nested items */}
        </div>
      )}
    </div>
  );
};


export const PermissionCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      
      {/* 1. Header Skeleton (Title, Icon, Description, Selected Count) */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {/* Icon Placeholder */}
            <ShimmerBlock className="w-9 h-9 rounded-full" />
            
            <div>
              {/* Title Placeholder */}
              <ShimmerBlock className="h-6 w-36 mb-1" />
              
              {/* Description Placeholder */}
              <ShimmerBlock className="h-4 w-64" />
            </div>
          </div>
          
          {/* Selected Count Pill Placeholder */}
          <ShimmerBlock className="h-6 w-32 rounded-full" />
        </div>
        
        {/* 2. Action Buttons Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {/* Select All Button */}
            <ShimmerBlock className="h-8 w-24 rounded-lg" />
            {/* Clear All Button */}
            <ShimmerBlock className="h-8 w-24 rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. Permission Tree Area Skeleton */}
      <div className="relative border border-slate-100 rounded-xl bg-slate-50 p-3 max-h-[520px] overflow-auto">
        <div className="space-y-2">
            {/* Simulate the structure of the PermissionTree component */}
            <PermissionTreeItemSkeleton level={0} />
            <PermissionTreeItemSkeleton level={0} />
            <PermissionTreeItemSkeleton level={0} />
        </div>
      </div>
    </div>
  );
};


const ModuleNodeSkeleton: React.FC<{ level: number }> = ({ level }) => {
  const indent = level * 16;
  const isModule = level === 0;
  
  return (
    <li className={`flex items-center space-x-2 py-1 ${isModule ? 'font-medium' : 'text-sm'}`} 
        style={{ marginLeft: `${indent}px` }}>
        
      {/* Icon/Indicator Placeholder */}
      <ShimmerBlock className={`w-3 h-3 rounded-full ${isModule ? 'bg-indigo-300' : 'bg-slate-300'}`} />

      {/* Text Placeholder (Shorter for submodules) */}
      <ShimmerBlock className={`h-4 ${isModule ? 'w-40' : 'w-24'}`} />
    </li>
  );
};

export const ModuleHierarchySkeleton: React.FC = () => {
  return (
    <div className="border border-slate-200 rounded-lg bg-white p-0 max-h-[60vh] overflow-hidden shadow-soft">
      
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r bg-primary-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          
          {/* Icon Placeholder */}
          <ShimmerBlock className="w-8 h-8 rounded-full bg-white/30 flex-shrink-0" />
          
          <div>
            {/* Title Placeholder */}
            <ShimmerBlock className="h-4 w-32 mb-1" />
            
            {/* Subtitle Placeholder */}
            <ShimmerBlock className="h-3 w-28" />
          </div>
        </div>
      </div>
      
      {/* Content Area Skeleton (Mimicking the nested list) */}
      <div className="p-0">
        <div className="max-h-[55vh] overflow-auto">
          <ul className="list-none m-0 p-4 space-y-2 bg-white">
            
            {/* Level 0 Module 1 */}
            <ModuleNodeSkeleton level={0} />
            
            {/* Level 1 Submodule 1 */}
            <ModuleNodeSkeleton level={1} />
            
            {/* Level 1 Submodule 2 */}
            <ModuleNodeSkeleton level={1} />
            
            {/* Level 0 Module 2 */}
            <ModuleNodeSkeleton level={0} />
            
            {/* Level 1 Submodule 3 */}
            <ModuleNodeSkeleton level={1} />

            {/* Level 2 Sub-Submodule */}
            <ModuleNodeSkeleton level={2} /> 
            
            {/* Level 0 Module 3 */}
            <ModuleNodeSkeleton level={0} />
            
            {/* Additional item to fill space */}
            <ModuleNodeSkeleton level={1} />
          </ul>
        </div>
      </div>
    </div>
  );
};