import type { BadgeVariant } from "../components/common/Badge"
import {
  isPendingWorkflowStatus,
  isApprovedWorkflowStatus,
  isRejectedWorkflowStatus,
} from "./constants";

/* -------------------- Department -------------------- */
export const getDepartmentVariant = (department: string): BadgeVariant => {
  const map: Record<string, BadgeVariant> = {
    Engineering: "blue",
    Marketing: "purple",
    Sales: "green",
    HR: "red",
    Finance: "yellow",
    Operations: "gray",
    Design: "orange",
    Product: "emerald",
  };

  return map[department] ?? "gray";
};




/* -------------------- Workflow / Leave Status -------------------- */
export const getWorkflowStatusVariant = (
  status?: string
): BadgeVariant => {
  if (!status) return "gray";

  if (
    status.startsWith("pending")
  ) {
    return "yellow";
  }

  if (
    status.startsWith("approved")
  ) {
    return "green";
  }

  if (
    status.startsWith("rejected")
  ) {
    return "red";
  }

  if (status === "cancelled" || status === "pulled-back") {
    return "gray";
  }

  return "gray";
};

/* -------------------- Comp Off Status -------------------- */
export const getCompOffStatusVariant = (
  status?: string
): BadgeVariant => {
  switch (status) {
    case "pending":
      return "yellow";
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "cancelled":
      return "gray";
    default:
      return "gray";
  }
};

/* -------------------- Timesheet Status -------------------- */


export const getTimesheetStatusVariant = (
  status?: string
): BadgeVariant => {
  if (!status) return "gray";

  if (status === "draft") {
    return "gray";
  }

  if (isPendingWorkflowStatus(status)) {
    return "yellow";
  }

  if (isApprovedWorkflowStatus(status)) {
    return "green";
  }

  if (isRejectedWorkflowStatus(status)) {
    return "red";
  }

  return "gray";
};

/* -------------------- Employee Status -------------------- */
export const getEmployeeStatusVariant = (
  status?: string
): BadgeVariant => {
  switch (status) {
    case "active":
      return "green";
    case "inactive":
      return "red";
    case "terminated":
      return "red";
    default:
      return "gray";
  }
};

  export const getAttendanceStatusVariant =(status?: string): BadgeVariant=> {
    switch (status) {
      case "present":
        return "green";
      case "late":
        return "yellow";
      case "half_day":
        return "orange";
      case "absent":
        return "red";
      case "leave":
        return "blue";
      default:
        return "gray";
    }
  }


  export const getLeaveStatusVariant = (status?: string): BadgeVariant=> {

    switch(status){
          case "earned":
            return "blue";
          case "sick":
            return "red";
          case "casual":
            return "green";
          case "lwp":
            return "gray";
          case "flexi_weekend":
            return "purple";
          default:
            return "gray";    
    }

  }


  //--------------------------organization onboarding status--------------------------

  export const getOrganizationOnboardingStatusVariant = (status?: string): BadgeVariant => {
  const s = status?.toLowerCase();

  switch (s) {
    case "active":
      return "green";
    case "inactive":
      return "red";
    case "suspended":
      return "gray";
    default:
      return "gray";
  }
};