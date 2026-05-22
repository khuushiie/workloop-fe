import { ShimmerBlock } from "../../utils/SkeletonUtils";


const SelectSkeleton: React.FC<{ className: string }> = ({ className }) => (
  <ShimmerBlock className={`h-8 rounded ${className}`} />
);

export const StatsGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      
      <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
        <ShimmerBlock className="h-5 w-24 mb-1" />
        <ShimmerBlock className="h-8 w-8" />
      </div>

      <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
        <ShimmerBlock className="h-5 w-24 mb-1" />
        <ShimmerBlock className="h-8 w-8" />
      </div>

      <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
        <ShimmerBlock className="h-5 w-32 mb-1" />
        <ShimmerBlock className="h-8 w-8" />
      </div>

      <div className="bg-white px-6 py-4 rounded-lg shadow-soft border border-slate-200">
        <ShimmerBlock className="h-5 w-40 mb-1" />
        <ShimmerBlock className="h-8 w-8" />
      </div>

    </div>
  );
};

export const GroupedSetsSkeleton: React.FC = () => {
  // Array of 3 to mimic Weekly, Monthly, Yearly cards
  const skeletons = [1, 2, 3]; 

  return (
    <div className="space-y-6">
      {skeletons.map((i) => (
        <div 
          key={i} 
          className="bg-white rounded-lg shadow-soft border border-slate-200"
        >
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            {/* Title (e.g., "Weekly Sets") */}
            <ShimmerBlock className="h-6 w-32" />
            {/* Count (e.g., "5 sets") */}
            <ShimmerBlock className="h-4 w-16" />
          </div>

          {/* Body Section (Table Simulation) */}
          <div className="p-6">
            <div className="w-full">
              
              {/* Table Header Row Skeleton */}
              <div className="flex gap-4 mb-4 border-b border-slate-100 pb-2">
                <ShimmerBlock className="h-4 w-1/4" />
                <ShimmerBlock className="h-4 w-1/4" />
                <ShimmerBlock className="h-4 w-1/4" />
                <ShimmerBlock className="h-4 w-1/4" />
              </div>

              {/* Table Body Rows Skeleton (3 rows) */}
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex gap-4 mb-4 last:mb-0">
                  <ShimmerBlock className="h-10 w-full rounded-md" /> 
                </div>
              ))}
              
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const UserListSkeleton: React.FC = () => {
  return (
    <div className="w-full">
      
      {/* 1. TABLE SECTION */}
      <div className="p-6 pt-0">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          
          {/* Table Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center">
            <ShimmerBlock className="h-4 w-24 mr-auto" /> {/* Employee */}
            <ShimmerBlock className="h-4 w-32 hidden md:block mr-auto" /> {/* Email */}
            <ShimmerBlock className="h-4 w-24 hidden md:block mr-auto" /> {/* Assigned Sets */}
            <ShimmerBlock className="h-4 w-16" /> {/* Actions */}
          </div>

          {/* Table Body Rows (5 rows) */}
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="px-6 py-4 border-b border-slate-100 last:border-0 flex items-center">
              
              {/* Col 1: Employee (Avatar + Name) */}
              <div className="flex items-center gap-3 w-full md:w-1/4">
                <ShimmerBlock className="w-8 h-8 rounded-full flex-shrink-0" />
                <ShimmerBlock className="h-4 w-32" />
              </div>

              {/* Col 2: Email */}
              <div className="hidden md:flex w-1/4">
                <ShimmerBlock className="h-4 w-40" />
              </div>

              {/* Col 3: Assigned Sets (Pills) */}
              <div className="hidden md:flex w-1/4 gap-1">
                <ShimmerBlock className="h-6 w-20 rounded-full" />
                <ShimmerBlock className="h-6 w-12 rounded-full" />
              </div>

              {/* Col 4: Actions (Icons) */}
              <div className="ml-auto md:ml-0 md:w-1/6 flex justify-start gap-3">
                <ShimmerBlock className="w-4 h-4 rounded" />
                <ShimmerBlock className="w-4 h-4 rounded" />
                <ShimmerBlock className="w-4 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PAGINATION SECTION */}
      <div className="w-full bg-white rounded-lg border border-slate-200 p-4 mt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          
          {/* LEFT: Summary + Rows per page */}
          <div className="flex w-full md:w-[31%] items-center gap-4">
            {/* "Showing X to Y..." text */}
            <ShimmerBlock className="h-4 w-48" />
            
            {/* Rows per page dropdown */}
            <div className="flex items-center gap-2">
              <ShimmerBlock className="h-4 w-20" />
              <ShimmerBlock className="h-8 w-16 rounded border border-slate-200" />
            </div>
          </div>

          {/* RIGHT: Pager Controls */}
          <div className="flex items-center gap-2 justify-center lg:justify-end">
            {/* Prev Button */}
            <ShimmerBlock className="h-8 w-16 rounded" />
            
            {/* Page Numbers */}
            <div className="flex gap-1 px-2">
               <ShimmerBlock className="h-6 w-6 rounded" />
               <ShimmerBlock className="h-6 w-6 rounded" />
               <ShimmerBlock className="h-6 w-6 rounded" />
            </div>

            {/* Next Button */}
            <ShimmerBlock className="h-8 w-16 rounded" />
          </div>

        </div>
      </div>

    </div>
  );
};

export const UserProfileHeaderSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 shadow-soft border border-slate-200">
      <div className="flex items-center justify-between">
        
        {/* Left Section: Avatar, Name, Level, Rank */}
        <div className="flex items-center gap-4">
          
          {/* Avatar Placeholder */}
          <div className="flex-shrink-0">
            <ShimmerBlock className="w-16 h-16 rounded-full" />
          </div>
          
          <div>
            {/* Name Placeholder */}
            <ShimmerBlock className="h-7 w-56 mb-2" /> 
            
            <div className="flex items-center gap-2 mt-2">
              {/* Level/Role Placeholder (Gradient/Blue) */}
              <ShimmerBlock className="h-8 w-24 rounded-full" />
              
              {/* Rank Placeholder (Gray Pill) */}
              <ShimmerBlock className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Right Section: Total Points */}
        <div className="text-right">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            {/* Trophy Icon Placeholder */}
            <ShimmerBlock className="w-6 h-6 rounded-full" />
            
            {/* Points Text Placeholder */}
            <ShimmerBlock className="h-6 w-32" /> 
          </div>
        </div>
      </div>
    </div>
  );
};


