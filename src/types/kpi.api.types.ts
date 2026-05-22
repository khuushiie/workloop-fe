
/** KPI set timeline – use everywhere for weekly/monthly/yearly */
export enum KpiTimeline {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

/** All timeline values for iteration (e.g. map over sections) */
export const KPI_TIMELINE_VALUES: KpiTimeline[] = [
  KpiTimeline.WEEKLY,
  KpiTimeline.MONTHLY,
  KpiTimeline.YEARLY,
];

export interface IKpiResponseV2 {
  id: string;
  code: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateKpiBodyV2 {
  code: string;
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface IUpdateKpiBodyV2 {
  code?: string;
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface IGetKpisParamsV2 {
  isActive?: boolean;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IGetKpisResultV2 {
  data: IKpiResponseV2[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IKpiStatsV2 {
  totalActiveSets: number;
  totalActiveKpis: number;
  totalActiveEmployees: number;
  totalAssignedUsersActive: number;
}

/** Query params for GET /v2/kpi/kpi-sets */
export interface IKpiSetQueryV2 {
  period?: KpiTimeline;
  isActive?: boolean;
  includeKpis?: boolean;
}

/** Response for GET /v2/kpi/kpi-sets */
export interface IGetKpiSetsResultV2 {
  data: IKpiSetResponseV2[];
  total: number;
  filteredBy: string;
}

/** Single KPI Set response (create/get/update) */
export interface IKpiSetResponseV2 {
  id: string;
  code: string;
  name: string;
  description?: string;
  timeline: KpiTimeline;
  kpiCount: number;
  points: number;
  minKpisToComplete?: number;
  isActive: boolean;
  kpis?: IKpiResponseV2[];
  createdAt: string;
  updatedAt: string;
}

/** Body for POST /v2/kpi/sets */
export interface ICreateKpiSetBodyV2 {
  code: string;
  name: string;
  description?: string;
  timeline: KpiTimeline;
  kpiIds: string[];
  points?: number;
  minKpisToComplete?: number;
  isActive?: boolean;
}

/** Body for PUT /v2/kpi/sets/:id */
export interface IUpdateKpiSetBodyV2 {
  code?: string;
  name?: string;
  description?: string;
  timeline?: KpiTimeline;
  kpiIds?: string[];
  points?: number;
  minKpisToComplete?: number;
  isActive?: boolean;
}

/** Body for POST /v2/kpi/assignments/bulk - use either (userIds + setId) or (userId + setIds) */
export interface IBulkCreateAssignmentBodyV2 {
  userIds?: string[];
  userId?: string;
  setIds?: string[];
  setId?: string;
  /** When using userIds + setIds: "add" | "replace" */
  assignmentMode?: "add" | "replace";
}

/** Response for POST /v2/kpi/assignments/bulk */
export interface IBulkCreateAssignmentResultV2 {
  created: number;
  skipped: number;
  message: string;
}

/** Query params for GET /v2/kpi/set-assignments */
export interface IAssignmentListQueryV2 {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: "ACTIVE" | "INACTIVE";
}

/** Query params for GET /v2/kpi/kpi-scoring (role-based: admin all, managers reportees only, others none) */
export interface IKpiScoringQueryV2 {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  reportingManager?: string;
  functionalManager?: string;
  status?: "ACTIVE" | "INACTIVE";
}

/** One assigned set in GET /v2/kpi/set-assignments response */
export interface IAssignedSetItemV2 {
  assignmentId: string;
  setId: string;
  setCode: string;
  setName: string;
  timeline: string;
  status: string;
  assignedDate?: string;
  kpiCount?: number;
}

/** One row in GET /v2/kpi/set-assignments and GET /v2/kpi/kpi-scoring (employee + assigned sets) */
export interface IAssignmentListItemV2 {
  userId: string;
  fullName: string;
  email: string;
  workEmail?: string;
  employeeId?: string;
  department?: string;
  departmentName?: string | null;
  position?: string;
  reportingManagerId?: string | null;
  reportingManagerName?: string | null;
  functionalManagerId?: string | null;
  functionalManagerName?: string | null;
  assignedSets: IAssignedSetItemV2[];
  totalActiveSets: number;
  totalInactiveSets: number;
}

/** Response for GET /v2/kpi/set-assignments */
export interface IAssignmentListResultV2 {
  data: IAssignmentListItemV2[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ScoreApprovalStatusV2 = "PENDING" | "APPROVED";

export interface IKpiCompletionItemV2 {
  kpiId: string;
  isCompleted: boolean;
}

export interface ICreateScoreBodyV2 {
  userId: string;
  setId: string;
  kpiCompletionStatus: IKpiCompletionItemV2[];
  pointsEarned: number;
  period: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  comment?: string;
}

export interface IScoreResponseV2 {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  setId: string;
  setCode?: string;
  setName?: string;
  kpiCompletionStatus: Array<{ kpiId: string; kpiCode?: string; kpiName?: string; isCompleted: boolean }>;
  pointsEarned: number;
  period: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  comment?: string;
  approvalStatus: ScoreApprovalStatusV2;
  approvedById?: string;
  approverName?: string;
  approvedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IScoreListQueryV2 {
  userId?: string;
  setId?: string;
  period?: string;
  approvalStatus?: ScoreApprovalStatusV2;
  periodStartFrom?: Date | string;
  periodStartTo?: Date | string;
  periodEndFrom?: Date | string;
  periodEndTo?: Date | string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IScoreListResultV2 {
  data: IScoreResponseV2[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Body for POST /v2/kpi/scores/bulk – upsert all sets in one request */
export interface IBulkUpsertScoresBodyV2 {
  scores: ICreateScoreBodyV2[];
}

/** Response for POST /v2/kpi/scores/bulk */
export interface IBulkUpsertScoresResultV2 {
  data: IScoreResponseV2[];
  created: number;
  updated: number;
  skipped: number;
}

/** Query for GET /v2/kpi/scoring-context – fetch all sets + scores for modal in one call */
export interface IScoringContextQueryV2 {
  userId: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  timeline: string;
}

/** Response for GET /v2/kpi/scoring-context */
export interface IScoringContextResultV2 {
  sets: IKpiSetResponseV2[];
  scores: IScoreResponseV2[];
}

/** My Performance / User details – GET /v2/kpi/user-details/:userId */
export interface IMyPerformanceUserV2 {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  workEmail?: string;
  avatar: string;
  level: string;
  rank: number;
  totalPoints: number;
  currentXP: number;
  nextLevelXP: number;
  averageScore: number;
}

export interface IMyPerformanceAssignmentSetV2 {
  id: string;
  name: string;
  description?: string;
  timeline: string;
  kpis: Array<{ id: string; name: string; code?: string; description?: string }>;
}

export interface IMyPerformanceKpiHistorySetV2 {
  setId: string;
  setName: string;
  description?: string;
  pointsEarned: number;
  completed: boolean;
  comment?: string;
  scoredAt: string;
  kpis: Array<{ kpiId: string; kpiName: string; kpiDescription?: string; completed: boolean }>;
  timeline: string;
}

export interface IMyPerformancePeriodHistoryItemV2 {
  period: string;
  periodStart: string;
  periodEnd: string;
  sets: IMyPerformanceKpiHistorySetV2[];
  totalSets?: number;
  completedSets?: number;
  completionRate?: number;
}

export interface IMyPerformanceLeaderboardEntryV2 {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  periodChange: number;
  crown: boolean;
  position?: string;
  department?: string;
  isCurrentUser: boolean;
}

export interface IMyPerformanceAchievementV2 {
  id: number;
  name: string;
  completed: boolean;
  date: string | null;
  progress: number;
  max: number;
}

export interface IMyPerformanceResponseV2 {
  user: IMyPerformanceUserV2;
  assignments: Array<{ userId: string; setId: IMyPerformanceAssignmentSetV2 }>;
  kpiHistory: {
    weekly: IMyPerformancePeriodHistoryItemV2[];
    monthly: IMyPerformancePeriodHistoryItemV2[];
    yearly: IMyPerformancePeriodHistoryItemV2[];
  };
  leaderboard: IMyPerformanceLeaderboardEntryV2[];
  period: string;
  achievements: IMyPerformanceAchievementV2[];
  dailyPerformance: Array<{ date: string; score: number }>;
  kpiScores: Array<{
    name: string;
    score: number;
    max: number;
    timesAssigned: number;
    timesCompleted: number;
    completionRate: number;
  }>;
}
