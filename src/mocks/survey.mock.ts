/**
 * Survey Module Mock Data & Handlers
 * ===================================
 * This file provides mock data for the Survey module during development.
 * When VITE_USE_MOCK_DATA=true, the baseQuery intercepts matching URLs
 * and returns this mock data instead of making real network requests.
 * 
 * Features:
 * - In-memory state persistence for mutations
 * - Optional localStorage backup for session survival
 * - Error simulation via ?_mockError=400|500 query params
 */

import type {
  SurveyTemplateListItem,
  SurveyTemplate,
  SurveyDraft,
  MySurvey,
  MySurveysStats,
  SurveyInfo,
  TakeSurveyData,
  UserSurveyResponse,
  SurveyQuestion,
  QuestionOption,
} from "../components/survey/types";

// ============================================================================
// TYPES - API Response Types
// ============================================================================

export interface ISurveyStatistics {
  total: number;
  published: number;
  templates: number;
  drafts: number;
}

export interface IPublishedSurvey {
  _id: string;
  title: string;
  description: string;
  status: "published";
  isActive: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
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

export interface IResponsesOverviewStats {
  surveysCreated: number;
  activeSurveys: number;
  completedSurveys: number;
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
  status: "active" | "completed";
  assignedTo: {
    type: "individual" | "department" | "designation" | "role";
    entities: Array<{ id: string; name: string; email?: string }>;
    totalCount: number;
  };
}

export interface IPaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// MOCK STATE - In-memory store that mutations update
// ============================================================================

const STORAGE_KEY = "hrms_survey_mock_state";

interface MockState {
  templates: SurveyTemplate[];
  drafts: SurveyDraft[];
  publishedSurveys: IPublishedSurvey[];
  mySurveys: MySurvey[];
  savedAnswers: Record<string, Record<string, unknown>>; // surveyId -> questionId -> value
}

// Forward declarations - these will be initialized before first use
let _mockState: MockState | null = null;

// Lazy initialization to avoid circular reference
const getDefaultMockState = (): MockState => ({
  templates: [...MOCK_TEMPLATES_DATA],
  drafts: [...MOCK_DRAFTS_DATA],
  publishedSurveys: [...MOCK_PUBLISHED_SURVEYS_DATA],
  mySurveys: [...MOCK_MY_SURVEYS_DATA],
  savedAnswers: {},
});

// Initialize from localStorage or defaults (called lazily)
const loadInitialState = (): MockState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore localStorage errors
  }
  return getDefaultMockState();
};

// Mutable mock state - accessed via getter to ensure lazy initialization
export const getMockState = (): MockState => {
  if (!_mockState) {
    _mockState = loadInitialState();
  }
  return _mockState;
};

// Persist to localStorage
const persistState = (): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(getMockState()));
  } catch {
    // Ignore localStorage errors
  }
};

// Reset mock state (useful for testing)
export const resetMockState = (): void => {
  _mockState = getDefaultMockState();
  persistState();
};

// ============================================================================
// STATIC MOCK DATA
// ============================================================================

const MOCK_TEMPLATES_DATA: SurveyTemplate[] = [
  {
    _id: "tpl_001",
    name: "Employee Satisfaction Survey",
    description: "Quarterly employee satisfaction and engagement assessment",
    questions: [
      {
        _id: "q_tpl_001",
        tempId: "temp_tpl_001",
        order: 1,
        type: "rating",
        text: "How satisfied are you with your work environment?",
        isRequired: true,
        options: null,
        maxRating: 5,
      },
      {
        _id: "q_tpl_002",
        tempId: "temp_tpl_002",
        order: 2,
        type: "mcq",
        text: "How would you rate your work-life balance?",
        isRequired: true,
        options: [
          { _id: "opt_001", tempId: "temp_opt_001", text: "Excellent" },
          { _id: "opt_002", tempId: "temp_opt_002", text: "Good" },
          { _id: "opt_003", tempId: "temp_opt_003", text: "Average" },
          { _id: "opt_004", tempId: "temp_opt_004", text: "Poor" },
        ],
      },
      {
        _id: "q_tpl_003",
        tempId: "temp_tpl_003",
        order: 3,
        type: "long_text",
        text: "What improvements would you suggest?",
        isRequired: false,
        options: null,
      },
    ],
    createdAt: "2026-01-15T10:30:00Z",
    updatedAt: "2026-01-20T14:00:00Z",
    createdBy: {
      _id: "user_001",
      firstName: "John",
      lastName: "Doe",
    },
  },
  {
    _id: "tpl_002",
    name: "Onboarding Feedback Template",
    description: "Collect feedback from new joiners about their onboarding experience",
    questions: [
      {
        _id: "q_tpl_004",
        tempId: "temp_tpl_004",
        order: 1,
        type: "rating",
        text: "How would you rate your onboarding experience?",
        isRequired: true,
        options: null,
        maxRating: 5,
      },
      {
        _id: "q_tpl_005",
        tempId: "temp_tpl_005",
        order: 2,
        type: "checkbox",
        text: "Which onboarding activities were most helpful?",
        isRequired: false,
        options: [
          { _id: "opt_005", tempId: "temp_opt_005", text: "Documentation" },
          { _id: "opt_006", tempId: "temp_opt_006", text: "Buddy System" },
          { _id: "opt_007", tempId: "temp_opt_007", text: "Training Sessions" },
          { _id: "opt_008", tempId: "temp_opt_008", text: "Team Introductions" },
        ],
      },
    ],
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-01-10T09:00:00Z",
    createdBy: {
      _id: "user_002",
      firstName: "Jane",
      lastName: "Smith",
    },
  },
];

const MOCK_DRAFTS_DATA: SurveyDraft[] = [
  {
    _id: "draft_001",
    title: "Team Collaboration Assessment - Draft",
    description: "Assessing cross-functional team collaboration",
    schedule: {
      startDate: "2026-02-15",
      endDate: "2026-02-28",
      startTime: "09:00",
      endTime: "23:59",
    },
    assignment: {
      entityType: "department",
      entityIds: ["dept_001"],
    },
    questions: [
      {
        _id: "q_draft_001",
        tempId: "temp_draft_001",
        order: 1,
        type: "rating",
        text: "Rate your team's collaboration effectiveness",
        isRequired: true,
        options: null,
        maxRating: 5,
      },
    ],
    sourceTemplateId: "tpl_001",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-02-03T14:30:00Z",
  },
];

