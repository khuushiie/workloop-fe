import {  IAttendanceRegularization, IRegularizationFilters, RegularizationType, } from "../../../types/regularization.types";
import { ViewMode, WorkflowStatusCode } from "../../../utils/constants";

// ===== ENUMS =====
export enum AccordionSection {
  PENDING = 'pending',
  HISTORY = 'history',
}

// ===== TYPES =====
export type RegularizationOption = { label: string; value: string };

// ===== INTERFACES =====
export interface RegularizationManagementProps {
  isManagerView?: boolean;
  title?: string;
  description?: string;
}

export interface ViewModeTabsProps {
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export interface FiltersBarProps {
  filters: IRegularizationFilters;
  setFilters: React.Dispatch<React.SetStateAction<IRegularizationFilters>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  regularizationTypeOptions: RegularizationOption[] | undefined;
  employeeOptions: { value: string; label: string }[];
  employeeLoading: boolean;
  departments: string[];
}

export interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IAttendanceRegularization;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  getRegularizationTypeLabel: (type: RegularizationType) => string;
  getStatusColor: (status: WorkflowStatusCode) => string;
}

export interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: IAttendanceRegularization;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  onReject: () => void;
  processing: string | null;
  formatDate: (date: string) => string;
}

// ===== UTILITY FUNCTIONS =====
export const getRegularizationTypeLabel = (type: RegularizationType): string => {
  const labels: Record<string, string> = {
    [RegularizationType.FORGOT_CHECKIN]: "Forgot Check-in",
    [RegularizationType.LATE_CHECKIN]: "Late Check-in",
    [RegularizationType.FORGOT_CHECKOUT]: "Forgot Check-out",
    [RegularizationType.EARLY_CHECKOUT]: "Early Check-out",
    [RegularizationType.MISSED_BREAK]: "Missed Break",
    [RegularizationType.SYSTEM_ERROR]: "System Error",
    [RegularizationType.OTHER]: "Other",
  };
  return labels[type] || type;
};

export const parseResponse = (response: unknown): { data: IAttendanceRegularization[]; total: number } => {
  if (Array.isArray(response)) return { data: response, total: response.length };
  if (response && typeof response === 'object') {
    const res = response as Record<string, unknown>;
    if ('data' in res && Array.isArray(res.data)) {
      return { 
        data: res.data as IAttendanceRegularization[], 
        total: typeof res.total === 'number' ? res.total : res.data.length 
      };
    }
    if (res.data && typeof res.data === 'object') {
      const nestedData = res.data as Record<string, unknown>;
      if ('data' in nestedData && Array.isArray(nestedData.data)) {
        return { 
          data: nestedData.data as IAttendanceRegularization[], 
          total: typeof nestedData.total === 'number' ? nestedData.total : nestedData.data.length 
        };
      }
    }
  }
  return { data: [], total: 0 };
};

