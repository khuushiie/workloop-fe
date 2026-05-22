import { useEffect, useState } from "react";
import dayjs from "dayjs";

import ProjectStatusDonut from "./sub-components/ProjectStatusDonut";
import BillableNonBillableDonut from "./sub-components/BillableNonBillablePie";
import TeamSizeByProject from "./sub-components/TeamSizeByProject";
import PriorityDistributionChart from "./sub-components/PriorityDistributionChart";
import UpcomingDeadlines from "./sub-components/UpcomingDeadlines";
import ResourceHeatmap from "./sub-components/ResourceHeatmap";
import RoleBasedContribution from "./sub-components/RoleBasedContribution";
import { apiService } from "../../../services/api";
import ProjectAnalyticsSkeleton from "./sub-components/ProjectAnalyticsSkeleton";
import { useGetProjectAnalyticsQuery } from "../../../store/apis/resource-allocation/project-analytics.api";

const ProjectAnalytics = () => {
  const { data, error, isLoading } = useGetProjectAnalyticsQuery();

 if (isLoading) return <ProjectAnalyticsSkeleton />;
 if (error) return "Error";

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-lg md:text-xl font-semibold">Project Analytics</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 ">
        <ProjectStatusDonut data={data.projectStatus} />
        <TeamSizeByProject data={data.teamSizeByProject} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        <div className="xl:col-span-7">
          <PriorityDistributionChart
            data={data.projectClassification}
            total={data.highestTotalCount}
          />
        </div>

        <div className="xl:col-span-3">
          <BillableNonBillableDonut data={data.billableNonBillable} />
        </div>
      </div>
      <UpcomingDeadlines data={data.upcomingDeadlines} />
   <h1 className="text-lg md:text-xl font-semibold">Resource Analytics</h1>
      <div className="grid grid-cols-1 gap-6" >
        <ResourceHeatmap data={data.resourceHeatmap} />
        {/* <RoleBasedContribution data={data.resourceHeatmap} /> */}
      </div>
    </div>
  );
};

export default ProjectAnalytics;