const MOCK_PUBLISHED_SURVEYS_DATA: IPublishedSurvey[] = [
  {
    _id: "survey_001",
    title: "Q1 2026 Employee Satisfaction Survey",
    description: "Quarterly employee satisfaction and engagement survey",
    status: "published",
    isActive: true,
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    startTime: "09:00",
    endTime: "23:59",
    createdAt: "2026-01-15T10:00:00Z",
    createdBy: { _id: "user_001", firstName: "John", lastName: "Smith" },
    totalResponses: 45,
    responseCount: 45,
    assignedCount: 120,
  },
  {
    _id: "survey_002",
    title: "Work From Home Policy Feedback",
    description: "Collect feedback on flexible work arrangements and policies",
    status: "published",
    isActive: false,
    startDate: "2026-01-10",
    endDate: "2026-01-25",
    startTime: "00:00",
    endTime: "23:59",
    createdAt: "2026-01-05T14:00:00Z",
    createdBy: { _id: "user_001", firstName: "John", lastName: "Smith" },
    totalResponses: 89,
    responseCount: 89,
    assignedCount: 100,
  },
  {
    _id: "survey_003",
    title: "Annual Performance Review",
    description: "Annual performance review feedback survey",
    status: "published",
    isActive: false,
    startDate: "2026-01-01",
    endDate: "2026-01-20",
    startTime: "00:00",
    endTime: "23:59",
    createdAt: "2025-12-20T09:00:00Z",
    createdBy: { _id: "user_002", firstName: "Sarah", lastName: "Johnson" },
    totalResponses: 120,
    responseCount: 120,
    assignedCount: 120,
  },
  {
    _id: "survey_004",
    title: "Performance Review Feedback",
    description: "Help us improve the performance review process",
    status: "published",
    isActive: true,
    startDate: "2026-02-01",
    endDate: "2026-02-15",
    startTime: "09:00",
    endTime: "23:59",
    createdAt: "2026-01-25T11:00:00Z",
    createdBy: { _id: "user_003", firstName: "Alex", lastName: "Turner" },
    totalResponses: 25,
    responseCount: 25,
    assignedCount: 80,
  },
  {
    _id: "survey_005",
    title: "Onboarding Experience Survey",
    description: "Share your experience about the onboarding process",
    status: "published",
    isActive: false,
    startDate: "2026-01-05",
    endDate: "2026-01-31",
    startTime: "00:00",
    endTime: "23:59",
    createdAt: "2026-01-01T08:00:00Z",
    createdBy: { _id: "user_001", firstName: "John", lastName: "Smith" },
    totalResponses: 95,
    responseCount: 95,
    assignedCount: 100,
  },
  {
    _id: "survey_006",
    title: "Team Building Activities Feedback",
    description: "Share your thoughts on recent team activities and suggest improvements",
    status: "published",
    isActive: true,
    startDate: "2026-02-15",
    endDate: "2026-03-15",
    startTime: "00:00",
    endTime: "23:59",
    createdAt: "2026-02-01T10:00:00Z",
    createdBy: { _id: "user_002", firstName: "Sarah", lastName: "Johnson" },
    totalResponses: 0,
    responseCount: 0,
    assignedCount: 75,
  },
  {
    _id: "survey_007",
    title: "IT Support Satisfaction Survey",
    description: "Rate your experience with our IT support team",
    status: "published",
    isActive: true,
    startDate: "2026-02-10",
    endDate: "2026-03-10",
    startTime: "09:00",
    endTime: "23:59",
    createdAt: "2026-02-05T14:00:00Z",
    createdBy: { _id: "user_003", firstName: "Alex", lastName: "Turner" },
    totalResponses: 12,
    responseCount: 12,
    assignedCount: 150,
  },
  {
    _id: "survey_008",
    title: "Remote Work Experience Survey",
    description: "Share how remote work has impacted your productivity and well-being",
    status: "published",
    isActive: true,
    startDate: "2026-02-01",
    endDate: "2026-02-20",
    startTime: "00:00",
    endTime: "23:59",
    createdAt: "2026-01-28T09:00:00Z",
    createdBy: { _id: "user_001", firstName: "John", lastName: "Smith" },
    totalResponses: 32,
    responseCount: 32,
    assignedCount: 90,
  },
];

const MOCK_MY_SURVEYS_DATA: MySurvey[] = [
  // PENDING SURVEYS (not yet started)
  {
    _id: "survey_001",
    title: "Q1 2026 Employee Satisfaction Survey",
    description: "Share your feedback about workplace environment and job satisfaction.",
    status: "pending",
    questionCount: 15,
    estimatedTime: "~10 min",
    dueDate: "2026-02-28T23:59:59Z",
    timeRemaining: "21 days left",
  },
  {
    _id: "survey_006",
    title: "Team Building Activities Feedback",
    description: "Share your thoughts on recent team activities and suggest improvements.",
    status: "pending",
    questionCount: 8,
    estimatedTime: "~5 min",
    dueDate: "2026-03-15T23:59:59Z",
    timeRemaining: "36 days left",
  },
  {
    _id: "survey_007",
    title: "IT Support Satisfaction Survey",
    description: "Rate your experience with our IT support team.",
    status: "pending",
    questionCount: 10,
    estimatedTime: "~7 min",
    dueDate: "2026-03-10T23:59:59Z",
    timeRemaining: "31 days left",
  },
  // IN-PROGRESS SURVEYS (started but not completed)
  {
    _id: "survey_004",
    title: "Performance Review Feedback",
    description: "Help us improve the performance review process.",
    status: "inProgress",
    questionCount: 10,
    estimatedTime: "~8 min",
    dueDate: "2026-02-15T23:59:59Z",
    answeredCount: 4,
    startedAt: "2026-02-01T10:30:00Z",
    timeRemaining: "8 days left",
  },
  {
    _id: "survey_008",
    title: "Remote Work Experience Survey",
    description: "Share how remote work has impacted your productivity and well-being.",
    status: "inProgress",
    questionCount: 12,
    estimatedTime: "~9 min",
    dueDate: "2026-02-20T23:59:59Z",
    answeredCount: 7,
    startedAt: "2026-02-03T14:00:00Z",
    timeRemaining: "13 days left",
  },
  // COMPLETED SURVEYS
  {
    _id: "survey_005",
    title: "Onboarding Experience Survey",
    description: "Share your experience about the onboarding process.",
    status: "completed",
    questionCount: 12,
    estimatedTime: "~10 min",
    dueDate: "2026-01-31T23:59:59Z",
    answeredCount: 12,
    startedAt: "2026-01-25T09:00:00Z",
    completedAt: "2026-01-30T14:30:00Z",
  },
  {
    _id: "survey_002",
    title: "Work From Home Policy Feedback",
    description: "Your input on flexible work arrangements and policies.",
    status: "completed",
    questionCount: 10,
    estimatedTime: "~8 min",
    dueDate: "2026-01-25T23:59:59Z",
    answeredCount: 10,
    startedAt: "2026-01-20T11:00:00Z",
    completedAt: "2026-01-23T16:45:00Z",
  },
  {
    _id: "survey_003",
    title: "Annual Performance Review",
    description: "Provide feedback on the annual review process.",
    status: "completed",
    questionCount: 15,
    estimatedTime: "~12 min",
    dueDate: "2026-01-20T23:59:59Z",
    answeredCount: 15,
    startedAt: "2026-01-15T09:30:00Z",
    completedAt: "2026-01-18T10:00:00Z",
  },
];

