import React from "react";

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
  );
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

export function HolidaysCardSkeleton() {
  const ListItemSkeleton = () => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="flex items-center">
          <ShimmerBlock className="w-4 h-4 rounded-full" />
        </div>

        <div className="space-y-1">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-3 w-20" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <ShimmerBlock className="h-4 w-16 rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <ShimmerBlock className="w-36 h-5" />
        <ShimmerBlock className="w-14 h-4" />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </div>
    </div>
  );
}

const EmployeeRowSkeleton = () => (
  <div className="flex items-center space-x-3 p-2 sm:p-3 rounded-lg">
    <div className="flex-shrink-0">
      <ShimmerBlock className="w-3 h-3 rounded-full" />
    </div>

    <div className="flex-shrink-0">
      <ShimmerBlock className="w-8 h-8 rounded-full" />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <ShimmerBlock className="h-4 w-3/4 max-w-[150px]" />
      </div>

      <div className="flex items-center space-x-2 mt-1">
        <ShimmerBlock className="h-3 w-16" />
        <ShimmerBlock className="h-4 w-20 rounded-full" />
      </div>
    </div>
  </div>
);

export function TeamStatusSkeleton() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <ShimmerBlock className="h-6 w-32" />
      </div>

      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ShimmerBlock className="w-4 h-4 rounded-full" />
              <ShimmerBlock className="w-14 h-3" />
            </div>
            <div className="flex items-center space-x-2">
              <ShimmerBlock className="w-4 h-4 rounded-full" />
              <ShimmerBlock className="w-14 h-3" />
            </div>
            <div className="flex items-center space-x-2">
              <ShimmerBlock className="w-4 h-4 rounded-full" />
              <ShimmerBlock className="w-14 h-3" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="space-y-2 sm:space-y-3 pr-2">
          {skeletonRows.map((_, index) => (
            <EmployeeRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

const JoinerRowSkeleton = () => (
  <div className="flex items-center space-x-3 p-2 rounded-lg">
    <div className="relative flex-shrink-0">
      <ShimmerBlock className="w-10 h-10 rounded-full" />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <ShimmerBlock className="h-4 w-40" />

          <ShimmerBlock className="h-3 w-28" />

          <div className="flex items-center space-x-2 mt-1">
            <ShimmerBlock className="w-3 h-3" />
            <ShimmerBlock className="h-3 w-32" />
          </div>

          <ShimmerBlock className="h-3 w-20" />
        </div>
      </div>
    </div>
  </div>
);

export function MonthlyJoinersSkeleton() {
  const skeletonRows = Array.from({ length: 3 });

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="mb-4">
        <div className="flex items-center space-x-2">
          <ShimmerBlock className="w-6 h-6 rounded-full" />
          <ShimmerBlock className="h-6 w-36" />
          <ShimmerBlock className="h-5 w-10 rounded-full" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="space-y-3">
          {skeletonRows.map((_, index) => (
            <JoinerRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

const BirthdayAnniversaryRowSkeleton: React.FC = () => (
  <div className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
    <div className="flex-shrink-0">
      <ShimmerBlock className="w-10 h-10 rounded-full" />
    </div>

    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <ShimmerBlock className="h-4 w-3/4 max-w-[180px] mb-1" />

          <ShimmerBlock className="h-3 w-20 mb-2" />

          <div className="flex items-center space-x-2 mt-1">
            <ShimmerBlock className="h-3 w-12" />
            <ShimmerBlock className="h-4 w-16 rounded-full" />
          </div>

          <ShimmerBlock className="h-3 w-24 mt-1" />
        </div>
      </div>
    </div>
  </div>
);

export const EmployeeInfoSkeleton: React.FC = () => {
  const detailRows = Array.from({ length: 6 });

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-4 sm:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-5 h-5 rounded-full" />
          <ShimmerBlock className="h-6 w-40 rounded-md" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2">
        <div className="space-y-4">
          
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <ShimmerBlock className="w-16 h-16 sm:w-20 sm:h-20 rounded-full" />
            </div>

            <div className="flex-1 min-w-0 space-y-2 pt-1">
              <ShimmerBlock className="h-6 w-3/4 rounded-md" />
              <ShimmerBlock className="h-4 w-1/2 rounded-md" />
              <ShimmerBlock className="h-4 w-20 rounded-md" />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <div className="flex flex-col space-y-3">
              {detailRows.map((_, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <ShimmerBlock className="h-4 w-24 rounded-md opacity-70" />
                  <ShimmerBlock className="h-4 w-32 rounded-md" />
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export const BirthdayAnniversaryCardSkeleton: React.FC = () => {
  const skeletonRows = Array.from({ length: 2 });

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="mb-4">
        <div className="flex space-x-6 mb-4">
          <div className="flex items-center space-x-2 pb-2">
            <ShimmerBlock className="w-4 h-4 rounded-full" />
            <ShimmerBlock className="h-4 w-16" />
            <ShimmerBlock className="h-3 w-6" />
          </div>

          <div className="flex items-center space-x-2 pb-2">
            <ShimmerBlock className="w-4 h-4 rounded-full" />
            <ShimmerBlock className="h-4 w-24" />
            <ShimmerBlock className="h-3 w-6" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
        <div className="space-y-3">
          {skeletonRows.map((_, index) => (
            <BirthdayAnniversaryRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
