/**
 * Workflow Decision Enum
 * Mirrors the backend WorkflowDecision enum for type safety
 */
export enum WorkflowDecision {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  SKIPPED = "skipped",
  CANCELLED = "cancelled",
  OVERRIDDEN = "overridden",
}