// Dynamic stats calculation helper functions
const calculateMySurveysStats = (): MySurveysStats => {
  const surveys = getMockState().mySurveys;
  return {
    totalAssigned: surveys.length,
    completed: surveys.filter(s => s.status === 'completed').length,
    pending: surveys.filter(s => s.status === 'pending').length,
    inProgress: surveys.filter(s => s.status === 'inProgress').length,
  };
};

const calculateSurveyStatistics = (): ISurveyStatistics => {
  const templates = getMockState().templates;
  const drafts = getMockState().drafts;
  const published = getMockState().publishedSurveys;
  return {
    total: published.length + templates.length + drafts.length,
    published: published.length,
    templates: templates.length,
    drafts: drafts.length,
  };
};

const calculateResponsesOverviewStats = (): IResponsesOverviewStats => {
  const surveys = getMockState().publishedSurveys;
  return {
    surveysCreated: surveys.length,
    activeSurveys: surveys.filter(s => s.isActive).length,
    completedSurveys: surveys.filter(s => !s.isActive).length,
  };
};

// Keep these for backward compatibility (deprecated - use calculator functions)
const MOCK_STATISTICS: ISurveyStatistics = {
  total: 11,
  published: 8,
  templates: 2,
  drafts: 1,
};

const MOCK_MY_SURVEYS_STATS: MySurveysStats = {
  totalAssigned: 8,
  completed: 3,
  pending: 3,
  inProgress: 2,
};

const MOCK_RESPONSES_OVERVIEW_STATS: IResponsesOverviewStats = {
  surveysCreated: 5,
  activeSurveys: 4,
  completedSurveys: 1,
};

const MOCK_SURVEY_INFO: SurveyInfo = {
  _id: "survey_001",
  title: "Q1 2026 Employee Satisfaction Survey",
  status: "active",
  aboutText: "This quarterly survey is designed to gather your honest feedback about your experience working here. Your input helps us understand what's working well and where we can improve to create a better workplace for everyone.\n\nThe survey covers various aspects of your work life, from daily operations to long-term career goals. All responses are completely confidential.",
  instructions: [
    "Fields marked with * are required",
    "You must complete all required fields to submit",
    "Your progress will be saved automatically",
    "You can return and continue anytime before due date",
  ],
  totalQuestions: 15,
  questionTypes: "Multiple choice & open-ended",
  dueDate: "2026-02-28",
  endTime: "11:59 PM",
  userProgress: {
    status: "notStarted",
    answeredCount: 0,
    totalQuestions: 15,
  },
  isConfidential: true,
  timeRemaining: {
    percentage: 60,
    text: "21 days remaining",
  },
};