export const SetCompletionTrendSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full">
      
      {/* Header Skeleton */}
      <h3 className="text-lg font-semibold mb-4 text-slate-900">
        <ShimmerBlock className="h-6 w-56" />
      </h3>
      
      <div className="space-y-4 flex-1 flex flex-col">
        {/* Chart Area Skeleton */}
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <div className="w-full h-full p-4">
            
            {/* Y-Axis labels (Left side) */}
            <div className="float-left mr-2 space-y-8 mt-4" style={{ height: 'calc(100% - 30px)' }}>
                <ShimmerBlock className="h-3 w-4" />
                <ShimmerBlock className="h-3 w-4" />
                <ShimmerBlock className="h-3 w-4" />
                <ShimmerBlock className="h-3 w-4" />
                <ShimmerBlock className="h-3 w-4" />
            </div>

            {/* Main Graph Area */}
            <div className="relative border-l border-b border-slate-300 ml-6" style={{ width: 'calc(100% - 30px)', height: 'calc(100% - 30px)' }}>
              {/* Grid Lines */}
              <div className="absolute top-0 w-full h-full flex flex-col justify-around">
                <div className="border-t border-dashed border-slate-200 w-full"></div>
                <div className="border-t border-dashed border-slate-200 w-full"></div>
                <div className="border-t border-dashed border-slate-200 w-full"></div>
                <div className="border-t border-dashed border-slate-200 w-full"></div>
              </div>

              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path 
                  d="M0 80 Q 20 20, 40 50 T 80 40 L 100 60 L 100 100 L 0 100 Z" 
                  stroke="#CBD5E0" 
                  strokeWidth="1" 
                  fill="#E2E8F0" 
                  fillOpacity="0.7"
                />
              </svg>

            </div>
            
            {/* X-Axis labels (Bottom) */}
            <div className="flex justify-between pt-2 ml-6" style={{ width: 'calc(100% - 30px)' }}>
                <ShimmerBlock className="h-3 w-6" />
                <ShimmerBlock className="h-3 w-6" />
                <ShimmerBlock className="h-3 w-6" />
                <ShimmerBlock className="h-3 w-6" />
                <ShimmerBlock className="h-3 w-6" />
                <ShimmerBlock className="h-3 w-6" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

