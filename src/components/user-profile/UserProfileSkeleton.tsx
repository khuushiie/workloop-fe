import React from "react";

// Skeleton block component
const ShimmerBlock: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`
      bg-slate-200
      animate-shimmer
      bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)]
      bg-[length:1000px_100%]
      rounded
      ${className}
    `}
    aria-hidden="true"
  />
);

const ShimmerFieldRow: React.FC = () => (
  <div className="flex flex-col">
    <ShimmerBlock className="w-24 h-4 mb-1" />
    <ShimmerBlock className="w-36 h-5" />
  </div>
);

// Helper component for rendering multiple list items
const ShimmerListItem: React.FC = () => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <ShimmerBlock className="w-5 h-5 rounded-full" />
      <ShimmerBlock className="w-24 h-4 rounded" />
    </div>
    <ShimmerBlock className="w-20 h-4 rounded" />
  </div>
);

// Skeleton for the tabbed content area (right side)
const EmployeeProfileContentSkeleton: React.FC = () => {
  // Skeleton for a section like 'Basic Information' or 'Bank Details'
  const ProfileSectionSkeleton: React.FC<{ titleWidth: string }> = ({ titleWidth }) => (
    <div className="p-6 bg-white rounded-lg shadow-soft mb-6 border border-slate-200">
      <div className="flex justify-between items-center mb-4 border-b pb-2">
        <ShimmerBlock className={`${titleWidth} h-6`} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <ShimmerFieldRow key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl w-full">
      {/* Tabs Skeleton */}
      <div className="flex space-x-6 border-b border-slate-300 mb-6 bg-white p-2 rounded-t-lg">
        {["General", "Bank Details", "Education Details", "Previous Employement"].map((tab, i) => (
          <ShimmerBlock key={i} className={`h-6 w-24 rounded-full ${i === 0 ? 'bg-primary-300' : 'bg-slate-200'}`} />
        ))}
      </div>

      <div className="space-y-6">
        {/* We default to showing the 'General' tab content skeleton */}
        <ProfileSectionSkeleton titleWidth="w-52" />
      </div>
    </div>
  );
};

export default function UserProfileSkeleton() {
  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-4" role="status" aria-busy="true" aria-live="polite">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
          <ShimmerBlock className="w-40 h-8" />
        </h1>
        {/* Edit Button Skeleton */}
        <ShimmerBlock className="w-24 h-10 rounded-md" />
      </div>

      <div className="grid md:grid-cols-[30%_auto] sm:grid-cols-1 gap-4 md:gap-6">
        {/* Left column - Profile card */}
        <div className="bg-white bg-[linear-gradient(to_top,#fff_60%,rgba(129,140,248,0.4)_100%)] backdrop-blur-md shadow-2xl rounded-2xl p-3 md:p-4 flex flex-col">
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col justify-center items-center">
              {/* Profile Pic Placeholder */}
              <ShimmerBlock className="w-28 h-28 rounded-full mb-4" />
              {/* Name Placeholder */}
              <ShimmerBlock className="w-40 h-6 rounded mb-2" />
              {/* Position/Department Badges Placeholder */}
              <div className="flex justify-between items-center gap-4">
                <ShimmerBlock className="h-6 w-24 rounded-full" />
                <ShimmerBlock className="h-6 w-24 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 mt-4">
            {/* Employee Details (ID, DOJ, Managers) */}
            <div className="border-b-2 space-y-3 border-slate-200 pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ShimmerListItem key={i} />
              ))}
            </div>

            {/* Personal Information (Adhar, PAN, UAN) */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900">
                <ShimmerBlock className="w-36 h-5" />
              </h3>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex w-[45%] items-center gap-2">
                    <ShimmerBlock className="w-5 h-5 rounded-full" />
                    <ShimmerBlock className="w-28 h-4 rounded" />
                  </div>
                  <div className="w-[60%] text-right">
                    <ShimmerBlock className="w-36 h-4 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Tabbed Content */}
        <div className="bg-white backdrop-blur-md shadow-[0_0_15px_rgba(156,163,175,0.5)] rounded-2xl p-4 sm:p-4 md:p-6 flex flex-col">
          <EmployeeProfileContentSkeleton />
        </div>
      </div>
    </div>
  );
}