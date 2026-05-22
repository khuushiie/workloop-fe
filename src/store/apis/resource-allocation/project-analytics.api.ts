import { createApi} from '@reduxjs/toolkit/query/react';
import { baseQuery } from "../baseQuery";
import dayjs from 'dayjs';

export interface IProjectStatus {
  totalProjects: number;
  domainPercentages: Record<string, number>;
}

export interface IBilling {
  billableCount: number;
  nonBillableCount: number;
}

export interface IClassificationMonth {
  month: string;
  priorities: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface IClassificationYear {
  year: number;
  months: IClassificationMonth[];
}

export interface IUpcomingDeadline {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface IResourceMeta {
  name: string;
  allocation: number;
}

export interface ITeamSizeByProject {
  projectName: string;
  capacity: number;
  totalCurrentAllocation: number;
  resources?: (string | IResourceMeta)[];
}

export interface IResourceHeatmap {
  projectName: string;
  [role: string]: number | string | IResourceMeta[];
}

export interface IProjectAnalyticsData {
  projectStatus: IProjectStatus;
  billing: IBilling;
  classification: IClassificationYear[];
  upcomingDeadlines: IUpcomingDeadline[];
  teamSizeByProject: ITeamSizeByProject[];
  resourceHeatmap: IResourceHeatmap[];
}

export interface IProjectAnalyticsResponse {
  success: boolean;
  message: string;
  data: IProjectAnalyticsData;
  statusCode: number;
  timestamp: string;
}

// Transformed interfaces for the frontend
export interface ITransformedTeamSize {
  name: string;
  allocation: number;
  capacity: number;
  resources: (string | IResourceMeta)[];
  color: string;
}

export interface ITransformedAnalytics {
  projectStatus: {
    total: number;
    domains: Record<string, number>;
  };
  billableNonBillable: {
    billable: number;
    nonBillable: number;
  };
  projectClassification: {
    year: number;
    data: {
      month: string;
      high: number;
      medium: number;
      low: number;
    }[];
  }[];
  highestTotalCount: number;
  upcomingDeadlines: IUpcomingDeadline[];
  teamSizeByProject: ITransformedTeamSize[];
  resourceHeatmap: {
    roles: string[];
    projects: string[];
    values: number[][];
    metaMatrix: IResourceMeta[][][];
  };
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery,
  tagTypes: ['Analytics'],
  endpoints: (builder) => ({
    getProjectAnalytics: builder.query<ITransformedAnalytics, void>({
      query: () => "v2/resource-management/project-analytics",
      transformResponse: (response: IProjectAnalyticsResponse) => {
        const rawData = response?.data; 
  
        if (!rawData) return {
          projectStatus: { total: 0, domains: {} },
          billableNonBillable: { billable: 0, nonBillable: 0 },
          projectClassification: [],
          highestTotalCount: 0,
          upcomingDeadlines: [],
          teamSizeByProject: [],
          resourceHeatmap: { roles: [], projects: [], values: [], metaMatrix: [] }
        };
        
        return {
          projectStatus: {
            total: rawData.projectStatus?.totalProjects || 0,
            domains: rawData.projectStatus?.domainPercentages || {},
          },
          billableNonBillable: {
            billable: rawData.billing?.billableCount || 0,
            nonBillable: rawData.billing?.nonBillableCount || 0,
          },
          projectClassification: (rawData.classification || []).map((yearData: IClassificationYear) => ({
            year: yearData.year,
            data: (yearData.months || []).map((item: IClassificationMonth) => ({
              month: dayjs(item?.month, "MMMM").format("MMM"),
              high: item?.priorities?.high || 0,
              medium: item?.priorities?.medium || 0,
              low: item?.priorities?.low || 0,
            })),
          })),
          highestTotalCount: (rawData.classification || []).reduce((globalMax: number, yearData: IClassificationYear) => {
             const yearMax = Math.max(
                ...(yearData.months?.map((item: IClassificationMonth) => 
                  (item?.priorities?.high || 0) + 
                  (item?.priorities?.medium || 0) + 
                  (item?.priorities?.low || 0)
                ) || [0])
             );
             return Math.max(globalMax, yearMax);
          }, 0),
          upcomingDeadlines: rawData.upcomingDeadlines || [],
          teamSizeByProject: (rawData.teamSizeByProject || []).map((p: ITeamSizeByProject) => ({
            name: p?.projectName,
            allocation: p?.totalCurrentAllocation,
            capacity: p?.capacity,
            resources: p?.resources || [],
            color: "#3b82f6",
          })),
          resourceHeatmap: (() => {
            const heatmapData = rawData.resourceHeatmap || [];
            if (heatmapData.length === 0) return { roles: [], projects: [], values: [], metaMatrix: [] };
            const sample = heatmapData[0];      
            const roles = Object.keys(sample).filter(k => k !== "projectName" && !k.endsWith("_meta"));       
            const projects = heatmapData.map((p: IResourceHeatmap) => p.projectName);       
            const values = roles.map(role => heatmapData.map((proj: IResourceHeatmap) => (proj[role] as number) || 0));       
            const metaMatrix = roles.map(role => heatmapData.map((proj: IResourceHeatmap) => (proj[`${role}_meta`] as IResourceMeta[]) || []));       
            return { roles, projects, values, metaMatrix };
          })(),
        };
      },
    }),
  }),
});


export const { useGetProjectAnalyticsQuery } = analyticsApi;