const MOCK_TAKE_SURVEY_DATA: TakeSurveyData = {
  _id: "survey_001",
  title: "Q1 2026 Employee Satisfaction Survey",
  totalQuestions: 15,
  questions: [
    {
      _id: "q_001",
      order: 1,
      type: "rating",
      text: "How satisfied are you with your current role and responsibilities?",
      isRequired: true,
      options: null,
      maxRating: 5,
    },
    {
      _id: "q_002",
      order: 2,
      type: "mcq",
      text: "How would you rate your work-life balance?",
      isRequired: true,
      options: [
        { _id: "opt_001", tempId: "temp_001", text: "Excellent" },
        { _id: "opt_002", tempId: "temp_002", text: "Good" },
        { _id: "opt_003", tempId: "temp_003", text: "Average" },
        { _id: "opt_004", tempId: "temp_004", text: "Poor" },
        { _id: "opt_005", tempId: "temp_005", text: "Very Poor" },
      ],
    },
    {
      _id: "q_003",
      order: 3,
      type: "checkbox",
      text: "Which benefits are most important to you?",
      isRequired: true,
      options: [
        { _id: "opt_006", tempId: "temp_006", text: "Health Insurance" },
        { _id: "opt_007", tempId: "temp_007", text: "Flexible Working Hours" },
        { _id: "opt_008", tempId: "temp_008", text: "Remote Work Options" },
        { _id: "opt_009", tempId: "temp_009", text: "Professional Development" },
      ],
    },
    {
      _id: "q_004",
      order: 4,
      type: "short_text",
      text: "What is one thing you would change about your work environment?",
      isRequired: true,
      options: null,
    },
    {
      _id: "q_005",
      order: 5,
      type: "long_text",
      text: "Please share any additional feedback or suggestions.",
      isRequired: false,
      options: null,
    },
    {
      _id: "q_006",
      order: 6,
      type: "rating",
      text: "How would you rate the communication within your team?",
      isRequired: true,
      options: null,
      maxRating: 5,
    },
    {
      _id: "q_007",
      order: 7,
      type: "mcq",
      text: "How often do you receive constructive feedback from your manager?",
      isRequired: true,
      options: [
        { _id: "opt_010", tempId: "temp_010", text: "Weekly" },
        { _id: "opt_011", tempId: "temp_011", text: "Monthly" },
        { _id: "opt_012", tempId: "temp_012", text: "Quarterly" },
        { _id: "opt_013", tempId: "temp_013", text: "Rarely" },
        { _id: "opt_014", tempId: "temp_014", text: "Never" },
      ],
    },
    {
      _id: "q_008",
      order: 8,
      type: "checkbox",
      text: "Which tools do you use most frequently for work?",
      isRequired: false,
      options: [
        { _id: "opt_015", tempId: "temp_015", text: "Email" },
        { _id: "opt_016", tempId: "temp_016", text: "Slack/Teams" },
        { _id: "opt_017", tempId: "temp_017", text: "Project Management Tools" },
        { _id: "opt_018", tempId: "temp_018", text: "Video Conferencing" },
        { _id: "opt_019", tempId: "temp_019", text: "Document Collaboration" },
      ],
    },
    {
      _id: "q_009",
      order: 9,
      type: "rating",
      text: "How satisfied are you with the opportunities for career growth?",
      isRequired: true,
      options: null,
      maxRating: 5,
    },
    {
      _id: "q_010",
      order: 10,
      type: "mcq",
      text: "How would you describe the company culture?",
      isRequired: true,
      options: [
        { _id: "opt_020", tempId: "temp_020", text: "Very Positive" },
        { _id: "opt_021", tempId: "temp_021", text: "Positive" },
        { _id: "opt_022", tempId: "temp_022", text: "Neutral" },
        { _id: "opt_023", tempId: "temp_023", text: "Negative" },
        { _id: "opt_024", tempId: "temp_024", text: "Very Negative" },
      ],
    },
    {
      _id: "q_011",
      order: 11,
      type: "short_text",
      text: "What motivates you most at work?",
      isRequired: false,
      options: null,
    },
    {
      _id: "q_012",
      order: 12,
      type: "rating",
      text: "How well does your manager support your professional development?",
      isRequired: true,
      options: null,
      maxRating: 5,
    },
    {
      _id: "q_013",
      order: 13,
      type: "checkbox",
      text: "Which areas would you like to see improved?",
      isRequired: true,
      options: [
        { _id: "opt_025", tempId: "temp_025", text: "Office Facilities" },
        { _id: "opt_026", tempId: "temp_026", text: "Training Programs" },
        { _id: "opt_027", tempId: "temp_027", text: "Team Collaboration" },
        { _id: "opt_028", tempId: "temp_028", text: "Work-Life Balance" },
        { _id: "opt_029", tempId: "temp_029", text: "Compensation & Benefits" },
      ],
    },
    {
      _id: "q_014",
      order: 14,
      type: "mcq",
      text: "Would you recommend this company as a great place to work?",
      isRequired: true,
      options: [
        { _id: "opt_030", tempId: "temp_030", text: "Definitely Yes" },
        { _id: "opt_031", tempId: "temp_031", text: "Probably Yes" },
        { _id: "opt_032", tempId: "temp_032", text: "Not Sure" },
        { _id: "opt_033", tempId: "temp_033", text: "Probably No" },
        { _id: "opt_034", tempId: "temp_034", text: "Definitely No" },
      ],
    },
    {
      _id: "q_015",
      order: 15,
      type: "long_text",
      text: "Is there anything else you would like to share with us about your experience working here?",
      isRequired: false,
      options: null,
    },
  ],
  savedAnswers: {},
  lastQuestionIndex: 0,
};

const MOCK_USER_RESPONSE: UserSurveyResponse = {
  _id: "response_001",
  surveyId: "survey_005",
  surveyTitle: "Onboarding Experience Survey",
  employeeName: "Sarah Johnson",
  employeeEmail: "sarah.j@company.com",
  employeeDepartment: "Engineering",
  employeeInitials: "SJ",
  submittedAt: "Feb 1, 2026, 10:00 AM",
  totalQuestions: 5,
  answers: [
    {
      questionId: "q1",
      questionNumber: 1,
      questionText: "How satisfied are you with your current role?",
      questionType: "rating",
      answer: 4,
      maxRating: 5,
    },
    {
      questionId: "q2",
      questionNumber: 2,
      questionText: "Which of the following benefits matter most to you?",
      questionType: "checkbox",
      answer: ["Flexible Work Hours", "Remote Work Options"],
    },
  ],
};

// ============================================================================
// MOCK COMPLETED & PENDING RESPONSES DATA
// ============================================================================

interface IMockCompletedResponse {
  id: string;
  surveyId: string;
  employee: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    employeeCode: string;
  };
  createdAt: string;  // When assigned/started
  submittedDate: string;
  submittedTime: string;
  responseId: string;
}

interface IMockPendingResponse {
  id: string;
  surveyId: string;
  employee: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    employeeCode: string;
  };
  status: "pending" | "not_started";
  assignedDate: string;  // When assigned
  lastReminder?: string;
}

const MOCK_EMPLOYEE_NAMES = [
  { name: "John Smith", email: "john.smith@company.com", code: "EMP001" },
  { name: "Sarah Johnson", email: "sarah.j@company.com", code: "EMP002" },
  { name: "Michael Chen", email: "m.chen@company.com", code: "EMP003" },
  { name: "Emily Davis", email: "emily.d@company.com", code: "EMP004" },
  { name: "Chris Brown", email: "chris.b@company.com", code: "EMP005" },
  { name: "Jessica Wilson", email: "j.wilson@company.com", code: "EMP006" },
  { name: "David Lee", email: "david.lee@company.com", code: "EMP007" },
  { name: "Amanda Garcia", email: "a.garcia@company.com", code: "EMP008" },
  { name: "Robert Miller", email: "r.miller@company.com", code: "EMP009" },
  { name: "Lisa Anderson", email: "l.anderson@company.com", code: "EMP010" },
  { name: "James Taylor", email: "j.taylor@company.com", code: "EMP011" },
  { name: "Michelle Thomas", email: "m.thomas@company.com", code: "EMP012" },
  { name: "Daniel Martinez", email: "d.martinez@company.com", code: "EMP013" },
  { name: "Jennifer White", email: "j.white@company.com", code: "EMP014" },
  { name: "Kevin Harris", email: "k.harris@company.com", code: "EMP015" },
];

