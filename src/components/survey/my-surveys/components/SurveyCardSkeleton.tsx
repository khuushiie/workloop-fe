import React from 'react';

interface SurveyCardSkeletonProps {
  count?: number;
}

const SingleCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 animate-pulse">

    <div className="flex items-start justify-between gap-3 mb-2">
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-5 bg-slate-200 rounded w-1/2" />
      </div>
      <div className="h-6 w-16 bg-slate-200 rounded-full flex-shrink-0" />
    </div>

    <div className="space-y-2 mb-4">
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="h-4 bg-slate-100 rounded w-4/5" />
    </div>

    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="h-4 w-24 bg-slate-100 rounded" />
      <div className="h-4 w-20 bg-slate-100 rounded" />
      <div className="h-4 w-28 bg-slate-100 rounded" />
    </div>

    {/* Button */}
    <div className="h-10 bg-slate-200 rounded-lg w-full" />
  </div>
);

const SurveyCardSkeleton: React.FC<SurveyCardSkeletonProps> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SingleCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default SurveyCardSkeleton;
