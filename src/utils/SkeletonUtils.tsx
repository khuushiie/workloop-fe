export const ShimmerBlock: React.FC<{ className: string }> = ({ className }) => (
  <div
    className={`${className} bg-slate-200 
        animate-shimmer 
        bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] 
        bg-[length:1000px_100%] 
        rounded `}
    aria-hidden="true"
  />
);


const LeaderboardRowSkeleton: React.FC = () => {

  return (
    <div className={`p-4 rounded-lg flex items-center gap-4 border`}>
      <div className="flex items-center gap-3">
        {/* Rank Number Avatar */}
        <ShimmerBlock className={`w-8 h-8 rounded-full text-sm font-bold`} />
        
        {/* Name Initial Avatar */}
        <ShimmerBlock className={`w-10 h-10 rounded-full bg-slate-300`} />
        
        {/* Name and Change Info */}
        <div>
          {/* Name */}
          <ShimmerBlock className={`h-4 w-28 font-medium `} />
          
          {/* Change in Points */}
          <ShimmerBlock className={`h-3 w-20 text-sm mt-1 `} />
        </div>
      </div>
      
      {/* Points */}
      <div className="ml-auto text-right">
        <ShimmerBlock className={`h-4 w-16 font-semibold`} />
      </div>
    </div>
  );
};


export const OverallLeaderboardSkeleton: React.FC = () => {
  const leaderboardRows = Array.from({ length: 5 }); // Display 6 rows

  return (
    <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full max-h-[600px]">
      
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        {/* Title */}
        <ShimmerBlock className="h-6 w-36" />
        
        {/* Your Rank */}
        <ShimmerBlock className="h-5 w-24" />
      </div>

      {/* Leaderboard List Skeleton */}
      <div className="space-y-3 overflow-y-auto flex-1">
        {leaderboardRows.map((_, index) => (
          <LeaderboardRowSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
      {/* Table Header Mock */}
      <div
        className="hidden md:grid gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <ShimmerBlock key={i} className="h-4 w-24" />
        ))}
      </div>

      {/* Table Rows Mock */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 py-4 px-6 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <ShimmerBlock key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
      
      {/* Pagination Footer Mock */}
      <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
         <ShimmerBlock className="h-6 w-32" />
         <div className="flex gap-4">
             <ShimmerBlock className="h-8 w-16" />
             <ShimmerBlock className="h-8 w-24" />
         </div>
      </div>
    </div>
  );
};