// Generate mock completed responses for all surveys
const generateCompletedResponses = (surveyId: string, count: number): IMockCompletedResponse[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `resp_${surveyId}_${i + 1}`,
    surveyId,
    employee: {
      id: `emp_${i + 1}`,
      name: MOCK_EMPLOYEE_NAMES[i % MOCK_EMPLOYEE_NAMES.length].name,
      email: MOCK_EMPLOYEE_NAMES[i % MOCK_EMPLOYEE_NAMES.length].email,
      avatar: "",
      employeeCode: MOCK_EMPLOYEE_NAMES[i % MOCK_EMPLOYEE_NAMES.length].code,
    },
    createdAt: `2024-01-${String(10 + (i % 5)).padStart(2, "0")}T09:00:00Z`,
    submittedDate: `2024-01-${String(15 + (i % 10)).padStart(2, "0")}`,
    submittedTime: `${String(9 + (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")} AM`,
    responseId: `RESP-${surveyId.toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
  }));
};

// Generate mock pending responses for all surveys
const generatePendingResponses = (
  surveyId: string,
  pendingCount: number,
  notStartedCount: number
): IMockPendingResponse[] => {
  const pending: IMockPendingResponse[] = Array.from({ length: pendingCount }, (_, i) => ({
    id: `pend_${surveyId}_${i + 1}`,
    surveyId,
    employee: {
      id: `emp_pend_${i + 1}`,
      name: MOCK_EMPLOYEE_NAMES[(i + 5) % MOCK_EMPLOYEE_NAMES.length].name,
      email: MOCK_EMPLOYEE_NAMES[(i + 5) % MOCK_EMPLOYEE_NAMES.length].email,
      avatar: "",
      employeeCode: MOCK_EMPLOYEE_NAMES[(i + 5) % MOCK_EMPLOYEE_NAMES.length].code,
    },
    status: "pending" as const,
    assignedDate: `2024-01-${String(8 + (i % 5)).padStart(2, "0")}`,
    lastReminder: `2024-01-${String(18 + (i % 5)).padStart(2, "0")}`,
  }));

  const notStarted: IMockPendingResponse[] = Array.from({ length: notStartedCount }, (_, i) => ({
    id: `ns_${surveyId}_${i + 1}`,
    surveyId,
    employee: {
      id: `emp_ns_${i + 1}`,
      name: MOCK_EMPLOYEE_NAMES[(i + 10) % MOCK_EMPLOYEE_NAMES.length].name,
      email: MOCK_EMPLOYEE_NAMES[(i + 10) % MOCK_EMPLOYEE_NAMES.length].email,
      avatar: "",
      employeeCode: MOCK_EMPLOYEE_NAMES[(i + 10) % MOCK_EMPLOYEE_NAMES.length].code,
    },
    status: "not_started" as const,
    assignedDate: `2024-01-${String(8 + (i % 5)).padStart(2, "0")}`,
  }));

  return [...pending, ...notStarted];
};

// Pre-generated response data per survey (consistent with MOCK_PUBLISHED_SURVEYS_DATA)
const MOCK_COMPLETED_RESPONSES: Record<string, IMockCompletedResponse[]> = {
  survey_001: generateCompletedResponses("survey_001", 45),
  survey_002: generateCompletedResponses("survey_002", 89),
  survey_003: generateCompletedResponses("survey_003", 120),
  survey_004: generateCompletedResponses("survey_004", 25),
  survey_005: generateCompletedResponses("survey_005", 95),
  survey_006: generateCompletedResponses("survey_006", 0),
  survey_007: generateCompletedResponses("survey_007", 12),
  survey_008: generateCompletedResponses("survey_008", 32),
};

const MOCK_PENDING_RESPONSES: Record<string, IMockPendingResponse[]> = {
  survey_001: generatePendingResponses("survey_001", 40, 35), // 120 - 45 = 75 remaining (40 pending, 35 not started)
  survey_002: generatePendingResponses("survey_002", 6, 5),   // 100 - 89 = 11 remaining
  survey_003: generatePendingResponses("survey_003", 0, 0),   // All 120 completed
  survey_004: generatePendingResponses("survey_004", 30, 25), // 80 - 25 = 55 remaining
  survey_005: generatePendingResponses("survey_005", 3, 2),   // 100 - 95 = 5 remaining
  survey_006: generatePendingResponses("survey_006", 35, 40), // All 75 not yet started
  survey_007: generatePendingResponses("survey_007", 80, 58), // 150 - 12 = 138 remaining
  survey_008: generatePendingResponses("survey_008", 35, 23), // 90 - 32 = 58 remaining
};

// Mock response detail data for viewing submitted responses
const MOCK_RESPONSE_DETAIL = {
  id: "resp_detail_001",
  surveyId: "survey_001",
  surveyTitle: "Q4 Employee Satisfaction Survey",
  employee: {
    id: "emp_001",
    name: "John Smith",
    email: "john.smith@company.com",
    avatar: "",
    employeeCode: "EMP001",
  },
  submittedAt: "Jan 20, 2024 at 10:30 AM",
  answers: [
    {
      questionId: "q_001",
      questionNumber: 1,
      questionText: "How satisfied are you with your current role?",
      questionType: "rating" as const,
      answer: 4,
      maxRating: 5,
    },
    {
      questionId: "q_002",
      questionNumber: 2,
      questionText: "How would you rate your work-life balance?",
      questionType: "mcq" as const,
      answer: "Good",
    },
    {
      questionId: "q_003",
      questionNumber: 3,
      questionText: "Which benefits are most important to you?",
      questionType: "checkbox" as const,
      answer: ["Health Insurance", "Flexible Working Hours", "Remote Work Options"],
    },
    {
      questionId: "q_004",
      questionNumber: 4,
      questionText: "What is one thing you would change about your work environment?",
      questionType: "short_text" as const,
      answer: "Better meeting room availability",
    },
    {
      questionId: "q_005",
      questionNumber: 5,
      questionText: "Please share any additional feedback.",
      questionType: "long_text" as const,
      answer: "Overall, I'm very happy with the company culture and the team. Would appreciate more opportunities for professional development and training programs.",
    },
  ],
};

// ============================================================================
// URL MATCHING
// ============================================================================

const MOCK_URL_PATTERNS = [
  /^\/api\/v1\/survey\//,
  /^\/api\/v1\/surveys\//,
];

/**
 * Check if a URL should be intercepted by the mock system
 */
export const isMockableUrl = (url: string): boolean => {
  // Remove query params for matching
  const pathOnly = url.split("?")[0];
  return MOCK_URL_PATTERNS.some((pattern) => pattern.test(pathOnly));
};

// ============================================================================
// MOCK RESPONSE HANDLERS
// ============================================================================

/**
 * Get mock response for GET requests
 */
export const getMockResponse = (
  url: string,
  method: string,
  _body?: unknown
): unknown | null => {
  if (method !== "GET") return null;

  const pathOnly = url.split("?")[0];

  // === TEMPLATES ===
  if (pathOnly === "/api/v1/survey/templates") {
    return {
      success: true,
      data: getMockState().templates.map((t) => ({
        _id: t._id,
        name: t.name,
        description: t.description,
        questionCount: t.questions.length,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        createdBy: t.createdBy,
      })),
    };
  }

  const templateMatch = pathOnly.match(/^\/api\/v1\/survey\/templates\/([^/]+)$/);
  if (templateMatch) {
    const template = getMockState().templates.find((t) => t._id === templateMatch[1]);
    return template ? { success: true, data: template } : null;
  }

  // === DRAFTS ===
  if (pathOnly === "/api/v1/survey/drafts") {
    // Parse query params for pagination
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const page = parseInt(urlParams.get("page") || "1", 10);
    const pageSize = parseInt(urlParams.get("limit") || "10", 10);
    const search = urlParams.get("search")?.toLowerCase() || "";

    // Transform drafts with calculated questionCount
    let drafts = getMockState().drafts.map((d) => ({
      _id: d._id,
      title: d.title,
      description: d.description,
      status: "draft" as const,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      questionCount: d.questions?.length || 0, // Calculate from actual questions array
      sourceTemplateId: d.sourceTemplateId,
    }));

    // Apply search filter
    if (search) {
      drafts = drafts.filter((d) =>
        d.title?.toLowerCase().includes(search) ||
        d.description?.toLowerCase()?.includes(search)
      );
    }

    // Paginate
    const total = drafts.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginatedData = drafts.slice(start, start + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages,
      },
    };
  }

  // === STATISTICS (Dynamic calculation from mock data) ===
  if (pathOnly === "/api/v1/survey/statistics") {
    return {
      success: true,
      data: calculateSurveyStatistics(),
    };
  }

  // === PUBLISHED SURVEYS ===
  if (pathOnly === "/api/v1/survey/published") {
    // Parse query params for filtering and pagination
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const page = parseInt(urlParams.get("page") || "1", 10);
    const pageSize = parseInt(urlParams.get("limit") || "10", 10);
    const search = urlParams.get("search")?.toLowerCase() || "";
    const status = urlParams.get("status") || ""; // 'active' or 'inactive' or ''
    const fromDate = urlParams.get("fromDate") || "";
    const toDate = urlParams.get("toDate") || "";

    let filtered = [...getMockState().publishedSurveys];

    // Apply search filter
    if (search) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    // Apply status filter (active = isActive true, inactive = isActive false)
    if (status === "active") {
      filtered = filtered.filter((s) => s.isActive);
    } else if (status === "inactive") {
      filtered = filtered.filter((s) => !s.isActive);
    }

    // Apply date range filter
    if (fromDate) {
      filtered = filtered.filter((s) => s.startDate >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((s) => s.endDate <= toDate);
    }

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages,
      },
    };
  }

  // === MY SURVEYS (Dynamic calculation from mock data) ===
  if (pathOnly === "/api/v1/surveys/my-surveys/stats") {
    return { success: true, data: calculateMySurveysStats() };
  }

  if (pathOnly === "/api/v1/surveys/my-surveys") {
    return { success: true, data: getMockState().mySurveys };
  }

  const surveyInfoMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/info$/);
  if (surveyInfoMatch) {
    return { success: true, data: { ...MOCK_SURVEY_INFO, _id: surveyInfoMatch[1] } };
  }

  const surveyDetailsMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/details$/);
  if (surveyDetailsMatch) {
    const surveyId = surveyDetailsMatch[1];
    const savedAnswers = getMockState().savedAnswers[surveyId] || {};
    return {
      success: true,
      data: {
        ...MOCK_TAKE_SURVEY_DATA,
        _id: surveyId,
        savedAnswers,
      },
    };
  }

  const userResponseMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/user-response$/);
  if (userResponseMatch) {
    return { success: true, data: { ...MOCK_USER_RESPONSE, surveyId: userResponseMatch[1] } };
  }

  // === RESPONSES OVERVIEW (Dynamic calculation from mock data) ===
  if (pathOnly === "/api/v1/surveys/responses/overview/stats") {
    return { success: true, data: calculateResponsesOverviewStats() };
  }

  if (pathOnly === "/api/v1/surveys/responses/overview") {
    // Parse query params for pagination
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const page = parseInt(urlParams.get("page") || "1", 10);
    const pageSize = parseInt(urlParams.get("pageSize") || "10", 10);
    const search = urlParams.get("search")?.toLowerCase() || "";
    const status = urlParams.get("status") || "all";

    // Transform published surveys to response overview items
    let items = getMockState().publishedSurveys.map((s) => ({
      id: s._id,
      title: s.title,
      startDate: s.startDate,
      endDate: s.endDate,
      completed: s.responseCount,
      pending: Math.floor(s.assignedCount * 0.1),
      notStarted: s.assignedCount - s.responseCount - Math.floor(s.assignedCount * 0.1),
      total: s.assignedCount,
      status: s.isActive ? ("active" as const) : ("completed" as const),
      assignedTo: {
        type: "department" as const,
        entities: [{ id: "dept_001", name: "Engineering" }],
        totalCount: s.assignedCount,
      },
    }));

    // Apply search filter
    if (search) {
      items = items.filter((item) =>
        item.title.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (status !== "all") {
      items = items.filter((item) => item.status === status);
    }

    // Paginate
    const total = items.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const paginatedData = items.slice(start, start + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages,
      },
    };
  }

  const insightsMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/insights$/);
  if (insightsMatch) {
    const surveyId = insightsMatch[1];
    const survey = getMockState().publishedSurveys.find((s) => s._id === surveyId);
    const completedResponses = MOCK_COMPLETED_RESPONSES[surveyId] || [];
    const pendingResponses = MOCK_PENDING_RESPONSES[surveyId] || [];
    const pendingCount = pendingResponses.filter((r) => r.status === "pending").length;
    const notStartedCount = pendingResponses.filter((r) => r.status === "not_started").length;

    if (survey) {
      return {
        success: true,
        data: {
          totalAssigned: survey.assignedCount,
          completed: completedResponses.length,
          pending: pendingCount,
          notStarted: notStartedCount,
          completionRate: Math.round((completedResponses.length / survey.assignedCount) * 1000) / 10,
          surveyTitle: survey.title,
          startDate: survey.startDate,
          endDate: survey.endDate,
        },
      };
    }
  }

  // === COMPLETED RESPONSES ===
  const completedMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/responses\/completed$/);
  if (completedMatch) {
    const surveyId = completedMatch[1];
    // Get from pre-generated or generate on-the-fly for new surveys
    let responses = MOCK_COMPLETED_RESPONSES[surveyId];
    if (!responses) {
      // Check if this survey exists and generate mock data
      const survey = getMockState().publishedSurveys.find((s) => s._id === surveyId);
      if (survey) {
        responses = generateCompletedResponses(surveyId, survey.responseCount || 0);
      } else {
        responses = [];
      }
    }

    // Parse query params for pagination
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const page = parseInt(urlParams.get("page") || "1", 10);
    const pageSize = parseInt(urlParams.get("pageSize") || "10", 10);
    const search = urlParams.get("search")?.toLowerCase() || "";

    // Filter by search
    let filtered = responses;
    if (search) {
      filtered = responses.filter(
        (r) =>
          r.employee.name.toLowerCase().includes(search) ||
          r.employee.email.toLowerCase().includes(search) ||
          r.employee.employeeCode.toLowerCase().includes(search)
      );
    }

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: { page, limit: pageSize, total, totalPages },
    };
  }

  // === PENDING RESPONSES ===
  const pendingMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/responses\/pending$/);
  if (pendingMatch) {
    const surveyId = pendingMatch[1];
    // Get from pre-generated or generate on-the-fly for new surveys
    let responses = MOCK_PENDING_RESPONSES[surveyId];
    if (!responses) {
      // Check if this survey exists and generate mock data
      const survey = getMockState().publishedSurveys.find((s) => s._id === surveyId);
      if (survey) {
        const remaining = survey.assignedCount - (survey.responseCount || 0);
        const pendingCount = Math.floor(remaining * 0.5);
        const notStartedCount = remaining - pendingCount;
        responses = generatePendingResponses(surveyId, pendingCount, notStartedCount);
      } else {
        responses = [];
      }
    }

    // Parse query params
    const urlParams = new URLSearchParams(url.split("?")[1] || "");
    const page = parseInt(urlParams.get("page") || "1", 10);
    const pageSize = parseInt(urlParams.get("pageSize") || "10", 10);
    const tab = urlParams.get("tab") || "pending"; // 'pending' or 'not_started'
    const search = urlParams.get("search")?.toLowerCase() || "";

    // Filter by tab
    let filtered = responses.filter((r) => r.status === tab);

    // Filter by search
    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.employee.name.toLowerCase().includes(search) ||
          r.employee.email.toLowerCase().includes(search) ||
          r.employee.employeeCode.toLowerCase().includes(search)
      );
    }

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedData = filtered.slice(start, start + pageSize);

    return {
      success: true,
      data: paginatedData,
      pagination: { page, limit: pageSize, total, totalPages },
    };
  }

  // === RESPONSE DETAIL (for View Response modal) ===
  const responseDetailMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/responses\/([^/]+)$/);
  if (responseDetailMatch && responseDetailMatch[2] !== "completed" && responseDetailMatch[2] !== "pending") {
    const surveyId = responseDetailMatch[1];
    const _responseId = responseDetailMatch[2];
    const survey = getMockState().publishedSurveys.find((s) => s._id === surveyId);

    return {
      success: true,
      data: {
        ...MOCK_RESPONSE_DETAIL,
        id: _responseId,
        surveyId,
        surveyTitle: survey?.title || "Survey",
      },
    };
  }

  return null;
};

// ============================================================================
// MOCK MUTATION HANDLERS
// ============================================================================

/**
 * Generate unique ID for new entities
 */
const generateId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

/**
 * Handle mutations (POST/PUT/DELETE) and update mock state
 */
export const handleMockMutation = (
  url: string,
  method: string,
  body?: unknown
): unknown | null => {
  const pathOnly = url.split("?")[0];

  // === TEMPLATES ===
  if (method === "POST" && pathOnly === "/api/v1/survey/templates") {
    const payload = body as { name: string; description?: string; questions: SurveyQuestion[] };
    const newTemplate: SurveyTemplate = {
      _id: generateId("tpl"),
      name: payload.name,
      description: payload.description,
      questions: payload.questions.map((q, i) => ({
        ...q,
        _id: generateId("q"),
        order: i + 1,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: { _id: "user_current", firstName: "Current", lastName: "User" },
    };
    getMockState().templates.push(newTemplate);
    persistState();
    return { success: true, message: "Template created successfully", data: newTemplate };
  }

  const templateUpdateMatch = pathOnly.match(/^\/api\/v1\/survey\/templates\/([^/]+)$/);
  if (method === "PUT" && templateUpdateMatch) {
    const idx = getMockState().templates.findIndex((t) => t._id === templateUpdateMatch[1]);
    if (idx !== -1) {
      const payload = body as Partial<SurveyTemplate>;
      getMockState().templates[idx] = {
        ...getMockState().templates[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      persistState();
      return { success: true, message: "Template updated successfully", data: getMockState().templates[idx] };
    }
  }

  if (method === "DELETE" && templateUpdateMatch) {
    const idx = getMockState().templates.findIndex((t) => t._id === templateUpdateMatch[1]);
    if (idx !== -1) {
      getMockState().templates.splice(idx, 1);
      persistState();
      return { success: true, message: "Template deleted successfully" };
    }
  }

  const duplicateMatch = pathOnly.match(/^\/api\/v1\/survey\/templates\/([^/]+)\/duplicate$/);
  if (method === "POST" && duplicateMatch) {
    const original = getMockState().templates.find((t) => t._id === duplicateMatch[1]);
    if (original) {
      const payload = body as { name: string };
      const duplicate: SurveyTemplate = {
        ...original,
        _id: generateId("tpl"),
        name: payload.name || `Copy of ${original.name}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      getMockState().templates.push(duplicate);
      persistState();
      return { success: true, message: "Template duplicated successfully", data: duplicate };
    }
  }

  // === DRAFTS ===
  if (method === "POST" && pathOnly === "/api/v1/survey/drafts") {
    const payload = body as Partial<SurveyDraft>;
    const newDraft: SurveyDraft = {
      _id: generateId("draft"),
      title: payload.title || "Untitled Draft",
      description: payload.description,
      schedule: payload.schedule || { startDate: null, endDate: null, startTime: null, endTime: null },
      assignment: payload.assignment || { entityType: null, entityIds: [] },
      questions: payload.questions || [],
      sourceTemplateId: payload.sourceTemplateId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    getMockState().drafts.push(newDraft);
    persistState();
    return { success: true, message: "Draft saved successfully", data: newDraft };
  }

  const draftUpdateMatch = pathOnly.match(/^\/api\/v1\/survey\/drafts\/([^/]+)$/);
  if (method === "PUT" && draftUpdateMatch) {
    const idx = getMockState().drafts.findIndex((d) => d._id === draftUpdateMatch[1]);
    if (idx !== -1) {
      const payload = body as Partial<SurveyDraft>;
      getMockState().drafts[idx] = {
        ...getMockState().drafts[idx],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      persistState();
      return { success: true, message: "Draft updated successfully", data: getMockState().drafts[idx] };
    }
  }

  if (method === "DELETE" && draftUpdateMatch) {
    const idx = getMockState().drafts.findIndex((d) => d._id === draftUpdateMatch[1]);
    if (idx !== -1) {
      getMockState().drafts.splice(idx, 1);
      persistState();
      return { success: true, message: "Draft deleted successfully" };
    }
  }

  // === PUBLISH SURVEY ===
  if (method === "POST" && pathOnly === "/api/v1/survey/publish") {
    const payload = body as { title: string; description?: string; sourceDraftId?: string };
    const newSurvey: IPublishedSurvey = {
      _id: generateId("survey"),
      title: payload.title,
      description: payload.description || "",
      status: "published",
      isActive: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      startTime: "00:00",
      endTime: "23:59",
      createdAt: new Date().toISOString(),
      createdBy: { _id: "user_current", firstName: "Current", lastName: "User" },
      totalResponses: 0,
      responseCount: 0,
      assignedCount: 50,
    };
    getMockState().publishedSurveys.push(newSurvey);

    // Remove source draft if provided
    if (payload.sourceDraftId) {
      const draftIdx = getMockState().drafts.findIndex((d) => d._id === payload.sourceDraftId);
      if (draftIdx !== -1) getMockState().drafts.splice(draftIdx, 1);
    }

    persistState();
    return { success: true, message: "Survey published successfully", data: { _id: newSurvey._id, assignedCount: 50 } };
  }

  // === TOGGLE SURVEY STATUS ===
  const toggleMatch = pathOnly.match(/^\/api\/v1\/survey\/published\/([^/]+)\/toggle$/);
  if (method === "PUT" && toggleMatch) {
    const idx = getMockState().publishedSurveys.findIndex((s) => s._id === toggleMatch[1]);
    if (idx !== -1) {
      const payload = body as { isActive: boolean };
      getMockState().publishedSurveys[idx].isActive = payload.isActive;
      persistState();
      return { success: true, message: "Survey status updated successfully" };
    }
  }

  // === DELETE PUBLISHED SURVEY ===
  const deleteSurveyMatch = pathOnly.match(/^\/api\/v1\/survey\/published\/([^/]+)$/);
  if (method === "DELETE" && deleteSurveyMatch) {
    const idx = getMockState().publishedSurveys.findIndex((s) => s._id === deleteSurveyMatch[1]);
    if (idx !== -1) {
      getMockState().publishedSurveys.splice(idx, 1);
      persistState();
      return { success: true, message: "Survey deleted successfully" };
    }
  }

  // === SAVE ANSWERS ===
  const saveAnswerMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/save-answer$/);
  if (method === "POST" && saveAnswerMatch) {
    const surveyId = saveAnswerMatch[1];
    const payload = body as { questionId: string; value: unknown };
    if (!getMockState().savedAnswers[surveyId]) {
      getMockState().savedAnswers[surveyId] = {};
    }
    getMockState().savedAnswers[surveyId][payload.questionId] = payload.value;
    persistState();
    return { success: true, data: { success: true } };
  }

  const saveAnswersMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/save-answers$/);
  if (method === "POST" && saveAnswersMatch) {
    const surveyId = saveAnswersMatch[1];
    const payload = body as { answers: Array<{ questionId: string; value: unknown }> };
    if (!getMockState().savedAnswers[surveyId]) {
      getMockState().savedAnswers[surveyId] = {};
    }
    payload.answers.forEach((a) => {
      getMockState().savedAnswers[surveyId][a.questionId] = a.value;
    });
    persistState();
    return { success: true, data: { success: true } };
  }

  // === START SURVEY ===
  const startMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/start$/);
  if (method === "POST" && startMatch) {
    return { success: true, data: { responseId: generateId("response") } };
  }

  // === SUBMIT SURVEY ===
  const submitMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/submit$/);
  if (method === "POST" && submitMatch) {
    const surveyId = submitMatch[1];
    // Update my surveys status
    const mySurveyIdx = getMockState().mySurveys.findIndex((s) => s._id === surveyId);
    if (mySurveyIdx !== -1) {
      getMockState().mySurveys[mySurveyIdx] = {
        ...getMockState().mySurveys[mySurveyIdx],
        status: "completed",
        completedAt: new Date().toISOString(),
        answeredCount: getMockState().mySurveys[mySurveyIdx].questionCount,
      };
    }
    persistState();
    return { success: true, data: { success: true, message: "Survey submitted successfully!" } };
  }

  // === SEND REMINDER ===
  const reminderMatch = pathOnly.match(/^\/api\/v1\/surveys\/([^/]+)\/send-reminder$/);
  if (method === "POST" && reminderMatch) {
    return { success: true, message: "Reminders sent successfully" };
  }

  return null;
};
