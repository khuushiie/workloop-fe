export const PLACEHOLDERS = {
  SEARCH: "Search...",
  SELECT_OPTION: "Select an option...",
  ENTER_TEXT: "Enter text...",
  TYPE_HERE: "Type here...",

  // User and Employee related
  SEARCH_USERS: "Search users by name or email...",
  SEARCH_USERS_NAME_EMAIL_USERNAME: "Search users by name, email, or username...",
  SEARCH_EMPLOYEES: "Search employees...",
  SELECT_DEPARTMENT: "Select Department",
  SELECT_USER: "Select User",
  SELECT_EMPLOYEE: "Select Employee",

  // Timesheet related
  SEARCH_PROJECTS_TASKS: "Search projects, tasks...",
  SEARCH_TIMESHEETS: "Search timesheets...",
  SELECT_TIMESHEET_STATUS: "Select Status",
  ENTER_HOURS: "Enter hours...",
  ENTER_TASK_DESCRIPTION: "Enter task description...",

  // Leave related
  SEARCH_LEAVES: "Search leaves...",
  SELECT_LEAVE_TYPE: "Select Leave Type",
  SELECT_LEAVE_STATUS: "Select Leave Status",
  ENTER_REASON: "Enter reason...",
  ENTER_COMMENTS: "Enter comments...",

  // Attendance related
  SEARCH_ATTENDANCE: "Search attendance...",
  SELECT_ATTENDANCE_STATUS: "Select Status",
  SEARCH_EMPLOYEE_ATTENDANCE: "Search employee attendance...",

  // KPI related
  SEARCH_KPIS: "Search KPIs...",
  SEARCH_KPI_ASSIGNMENTS: "Search KPI assignments...",
  ENTER_KPI_NAME: "Enter KPI name...",
  ENTER_KPI_DESCRIPTION: "Enter KPI description...",

  // Holiday related
  SEARCH_HOLIDAYS: "Search holidays...",
  ENTER_HOLIDAY_NAME: "Enter holiday name...",
  SELECT_HOLIDAY_TYPE: "Select Holiday Type",

  // General form placeholders
  ENTER_NAME: "Enter name...",
  ENTER_EMAIL: "Enter email address...",
  ENTER_PHONE: "Enter phone number...",
  ENTER_ADDRESS: "Enter address...",
  ENTER_CITY: "Enter city...",
  ENTER_STATE: "Enter state...",
  ENTER_ZIPCODE: "Enter zip code...",
  ENTER_COUNTRY: "Enter country...",
  ENTER_COMPANY: "Enter company name...",
  ENTER_POSITION: "Enter position...",
  ENTER_DEPARTMENT: "Enter department...",

  // Date and time related
  SELECT_DATE: "Select date...",
  SELECT_START_DATE: "Select start date...",
  SELECT_END_DATE: "Select end date...",
  SELECT_TIME: "Select time...",
  SELECT_START_TIME: "Select start time...",
  SELECT_END_TIME: "Select end time...",

  // File and document related
  SELECT_FILE: "Select file...",
  UPLOAD_FILE: "Upload file...",
  DRAG_DROP_FILES: "Drag and drop files here...",

  // Password and security related
  ENTER_PASSWORD: "Enter password...",
  CONFIRM_PASSWORD: "Confirm password...",
  ENTER_OLD_PASSWORD: "Enter old password...",
  ENTER_NEW_PASSWORD: "Enter new password...",

  // Settings and configuration
  ENTER_SETTING_VALUE: "Enter setting value...",
  SELECT_CONFIGURATION: "Select configuration...",
  ENTER_API_KEY: "Enter API key...",
  ENTER_URL: "Enter URL...",

  // Comments and notes
  ADD_COMMENT: "Add a comment...",
  ADD_NOTE: "Add a note...",
  WRITE_MESSAGE: "Write a message...",
  ENTER_FEEDBACK: "Enter feedback...",

  // Filter and sort related
  FILTER_RESULTS: "Filter results...",
  SORT_BY: "Sort by...",
  SELECT_FILTER: "Select filter...",
} as const;

export type PlaceholderKey = keyof typeof PLACEHOLDERS;

export const getPlaceholder = (key: PlaceholderKey): string => {
  return PLACEHOLDERS[key];
};
