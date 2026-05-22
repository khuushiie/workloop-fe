import { useEffect, useState } from "react";
import { ShimmerBlock } from "../ResourceAllocationSkeleton";

export const ProjectCardSkeleton = () => {
  return (
    <>
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <ShimmerBlock className="h-4 w-3/4" />
      <ShimmerBlock className="h-3 w-1/2" />
      <ShimmerBlock className="h-3 w-full" />
      <ShimmerBlock className="h-3 w-5/6" />
    </div>
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <ShimmerBlock className="h-4 w-3/4" />
      <ShimmerBlock className="h-3 w-1/2" />
      <ShimmerBlock className="h-3 w-full" />
      <ShimmerBlock className="h-3 w-5/6" />
    </div>
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <ShimmerBlock className="h-4 w-3/4" />
      <ShimmerBlock className="h-3 w-1/2" />
      <ShimmerBlock className="h-3 w-full" />
      <ShimmerBlock className="h-3 w-5/6" />
    </div>
    </>
  );
};

export const HeatmapSkeleton = () => {
  const rows = 7; // days
  const groupsDesktop = 6; // month-ish groups on desktop
  const groupsMobile = 3;  // only 2 groups on mobile
  const colsPerGroup = 5;   // columns per group

  // Determine groups based on screen width
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640); // sm breakpoint
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const groups = isMobile ? groupsMobile : groupsDesktop;

  return (
    <div className="w-full flex items-start justify-center bg-white p-4 overflow-x-hidden">
      <div className="space-y-1">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex">
            {Array.from({ length: groups }).map((_, groupIdx) => (
              <div key={groupIdx} className="flex gap-1 mr-3 last:mr-0">
                {Array.from({ length: colsPerGroup }).map((_, colIdx) => (
                  <ShimmerBlock
                    key={colIdx}
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm"
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};



export const HistorySkeleton = () => {
  return (
    <div className="flex justify-center md:p-4 min-h-[400px] sm:mt-0 mt-6">
      <div className="w-full sm:mx-12 mx-4 h-[300px] border rounded-lg p-4 bg-white flex flex-col gap-4">
        {/* Title */}
        <ShimmerBlock className="h-5 w-1/3 rounded" />
                {/* Third row */}
        <div className="flex justify-between gap-2 mt-2">
          <ShimmerBlock className="h-4 w-1/3 rounded" />
          <ShimmerBlock className="h-4 w-1/4 rounded" />
          <ShimmerBlock className="h-4 w-1/4 rounded" />
        </div>

        {/* First row */}
        <div className="flex justify-between gap-2 mt-3">
          <ShimmerBlock className="h-4 w-1/2 rounded" />
          <ShimmerBlock className="h-4 w-1/3 rounded" />
        </div>

        {/* Second row */}
        <div className="flex justify-between gap-2 mt-2">
          <ShimmerBlock className="h-4 w-2/3 rounded" />
          <ShimmerBlock className="h-4 w-1/4 rounded" />
        </div>
                {/* Third row */}
        <div className="flex justify-between gap-2 mt-2">
          <ShimmerBlock className="h-4 w-1/3 rounded" />
          <ShimmerBlock className="h-4 w-1/4 rounded" />
          <ShimmerBlock className="h-4 w-1/4 rounded" />
        </div>

        {/* Bottom row */}
        <div className="flex justify-between gap-2 mt-2">
          <ShimmerBlock className="h-4 w-1/4 rounded" />
          <ShimmerBlock className="h-4 w-1/4 rounded" />
          <ShimmerBlock className="h-4 w-1/3 rounded" />
        </div>
      </div>
    </div>
  );
};


