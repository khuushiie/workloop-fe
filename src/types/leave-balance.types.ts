// Leave Balance Report Types
export interface ILeaveBalanceData {
  userId: string;
  userName: string;
  employeeId: string;
  department: string;
  position: string;
  manager: string;
  reportingManager: string;
  joinDate: string;
  earned: {
    allocated: number;
    used: number;
    balance: number;
  };
  sick: {
    allocated: number;
    used: number;
    balance: number;
  };
  lwp: {
    used: number;
  };
  wfh: {
    used: number;
  };
  flexi_weekend: {
    allocated: number;
    used: number;
    balance: number;
  };
  totalAllocated: number;
  totalUsed: number;
  totalBalance: number;
}

export interface LeaveBalanceReport {
  filters: {
    year: number;
    month?: number;
    department?: string;
  };
  summary: {
    totalEmployees: number;
    totalEarnedAllocated: number;
    totalSickAllocated: number;
    totalEarnedUsed: number;
    totalSickUsed: number;
    totalLWPUsed: number;
    totalWFHUsed: number;
    totalBalance: number;
    employeesWithZeroBalance: number;
    employeesWithExcessLWP: number;
  };
  employees: ILeaveBalanceData[];
  reportGeneratedAt: string;
}

export interface ILeaveBalanceReportFilters {
  department?: string;
  userId?: string;
  year?: string;
  month?: string;
}

/** @deprecated Use ILeaveBalanceData */
export type LeaveBalanceData = ILeaveBalanceData;
/** @deprecated Use ILeaveBalanceReport */
export type LeaveBalanceReport = ILeaveBalanceReport;
/** @deprecated Use ILeaveBalanceReportFilters */
export type LeaveBalanceReportFilters = ILeaveBalanceReportFilters;
