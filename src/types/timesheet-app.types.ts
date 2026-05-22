export interface ITimesheet {
  id: string;
  userId: string;
  userName: string;
  date: string;
  hoursWorked: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedBy?: string;
  approvedDate?: string;
}
