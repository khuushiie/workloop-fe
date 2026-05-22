export type { IApiResponse, IApiResponseDto, IPaginationMeta } from './user.api.types';
export type SurveyQuestionType = 'short_text' | 'long_text' | 'mcq' | 'checkbox' | 'rating' | 'date' | 'number';
export type SurveyAssignmentEntityType = 'individual' | 'designation' | 'department' | 'role';
export type SurveyStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type MySurveyStatus = 'pending' | 'inProgress' | 'completed' | 'overdue';
export type MySurveyTab = 'pending' | 'inProgress' | 'completed' | 'all';
export type ResponsesTab = 'completed' | 'pending' | 'notStarted';
export type QuestionState = 'answered' | 'current' | 'notVisited' | 'notAnswered';

export interface ISurveyQuestionOption {
  _id?: string;
  tempId: string;
  text: string;
}

export interface ISurveyQuestion {
  _id?: string;
  tempId: string;
  order: number;
  type: SurveyQuestionType;
  text: string;
  isRequired: boolean;
  options: ISurveyQuestionOption[] | null;
  maxRating?: number;
}
export interface ISurveySchedule {
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
}

export interface ISurveyAssignment {
  entityType: SurveyAssignmentEntityType | null;
  entityIds: string[];
}

export interface ISurveyTemplateListItem {
  _id: string;
  name: string;
  description?: string;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ISurveyTemplate {
  _id: string;
  name: string;
  description?: string;
  assignment?: ISurveyAssignment;
  questions: ISurveyQuestion[];
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export interface ISurveyDraft {
  _id: string;
  title: string;
  description?: string;
  schedule: ISurveySchedule;
  assignment: ISurveyAssignment;
  questions: ISurveyQuestion[];
  sourceTemplateId?: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface IPublishedSurvey {
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

export interface IPublishedSurveyParams {
  search?: string;
  status?: 'active' | 'inactive';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface ISurveyStatistics {
  total: number;
  published: number;
  drafts: number;
  templates?: number;
  active?: number;
}

export interface IMySurveysStats {
  totalAssigned: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface IResponsesOverviewStats {
  surveysCreated: number;
  activeSurveys: number;
  completedSurveys: number;
}

export interface IMySurvey {
  _id: string;
  title: string;
  description: string;
  status: MySurveyStatus;
  questionCount: number;
  estimatedTime: string;
  dueDate: string;
  answeredCount?: number;
  startedAt?: string;
  completedAt?: string;
  timeRemaining?: string;
  responseId?: string;
}

export interface ISurveyInfo {
  _id: string;
  title: string;
  status: 'active' | 'upcoming' | 'closed';
  aboutText: string;
  instructions: string[];
  totalQuestions: number;
  questionTypes: string;
  dueDate: string;
  endTime: string;
  userProgress: {
    status: 'notStarted' | 'inProgress' | 'completed';
    answeredCount: number;
    totalQuestions: number;
  };
  isConfidential: boolean;
  timeRemaining?: {
    percentage: number;
    text: string;
  };
}

export interface ITakeSurveyQuestion {
  _id: string;
  order: number;
  type: SurveyQuestionType;
  text: string;
  isRequired: boolean;
  options: ISurveyQuestionOption[] | null;
  maxRating?: number;
}

export interface ITakeSurveyData {
  _id: string;
  title: string;
  totalQuestions: number;
  questions: ITakeSurveyQuestion[];
  savedAnswers?: Record<string, string | string[] | number | null>;
  lastQuestionIndex?: number;
}

export interface ISurveyUserAnswer {
  questionId: string;
  value: string | string[] | number | null;
}

export interface IUserSurveyResponse {
  _id: string;
  surveyId: string;
  surveyTitle: string;
  employeeName: string;
  employeeEmail: string;
  employeeDepartment: string;
  employeeInitials: string;
  submittedAt: string;
  totalQuestions: number;
  answers: IResponseAnswer[];
}

export interface IResponseAnswer {
  questionId: string;
  questionNumber: number;
  questionText: string;
  questionType: SurveyQuestionType;
  answer: string | string[] | number | null;
  maxRating?: number;
}

export interface IAssignmentEntity {
  id: string;
  name: string;
  email?: string;
}

export interface IAssignedToInfo {
  type: SurveyAssignmentEntityType;
  entities: IAssignmentEntity[];
  totalCount: number;
}

export interface ISurveyResponseSummary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  completed: number;
  pending: number;
  notStarted: number;
  total: number;
  status: 'active' | 'completed';
  assignedTo: IAssignedToInfo;
}

export interface IResponseOverviewItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  completed: number;
  pending: number;
  notStarted: number;
  total: number;
  status: 'active' | 'completed';
  assignedTo: IAssignedToInfo;
}

export interface IResponseOverviewParams {
  search?: string;
  status?: 'active' | 'completed' | 'all';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface IEmployeeInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  employeeCode: string;
}

export interface ICompletedResponse {
  id: string;
  surveyId: string;
  employee: IEmployeeInfo;
  reportingManager: string;
  functionalManager: string;
  createdAt: string;
  submittedDate: string;
  submittedTime: string;
  responseId: string;
}

export interface ICompletedResponsesParams {
  surveyId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface IPendingResponse {
  id: string;
  surveyId: string;
  employee: IEmployeeInfo;
  reportingManager: string;
  functionalManager: string;
  status: 'pending' | 'not_started';
  assignedDate: string;
  startTime: string | null;
  lastReminder?: string;
}

export interface IPendingResponsesParams {
  surveyId: string;
  tab: 'pending' | 'not_started';
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ISurveyInsights {
  totalAssigned: number;
  completed: number;
  pending: number;
  notStarted: number;
  completionRate: number;
  surveyTitle: string;
  startDate: string;
  endDate: string;
}

export interface IResponseDetail {
  id: string;
  surveyId: string;
  surveyTitle: string;
  employee: IEmployeeInfo;
  submittedAt: string;
  answers: Array<{
    questionId: string;
    questionNumber: number;
    questionText: string;
    questionType: SurveyQuestionType;
    answer: string | string[] | number;
    maxRating?: number;
  }>;
}

export interface ISurveyFormState {
  title: string;
  description: string;
  schedule: ISurveySchedule;
  assignment: ISurveyAssignment;
  questions: ISurveyQuestion[];
  sourceTemplateId: string | null;
  sourceDraftId: string | null;
}

export interface ICreateDraftPayload {
  title: string;
  description?: string;
  schedule: ISurveySchedule;
  assignment: ISurveyAssignment;
  questions: Omit<ISurveyQuestion, '_id'>[];
  sourceTemplateId?: string | null;
}

export interface IUpdateDraftPayload extends ICreateDraftPayload {
  _id: string;
}

export interface ICreateTemplatePayload {
  name: string;
  description?: string;
  assignment?: ISurveyAssignment;
  questions: Omit<ISurveyQuestion, '_id'>[];
}

export interface IUpdateTemplatePayload extends ICreateTemplatePayload {
  _id: string;
}

export interface IPublishSurveyPayload {
  title: string;
  description?: string;
  schedule: ISurveySchedule;
  assignment: ISurveyAssignment;
  questions: Omit<ISurveyQuestion, '_id'>[];
  sourceTemplateId?: string | null;
  sourceDraftId?: string | null;
}

export interface ISubmitSurveyPayload {
  surveyId: string;
  answers: ISurveyUserAnswer[];
  timeSpent: number;
}
export interface ISurveyPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IValidationError {
  field: string;
  message: string;
}

export interface ISurveyValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}

export interface IIndividualOption {
  _id: string;
  firstName: string;
  lastName: string;
  workEmail: string;
  department?: string;
  designation?: string;
}

export interface IDesignationOption {
  _id: string;
  name: string;
  category?: string;
}

export interface IDepartmentOption {
  _id: string;
  name: string;
}

export interface IRoleOption {
  _id: string;
  name: string;
}

export type EntityOption = IIndividualOption | IDesignationOption | IDepartmentOption | IRoleOption;
export interface IQuestionTypeConfig {
  type: SurveyQuestionType;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  minOptions?: number;
}

export interface IEntityTypeConfig {
  type: SurveyAssignmentEntityType;
  label: string;
  icon: string;
  selectLabel: string;
  placeholder: string;
}
export interface ITakeSurveyState {
  currentIndex: number;
  answers: Record<string, string | string[] | number | null>;
  questionStates: Record<string, QuestionState>;
  isSaving: boolean;
  isSubmitting: boolean;
}

export type SurveyTemplateListItem = ISurveyTemplateListItem;
export type SurveyTemplate = ISurveyTemplate;
export type SurveyDraft = ISurveyDraft;
export type MySurvey = IMySurvey;
export type MySurveysStats = IMySurveysStats;
export type SurveyInfo = ISurveyInfo;
export type TakeSurveyData = ITakeSurveyData;
export type UserSurveyResponse = IUserSurveyResponse;
export type CreateTemplatePayload = ICreateTemplatePayload;
export type UpdateTemplatePayload = IUpdateTemplatePayload;
export type CreateDraftPayload = ICreateDraftPayload;
export type UpdateDraftPayload = IUpdateDraftPayload;
export type PublishSurveyPayload = IPublishSurveyPayload;
export type UserAnswer = ISurveyUserAnswer;
export type SubmitSurveyPayload = ISubmitSurveyPayload;
export type SurveyFormState = ISurveyFormState;
export type SurveyQuestion = ISurveyQuestion;
export type QuestionOption = ISurveyQuestionOption;
export type SurveySchedule = ISurveySchedule;
export type SurveyAssignment = ISurveyAssignment;
export type TakeSurveyQuestion = ITakeSurveyQuestion;
export type ResponseAnswer = IResponseAnswer;
export type ValidationError = IValidationError;
export type SurveyValidationResult = ISurveyValidationResult;
export type IndividualOption = IIndividualOption;
export type DesignationOption = IDesignationOption;
export type DepartmentOption = IDepartmentOption;
export type RoleOption = IRoleOption;
export type QuestionTypeConfig = IQuestionTypeConfig;
export type EntityTypeConfig = IEntityTypeConfig;
export type TakeSurveyState = ITakeSurveyState;
export type QuestionType = SurveyQuestionType;
export type AssignmentEntityType = SurveyAssignmentEntityType;
export type BackendQuestionType = 'short_text' | 'long_text' | 'number' | 'mcq' | 'checkbox' | 'rating' | 'date' | 'boolean';
export type BackendSurveyStatus = 'draft' | 'published' | 'template' | 'inactive';
export interface IBackendQuestionOption {
  label: string;
  value: string;
}
export interface IBackendSurveyQuestion {
  _id?: string;
  questionText: string;
  type: BackendQuestionType;
  options?: IBackendQuestionOption[];
  isRequired: boolean;
  orderIndex: number;
  maxRating?: number;
}
export interface IBackendSurveyResponse {
  _id: string;
  title: string;
  description?: string;
  status: BackendSurveyStatus;
  questions: IBackendSurveyQuestion[];
  startTime: string;
  endTime: string;
  createdBy: string;
  createdAt: string;
  assignee?: IBackendAssignee;
}
export interface IBackendSurveyListResponse {
  data: IBackendSurveyResponse[];
  total: number;
  page?: number;
  limit?: number;
}
export interface IBackendSurveyProgressAnswer {
  questionId: string;
  value?: string;
  numericValue?: number;
  BooleanValue?: boolean;
  dateValue?: string;
  selectedOptionLabel?: string;
}
export interface IBackendSurveyForSubmission {
  surveyId: string;
  title: string;
  description?: string;
  questions: IBackendSurveyQuestion[];
  answers: IBackendSurveyProgressAnswer[];
  startTime: string;
  endTime: string;
  status: string;
  submittedAt?: string | null;
}
export interface IBackendStatsResponse {
  totalSurveys: number;
  published: number;
  templates: number;
  drafts: number;
}
export interface IBackendResponsesStatsResponse {
  totalSurveys: number;
  activeSurveys: number;
  completedSurveys: number;
}
export interface IBackendResponsesOverviewItem {
  surveyId: string;
  title: string;
  description?: string;
  assignedTo: string[];
  surveyLifeCycleStatus: string; // "Active" | "Completed"
  responsesProgress: {
    pending: number;
    inProgress: number;
    completed: number;
  };
  startTime: string;
  endTime: string;
}

export interface IBackendSurveyReportRow {
  userId: string;
  surveyId: string;
  title: string;
  employeeName: string;
  employeeId: string;
  reportingManager: string;
  functionalManager: string;
  submittedAt: string | null;
  startTime: string | null;
  responseId: string | null;
  currentStatus: 'completed' | 'in-progress' | 'pending';
}
export interface IBackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBackendInsightsStatsResponse {
  totalAssigned: number;
  completed: number;
  pending: number;
  notStarted: number;
}
export interface IBackendMySurveyItem {
  survey_id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  totalQuestionNo: number;
  status: string;
  response_id?: string;
}

export interface IBackendDeleteSurveyResponse {
  message: string;
  deletedSurveyId: string;
}
export interface IBackendResponseDetail {
  _id: string;
  surveyTitle: string;
  surveyDescription?: string;
  employeeName: string;
  EmpID?: string;
  statusLabel: string;
  submittedAt?: string;
  startTime?: string;
  answers: Array<{
    questionId: string;
    value: string;
    questionDetails: {
      questionText: string;
      type: string;
      options: Array<{ label: string; value: string }>;
      isRequired?: boolean;
      orderIndex?: number;
      maxRating?: number;
      _id?: string;
    };
  }>;
}

export interface IBackendTemplateDropdownItem {
  _id: string;
  title: string;
}
export interface IBackendAssignee {
  type: SurveyAssignmentEntityType;
  value: string[];
}

export interface IBackendUpsertSurveyRequest {
  id?: string;
  title: string;
  description?: string;
  questions: Omit<IBackendSurveyQuestion, '_id'>[];
  assignee: IBackendAssignee;
  startTime: string;
  endTime: string;
  status: BackendSurveyStatus;
}

export interface IBackendDuplicateSurveyRequest {
  title: string;
}
export interface IBackendSurveyFilterParams {
  search?: string;
  status?: BackendSurveyStatus;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// TRANSFORMATION UTILITIES (Frontend <-> Backend)
export const mapQuestionTypeToFrontend = (type: BackendQuestionType): SurveyQuestionType => {
  if (type === 'boolean') return 'mcq';
  return type as SurveyQuestionType;
};

export const mapQuestionTypeToBackend = (type: SurveyQuestionType): BackendQuestionType => {
  return type as BackendQuestionType;
};

export const mapStatusToIsActive = (status: BackendSurveyStatus): boolean => {
  return status === 'published';
};

export const mapBackendStatusToDisplay = (status: BackendSurveyStatus): string => {
  const mapping: Record<BackendSurveyStatus, string> = {
    'draft': 'Draft',
    'published': 'Active',
    'template': 'Template',
    'inactive': 'Inactive',
  };
  return mapping[status] || status;
};

export const transformBackendAssigneeToFrontend = (assignee?: IBackendAssignee): ISurveyAssignment => {
  return {
    entityType: assignee?.type ?? null,
    entityIds: assignee?.value ?? [],
  };
};

export const transformBackendSurveyToPublished = (survey: IBackendSurveyResponse): IPublishedSurvey => {
  return {
    _id: survey._id,
    title: survey.title,
    description: survey.description,
    status: 'published',
    isActive: survey.status === 'published',
    startDate: survey.startTime,
    endDate: survey.endTime,
    createdAt: survey.createdAt,
    createdBy: {
      _id: '',
      firstName: survey.createdBy?.split(' ')[0] ?? '',
      lastName: survey.createdBy?.split(' ').slice(1).join(' ') ?? '',
    },
    totalResponses: 0,
    responseCount: 0,
    assignedCount: 0,
  };
};

export const transformBackendQuestionToFrontend = (
  question: IBackendSurveyQuestion,
  index: number
): ISurveyQuestion => {
  return {
    _id: question._id,
    tempId: question._id ?? `temp-${index}`,
    order: question.orderIndex,
    type: mapQuestionTypeToFrontend(question.type),
    text: question.questionText,
    isRequired: question.isRequired,
    options: question.options?.map((opt, i) => ({
      _id: `opt-${i}`,
      tempId: `opt-${i}`,
      text: opt.label,
    })) ?? null,
    maxRating: question.maxRating,
  };
};

export const transformFrontendQuestionToBackend = (
  question: ISurveyQuestion,
  index: number
): Omit<IBackendSurveyQuestion, '_id'> => {
  return {
    questionText: question.text,
    type: mapQuestionTypeToBackend(question.type),
    isRequired: question.isRequired,
    orderIndex: index,
    maxRating: question.maxRating,
    options: question.options?.map(opt => ({
      label: opt.text,
      value: opt.text.toLowerCase().replace(/\s+/g, '_'),
    })),
  };
};
