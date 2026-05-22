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

const AccordionSkeleton: React.FC = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-soft overflow-hidden mb-4">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
            <ShimmerBlock className="h-6 w-48" />
            <ShimmerBlock className="h-5 w-5 rounded-full" />
        </div>
        <div className="p-6 space-y-4">
            <ShimmerBlock className="h-4 w-full" />
            <ShimmerBlock className="h-10 w-full rounded-md" />
            <div className="grid grid-cols-2 gap-4">
                <ShimmerBlock className="h-10 w-full rounded-md" />
                <ShimmerBlock className="h-10 w-full rounded-md" />
            </div>
        </div>
    </div>
);

const SurveyBuilderSkeleton: React.FC = () => {
    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Page Header Skeleton */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6">
                <div className="flex items-center gap-3">
                    <ShimmerBlock className="w-10 h-10 rounded-lg" />
                    <ShimmerBlock className="h-8 w-64" />
                </div>
            </div>

            {/* Builder Header Actions skeleton */}
            <div className="bg-white border-b border-slate-100 px-4 py-3 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShimmerBlock className="h-10 w-40 rounded-md" />
                </div>
                <div className="flex items-center gap-2">
                    <ShimmerBlock className="h-10 w-24 rounded-md" />
                    <ShimmerBlock className="h-10 w-24 rounded-md" />
                    <ShimmerBlock className="h-10 w-32 rounded-md" />
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                    <AccordionSkeleton />
                    <AccordionSkeleton />
                    <AccordionSkeleton />
                    <AccordionSkeleton />
                </div>

                {/* Right Side Panel Skeleton */}
                <div className="hidden lg:block w-80 bg-white border-l border-slate-200 p-6 space-y-6">
                    <ShimmerBlock className="h-6 w-40 mb-4" />
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <ShimmerBlock className="w-6 h-6 rounded-full" />
                                <ShimmerBlock className="h-4 flex-1" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyBuilderSkeleton;
