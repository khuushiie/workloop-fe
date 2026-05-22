export interface ResourceAllocationPayload {
  userId: string;
  projectId?: string;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  projectRole: string;
  grade?: string;
}
