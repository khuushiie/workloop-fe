/**
 * Survey Module Types & Helpers
 * =============================
 * Re-exports types from centralized @/types and provides
 * survey-specific constants and helper functions.
 */

// ==================== RE-EXPORT ALL SURVEY TYPES ====================
// Types are now centralized in @/types/survey.api.types.ts
export type {
  // Enums & type aliases
  SurveyQuestionType as QuestionType,
  SurveyAssignmentEntityType as AssignmentEntityType,
  SurveyStatus,
  MySurveyStatus,
  MySurveyTab,
  QuestionState,
  // Question types
  ISurveyQuestionOption as QuestionOption,
  ISurveyQuestion as SurveyQuestion,
  // Schedule & Assignment
  ISurveySchedule as SurveySchedule,
  ISurveyAssignment as SurveyAssignment,
  // Template types
  ISurveyTemplateListItem as SurveyTemplateListItem,
  ISurveyTemplate as SurveyTemplate,
  // Draft types
  ISurveyDraft as SurveyDraft,
  // Form state
  ISurveyFormState as SurveyFormState,
  // Payload types
  ICreateDraftPayload as CreateDraftPayload,
  IUpdateDraftPayload as UpdateDraftPayload,
  ICreateTemplatePayload as CreateTemplatePayload,
  IUpdateTemplatePayload as UpdateTemplatePayload,
  IPublishSurveyPayload as PublishSurveyPayload,
  ISubmitSurveyPayload as SubmitSurveyPayload,
  ISurveyUserAnswer as UserAnswer,
  // Assignment options
  IIndividualOption as IndividualOption,
  IDesignationOption as DesignationOption,
  IDepartmentOption as DepartmentOption,
  IRoleOption as RoleOption,
  EntityOption,
  // Validation types
  IValidationError as ValidationError,
  ISurveyValidationResult as SurveyValidationResult,
  // Config types
  IQuestionTypeConfig as QuestionTypeConfig,
  IEntityTypeConfig as EntityTypeConfig,
  // My surveys types
  IMySurveysStats as MySurveysStats,
  IMySurvey as MySurvey,
  ISurveyInfo as SurveyInfo,
  // Take survey types
  ITakeSurveyQuestion as TakeSurveyQuestion,
  ITakeSurveyData as TakeSurveyData,
  ITakeSurveyState as TakeSurveyState,
  // Response types
  IResponseAnswer as ResponseAnswer,
  IUserSurveyResponse as UserSurveyResponse,
  // Paginated response
  ISurveyPaginatedResponse as PaginatedResponse,
} from '../../types';

// Import types needed for constants and helpers
import type {
  SurveyQuestionType,
  SurveyAssignmentEntityType,
  ISurveyQuestionOption,
  ISurveyQuestion,
  ISurveyFormState,
  IQuestionTypeConfig,
  IEntityTypeConfig,
} from '../../types';

// ==================== QUESTION TYPE CONFIG ====================

export const QUESTION_TYPE_CONFIG: Record<SurveyQuestionType, IQuestionTypeConfig> = {
  short_text: {
    type: 'short_text',
    label: 'Short Text',
    shortLabel: 'Short',
    description: 'Single line text input',
    icon: 'AlignLeft',
    hasOptions: false,
  },
  long_text: {
    type: 'long_text',
    label: 'Long Text',
    shortLabel: 'Long',
    description: 'Multi-line text input',
    icon: 'AlignJustify',
    hasOptions: false,
  },
  mcq: {
    type: 'mcq',
    label: 'Multiple Choice',
    shortLabel: 'MCQ',
    description: 'Select one option',
    icon: 'Circle',
    hasOptions: true,
    minOptions: 2,
  },
  checkbox: {
    type: 'checkbox',
    label: 'Checkbox',
    shortLabel: 'Check',
    description: 'Select multiple options',
    icon: 'CheckSquare',
    hasOptions: true,
    minOptions: 2,
  },
  rating: {
    type: 'rating',
    label: 'Rating',
    shortLabel: 'Rating',
    description: 'Star rating scale',
    icon: 'Star',
    hasOptions: false,
  },
  date: {
    type: 'date',
    label: 'Date',
    shortLabel: 'Date',
    description: 'Date picker input',
    icon: 'Calendar',
    hasOptions: false,
  },
  number: {
    type: 'number',
    label: 'Number',
    shortLabel: 'Number',
    description: 'Numeric input',
    icon: 'Hash',
    hasOptions: false,
  },
};

// ==================== ENTITY TYPE CONFIG ====================

export const ENTITY_TYPE_CONFIG: Record<SurveyAssignmentEntityType, IEntityTypeConfig> = {
  individual: {
    type: 'individual',
    label: 'Individual',
    icon: 'User',
    selectLabel: 'Select Employees',
    placeholder: 'Choose employees...',
  },
  designation: {
    type: 'designation',
    label: 'Designation',
    icon: 'Briefcase',
    selectLabel: 'Select Designation',
    placeholder: 'Choose designation...',
  },
  department: {
    type: 'department',
    label: 'Department',
    icon: 'Building2',
    selectLabel: 'Select Department',
    placeholder: 'Choose department...',
  },
  role: {
    type: 'role',
    label: 'Role',
    icon: 'Shield',
    selectLabel: 'Select Role',
    placeholder: 'Choose role...',
  },
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate a unique temporary ID for new questions
 */
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create a new empty option with default values
 */
export const createEmptyOption = (): ISurveyQuestionOption => ({
  tempId: generateTempId(),
  text: '',
});

/**
 * Create a new empty question with default values
 */
export const createEmptyQuestion = (type: SurveyQuestionType, order: number): ISurveyQuestion => {
  const hasOptions = QUESTION_TYPE_CONFIG[type].hasOptions;

  const question: ISurveyQuestion = {
    tempId: generateTempId(),
    order,
    type,
    text: '',
    isRequired: false,
    options: hasOptions ? [createEmptyOption(), createEmptyOption()] : null,
  };

  // Add maxRating for rating type
  if (type === 'rating') {
    question.maxRating = 5;
  }

  return question;
};

/**
 * Create initial empty form state
 */
export const createEmptyFormState = (): ISurveyFormState => ({
  title: '',
  description: '',
  schedule: {
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
  },
  assignment: {
    entityType: null,
    entityIds: [],
  },
  questions: [],
  sourceTemplateId: null,
  sourceDraftId: null,
});

// ==================== LEGACY API RESPONSE TYPE (for backward compatibility) ====================

/**
 * @deprecated Use IApiResponse from @/types instead
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
