export interface SurveyStatistics {
  total: number;
  active: number;
  drafts: number;
  published: number;
}

export interface PublishedSurvey {
  _id: string;
  title: string;
  description?: string;
  status: 'published';
  isActive: boolean;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  totalResponses: number;
  responseCount: number;
  assignedCount: number;
}

export interface DraftSurvey {
  _id: string;
  title: string;
  description?: string;
  status: 'draft';
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  sourceTemplateId?: string | null;
}

export interface TemplateItem {
  _id: string;
  name: string;
  title: string;
  description?: string;
  questionCount: number;
  category?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface SurveyFilters {
  search: string;
  status: '' | 'active' | 'inactive';
  fromDate: string | null;
  toDate: string | null;
}

export interface PaginationData {
  page: number;
  currentPage: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationData;
}

export type AccordionSection = 'filters' | 'published' | 'drafts' | 'templates';
export interface SurveyAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
}

export interface StatusBadgeConfig {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
}


export interface SurveyRowActions {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggle?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}