const KpiSetCardSkeleton: React.FC = () => {
  const kpiLines = Array.from({ length: 3 }); 
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-soft h-fit">
      
      {/* Set Name Header */}
      <div className="flex items-center mb-2">
        {/* Set Name */}
        <ShimmerBlock className="h-5 w-32" /> 
        {/* Info Icon Placeholder */}
        <ShimmerBlock className="w-4 h-4 rounded-full ml-2" />
      </div>
      
      {/* KPI List */}
      <ul className="list-inside space-y-1 text-sm">
        {kpiLines.map((_, kpiIndex) => (
          <li key={kpiIndex} className="flex items-center justify-between">
            {/* KPI Name */}
            <ShimmerBlock className="h-4 w-2/3" />
            {/* KPI Info Icon Placeholder */}
            <ShimmerBlock className="w-4 h-4 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
};


export const KpiSetListSkeleton: React.FC = () => {
  const setCards = Array.from({ length: 4 });

  return (
    <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full max-h-[600px]">
      
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-bold text-slate-900">
          <ShimmerBlock className="h-6 w-32" />
        </h3>
      </div>

      {/* Grid Content Skeleton */}
      <div className="gap-4 grid grid-cols-2 overflow-y-auto flex-1">
        {setCards.map((_, index) => (
          <KpiSetCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};


const KpiSetRowSkeleton: React.FC = () => (
  <div className="flex items-center justify-between">
    
    {/* Left Side: Icon and Set Name */}
    <div className="flex items-center gap-2">
      <ShimmerBlock className="w-4 h-4 rounded-full" /> 
      <ShimmerBlock className="h-4 w-32" /> 
    </div>

    {/* Right Side: Completion Tag */}
    <ShimmerBlock className="h-5 w-24 rounded-full" /> 
  </div>
);

export const WeeklyKpiAssessmentSkeleton: React.FC = () => {
  const listRows = Array.from({ length: 4 });

  return (
    <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200 flex flex-col w-full max-h-[600px]">
      
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        {/* Title */}
        <ShimmerBlock className="h-6 w-48" />
        
        {/* Average Score Pill */}
        <ShimmerBlock className="h-7 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[300px]">
        
        {/* Left Column: Radar Chart Skeleton */}
        <div className="flex flex-col items-center justify-center relative">
          
          {/* Radar Chart Placeholder */}
          <div className="relative w-full max-w-[300px] aspect-square flex items-center justify-center">
            {/* Concentric Circles (Polar Grid) */}
            <div className="absolute border border-slate-300 rounded-full w-full h-full"></div>
            <div className="absolute border border-slate-300 rounded-full w-3/4 h-3/4"></div>
            <div className="absolute border border-slate-300 rounded-full w-1/2 h-1/2"></div>
            
            {/* Simulated Radar Shape (Green/Shimmer Polygon) */}
            <div className="absolute w-2/3 h-2/3">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                <polygon points="50,10 85,35 70,80 30,80 15,35" 
                         className="fill-slate-200 opacity-60 animate-pulse"
                         strokeWidth="2" />
              </svg>
            </div>
            
            {/* Axis Labels Placeholder (Angles) */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-[-10px]"><ShimmerBlock className="h-3 w-10" /></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-[-10px]"><ShimmerBlock className="h-3 w-12" /></div>
            <div className="absolute right-0 top-1/4 transform translate-x-full mt-[-10px]"><ShimmerBlock className="h-3 w-8" /></div>
            <div className="absolute left-0 top-1/4 transform -translate-x-full mt-[-10px]"><ShimmerBlock className="h-3 w-8" /></div>
          </div>
        </div>
        
        {/* Right Column: KPI Set List Skeleton */}
        <div className="space-y-3 flex flex-col justify-flex-start pt-4">
          {listRows.map((_, index) => (
            <KpiSetRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

const KpiHistoryDetailSkeleton: React.FC = () => {
    // 2-3 sets shown inside the history panel
    const setRows = Array.from({ length: 2 }); 
    
    // 2-3 KPIs shown inside each set
    const kpiLines = Array.from({ length: 2 }); 

    return (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            
            {/* Period Summary Header (Date range, Completion Rate) */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    {/* Period Name/Title */}
                    <ShimmerBlock className="h-4 w-28 font-medium" /> 
                    {/* Date Range */}
                    <ShimmerBlock className="h-3 w-40 text-sm mt-1" /> 
                </div>
                {/* Completion Rate Pill */}
                <ShimmerBlock className="h-6 w-14 rounded-full" />
            </div>

            {/* Sets Completed Summary */}
            <ShimmerBlock className="h-4 w-3/4 text-sm" /> 

            {/* Individual Set Details */}
            <div className="mt-3 space-y-3">
                {setRows.map((_, i) => (
                    <div
                        key={i}
                        className="p-3 bg-white rounded border border-slate-200 space-y-2"
                    >
                        {/* Set Name and Status */}
                        <div className="flex items-center justify-between mb-2">
                            <ShimmerBlock className="h-4 w-32 font-semibold" /> 
                            <ShimmerBlock className="h-5 w-20 rounded-full" /> 
                        </div>
                        
                        {/* List of KPIs */}
                        <div className="space-y-1">
                            {kpiLines.map((_, kIdx) => (
                                <div key={kIdx} className="flex items-center gap-2 text-xs">
                                    <ShimmerBlock className="w-3 h-3 rounded-full" /> 
                                    <ShimmerBlock className="h-3 w-24" /> 
                                </div>
                            ))}
                        </div>
                        
                        {/* Comment Line */}
                        <div className="mt-2 text-xs">
                            <ShimmerBlock className="h-3 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HistoryPanelSkeleton: React.FC<{ title: string, color: string }> = ({ color }) => (
  <div className="space-y-4">
    {/* Period Header (Title + Nav Buttons) */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Calendar Icon Placeholder */}
        <ShimmerBlock className={`w-5 h-5 rounded-full bg-${color}-600`} />
        
        {/* Title */}
        <h4 className="text-lg m-0 font-medium text-slate-900">
          <ShimmerBlock className="h-6 w-20" /> 
        </h4>
      </div>
      <div className="flex items-center gap-2">
        {/* Nav Buttons */}
        <ShimmerBlock className="w-8 h-8 rounded-md" /> 
        <ShimmerBlock className="w-8 h-8 rounded-md" /> 
      </div>
    </div>
    
    {/* Content Skeleton */}
    <KpiHistoryDetailSkeleton />
  </div>
);

export const KpiCompletionHistorySkeleton: React.FC = () => {
  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg p-6 shadow-soft border border-slate-200">
        
        {/* Main Title Header */}
        <div className="flex items-center gap-2 mb-6">
          <ShimmerBlock className="w-6 h-6 rounded-full" /> 
          <ShimmerBlock className="h-6 w-48 m-0" />
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly History Skeleton (Simulated blue color) */}
          <HistoryPanelSkeleton title="Weekly" color="blue" />
          
          {/* Monthly History Skeleton (Simulated green color) */}
          <HistoryPanelSkeleton title="Monthly" color="green" />
          
          {/* Yearly History Skeleton (Simulated indigo color) */}
          <HistoryPanelSkeleton title="Yearly" color="indigo" />
          
        </div>
      </div>
    </div>
  );
};