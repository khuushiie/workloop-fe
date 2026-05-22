import { ShimmerBlock } from "../../../../utils/SkeletonUtils";

/* ---------------- Reusable Card ---------------- */
const Card = ({ children }: any) => (
  <div className="bg-white rounded-2xl shadow-soft border border-slate-200 p-5 h-full">
    {children}
  </div>
);

/* ---------------- Donut Skeleton ---------------- */
const DonutSkeleton = () => (
  <Card>
    <ShimmerBlock className="h-4 w-32 mb-4" />

    <div className="flex items-center justify-center h-[200px]">
      <ShimmerBlock className="w-36 h-36 rounded-full" />
    </div>
  </Card>
);

/* ---------------- Team Size List ---------------- */
const TeamSizeSkeleton = () => (
  <Card>
    <ShimmerBlock className="h-4 w-40 mb-4" />

    <div className="space-y-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <ShimmerBlock className="h-3 w-32 mb-2" />
          <ShimmerBlock className="h-3 w-full rounded-full" />
        </div>
      ))}
    </div>
  </Card>
);

/* ---------------- Priority Chart ---------------- */
const PriorityChartSkeleton = () => (
  <Card>
    <ShimmerBlock className="h-4 w-48 mb-4" />

    <div className="h-[280px] flex flex-col justify-between">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <ShimmerBlock key={i} className="h-6 w-full rounded-md" />
      ))}
    </div>
  </Card>
);

/* ---------------- Deadlines ---------------- */
const DeadlinesSkeleton = () => (
  <Card>
    <ShimmerBlock className="h-4 w-40 mb-4" />

    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <ShimmerBlock key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  </Card>
);

/* ---------------- Heatmap ---------------- */
const HeatmapSkeleton = () => (
  <Card>
    <ShimmerBlock className="h-4 w-52 mb-4" />

    <div className="grid grid-cols-10 gap-2">
      {[...Array(60)].map((_, i) => (
        <ShimmerBlock key={i} className="h-8 rounded-md" />
      ))}
    </div>
  </Card>
);

/* ---------------- MAIN ---------------- */
const ProjectAnalyticsSkeleton = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 animate-pulse">

      {/* Title */}
      <ShimmerBlock className="h-6 w-52" />

      {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DonutSkeleton />
        <TeamSizeSkeleton />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        <div className="xl:col-span-7">
          <PriorityChartSkeleton />
        </div>

        <div className="xl:col-span-3">
          <DonutSkeleton />
        </div>
      </div>

      {/* Row 3 */}
      <DeadlinesSkeleton />

      {/* Row 4 */}
      <HeatmapSkeleton />
    </div>
  );
};

export default ProjectAnalyticsSkeleton;
