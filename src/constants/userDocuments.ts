/**
 * Lifecycle states of a user document.
 */
export enum UserDocumentStatus {
  ACTIVE = 'active',
  PENDING_NEW = 'pending_new',
  PENDING_UPDATE = 'pending_update',
  ARCHIVED = 'archived',
}

/**
 * Workflow decision outcomes for document approval.
 */
export enum DocumentApprovalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}
