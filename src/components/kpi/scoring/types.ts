import { KpiTimeline } from "../../../types/kpi.api.types";

export interface KpiCompletionStatusItem {
  isCompleted: boolean;
  comment?: string;
}

export interface KpiCompletionStatusMap {
  [kpiId: string]: KpiCompletionStatusItem;
}

export interface SetScoreData {
  setId: string;
  setName: string;
  timeline: KpiTimeline | string;
  kpis: any[];
  completionStatus: KpiCompletionStatusMap;
  comment: string;
  /** Max points for this set (from API); used to compute pointsEarned when saving */
  points?: number;
  approvalStatus?: "pending_l2" | "approved" | undefined;
  pendingBy?:{
    firstName: string;
    lastName: string;
  }
  pendingByName?: string;
  scoreId?: string;
  pendingAtL2?: {
    firstName: string;
    lastName: string;
  };
}

export type TimelineType = KpiTimeline;

export interface PeriodRange {
  start: Date;
  end: Date;
}
