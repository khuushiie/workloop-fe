import type { IKpiSetResponseV2 } from "../../types/kpi.api.types";

/** KPI set row for table (uses id from v2 API) */
export type KpiSetRow = IKpiSetResponseV2;

/** KPI set assignment status (matches backend AssignmentStatusV2). */
export enum KpiSetAssignmentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/** Assignment record (local or from API). Backend sends userId and setId as strings. */
export interface KpiSetAssignmentRecord {
  _id: string;
  userId: string;
  setId: string;
  status: KpiSetAssignmentStatus;
}


/** RTK / API error shape for toast messages */
export interface ApiErrorLike {
  data?: { message?: string };
  response?: { data?: { message?: string } };
}

export function getErrorMessage(
  error: ApiErrorLike | unknown,
  fallback: string
): string {
  const e = error as ApiErrorLike | undefined;
  return e?.data?.message ?? e?.response?.data?.message ?? fallback;
}
