export type SurveyStatus = 'active' | 'completed';
export interface PaginationParams {
  page: number;
  pageSize: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponsesStats {
  surveysCreated: number;
  activeSurveys: number;
  completedSurveys: number;
}

export interface AssignmentEntity {
  id: string;
  name: string;
  email?: string;
}

export type AssignedToType = 'individual' | 'role' | 'designation' | 'department';

export interface AssignedToInfo {
  type: AssignedToType;
  entities: AssignmentEntity[];
  totalCount: number;
}

export interface AssignmentDetails {
  type: AssignedToType;
  entities: AssignmentEntity[];
  totalCount: number;
}

export interface SurveyResponseSummary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  completed: number;
  pending: number;
  notStarted: number;
  total: number;
  status: SurveyStatus;
  assignedTo: AssignedToInfo;
}

export interface ResponsesOverviewData {
  surveys: SurveyResponseSummary[];
  stats: ResponsesStats;
  pagination: PaginationInfo;
}


export interface InsightsStats {
  totalAssigned: number;
  completed: number;
  pending: number;
  notStarted: number;
  completionRate: number;
  surveyTitle: string;
  startDate: string;
  endDate: string;
}

export interface SurveyInsightsInfo {
  _id: string;
  title: string;
  publishedOn: string;
  totalQuestions: number;
  status: 'active' | 'closed';
}

export interface SurveyInsightsStats {
  distributed: number;
  started: number;
  submitted: number;
  inProgress: number;
  notOpened: number;
}

export interface EmployeeInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  employeeCode: string;
}

export interface CompletedResponse {
  id: string;
  surveyId: string;
  employee: EmployeeInfo;
  reportingManager: string;
  functionalManager: string;
  createdAt: string;
  submittedDate: string;
  submittedTime: string;
  responseId: string;
}


export type PendingStatus = 'pending' | 'not_started';

export interface PendingResponse {
  id: string;
  surveyId: string;
  employee: EmployeeInfo;
  reportingManager: string;
  functionalManager: string;
  status: PendingStatus;
  assignedDate: string;
  startTime: string | null;
  lastReminder?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ResponsesFilters {
  search: string;
  status: SurveyStatus | '';
  dateRange?: DateRange;
}

export interface InsightsFilters {
  search: string;
  date: string | null;
  department: string;
}


export type InsightsTabKey = 'completed' | 'pending';
export type PendingSubTabKey = 'pending' | 'not_started';

export interface TabItem<T> {
  k: T;
  label: string;
}
export type QuestionType = 'rating' | 'checkbox' | 'short_text' | 'long_text' | 'mcq' | 'date' | 'number';

export interface ResponseAnswer {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  answer: string | number | string[];
  selectedOptionLabel?: string;
  maxRating?: number;
}

export interface SubmittedResponseDetail {
  id: string;
  surveyId: string;
  surveyTitle: string;
  employee: EmployeeInfo;
  submittedAt: string;
  answers: ResponseAnswer[];
}
