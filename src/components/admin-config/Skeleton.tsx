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

const FeatureFlagRowSkeleton: React.FC = () => (
  <tr className="hover:bg-slate-50">
    {/* Flag Key (Text) */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-4 w-40" />
    </td>
    
    {/* Description (Longer Text) */}
    <td className="px-6 py-4">
      <ShimmerBlock className="h-4 w-64" />
    </td>
    
    {/* Status (Pill) */}
    <td className="px-6 py-4 whitespace-nowrap">
      <ShimmerBlock className="h-5 w-20 rounded-full" />
    </td>
    
    {/* Actions (Buttons/Icons) */}
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center space-x-4">
        {/* Toggle Icon Placeholder */}
        <ShimmerBlock className="w-6 h-6 rounded-full" />
        {/* Edit Icon Placeholder */}
        <ShimmerBlock className="w-4 h-4" />
        {/* Delete Icon Placeholder */}
        <ShimmerBlock className="w-4 h-4" />
      </div>
    </td>
  </tr>
);

export const FeatureFlagsTableSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 5 }); 
  return (
    <div className="bg-white rounded-lg shadow-soft">
      
      <div className="p-4 border-b border-slate-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ShimmerBlock className="h-6 w-40 mb-0" />
        
        <div className="relative w-full sm:w-72">
          <ShimmerBlock className="w-full h-10 rounded-md" /> 
        </div>
      </div>

      <div className="overflow-x-auto">
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
          
          {/* Table Body Rows Skeleton */}
          <tbody className="divide-y divide-slate-100">
            {skeletonRows.map((_, index) => (
              <FeatureFlagRowSkeleton key={index} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t mt-4 border-slate-200 bg-white flex items-center justify-between">
        
        {/* Left side: Showing X of Y items and Rows per page select */}
        <div className="flex items-center gap-4">
          <ShimmerBlock className="h-4 w-40" />
          <div className="flex items-center gap-2">
            <ShimmerBlock className="h-4 w-28" /> {/* Rows per page label */}
            <SelectSkeleton className="w-16" /> {/* Select dropdown */}
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