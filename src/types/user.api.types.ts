/**
 * Definite backend response format (ResponseInterceptor + ResponseService).
 * Every v2 user API returns this HTTP body shape.
 */
export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
  error?: string;
}

/**
 * Inner wrapper from backend service (e.g. findUserById returns ApiResponseDto<UserDetail>).
 * After the global interceptor, single-resource endpoints have shape ApiResponse<ApiResponseDto<T>>.
 */
export interface IApiResponseDto<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IUserFilterItem {
  id: string;
  fullName: string;
  empCode: string;
}

/** Bank details subset for user list */
export interface IUserListBankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  branchName?: string;
}

/** User list item (GET /v2/users list item) – IDs and names for department, designation, managers */
export interface IUserListItem {
  id: string;
  fullName: string;
  employeeId: string;
  workEmail: string;
  status: string;
  department: string;
  departmentName: string;
  designation: string;
  designationName: string;
  employmentType?: string;
  employmentTypeName?: string;
  email?: string;
  joiningDate?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  bankName?: string;
  bankDetails?: IUserListBankDetails;
  reportingManagerId?: string;
  reportingManagerName?: string;
  functionalManagerId?: string;
  functionalManagerName?: string;
}

/** GET /v2/users response body: data is this shape (inside ApiResponse). */
export interface IPaginatedUserListPayload {
  data: IUserListItem[];
  pagination: IPaginationMeta;
}

/** GET /v2/users/stats response: dashboard counts (inside ApiResponse.data). */
export interface IUserStats {
  totalEmployees: number;
  activeEmployees: number;
  totalActiveDepartments: number;
  newEmployeesThisMonth: number;
}

export interface IUserDetailAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IUserDetailEmergencyContact {
  name: string;
  relationshipId?: string;
  relationshipName?: string;
  phone: string;
}

export interface IUserDetailBankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
}

interface IDisplayName {
  displayName: string;
  id: string;
}

export interface IUserDetailEducation {
  institutionName?: string;
  discipline?: IDisplayName;
  startDate?: string;
  endDate?: string;
  grade?: string;
  percentage?: number;
  explainBreaks?: string;
}

export interface IUserDetailPreviousEmployment {
  employerName?: string;
  designation?: IDisplayName;
  startDate?: string;
  endDate?: string;
  annualCTC?: number;
  breakReason?: string;
}

/** User detail (GET /v2/users/:id) – status/employmentType/workMode are master config IDs; *Name are display strings. Use this as the single source for user/employee data. */
export interface IUserDetail {
  id: string;
  /** Legacy API may return _id; treat as alias for id when present */
  _id?: string;
  fullName?: string;
  email: string;
  role: string;
  roleId?: string;
  roleName?: string | null;
  roleTypeName?: string;
  /** Master config ID (employment_status) */
  status?: string;
  /** Display name e.g. Active, Inactive */
  statusName?: string;
  workEmail: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  phone: string;
  /** Master config ID (gender). */
  gender?: string;
  /** Display name e.g. Male, Female. */
  genderName?: string;
  bloodGroup?: string;
  uanNumber?: string;
  aadharCardNo?: string;
  panCardNo?: string;
  dob?: string;
  profilePic?: string;
  motherName?: string;
  fatherName?: string;
  department: string;
  departmentName?: string;
  designation?: string;
  designationName?: string;
  /** Legacy alias for designation */
  position?: string;
  reportingManagerId?: string;
  reportingManager?: string;
  reportingManagerName?: string;
  functionalManagerId?: string;
  functionalManager?: string;
  functionalManagerName?: string;
  joinDate: string;
  /** Master config ID (employment_type) */
  employmentType?: string;
  /** Display name e.g. Permanent, Full-time */
  employmentTypeName?: string;
  workLocation?: string;
  /** Master config ID (work_mode) */
  workMode?: string;
  /** Display name e.g. WFO, WFH */
  workModeName?: string;
  manager?: string | null;
  deactivatedAt?: string;
  terminatedAt?: string;
  address?: IUserDetailAddress;
  permanentAddress?: IUserDetailAddress;
  emergencyContact?: IUserDetailEmergencyContact;
  bankDetails?: IUserDetailBankDetails;
  educationDetails?: IUserDetailEducation[];
  previousEmployments?: IUserDetailPreviousEmployment[];
  //Organization id 
  organizationId?: string;
  organizationName?: string;
}

export interface ICreateUserResult {
  user: { id: string; _id: string; [key: string]: unknown };
  profile: { _id: string; [key: string]: unknown };
  address?: { _id: string; [key: string]: unknown };
  emergencyContact?: { _id: string; [key: string]: unknown };
  bankAccount?: { _id: string; [key: string]: unknown };
  employmentInfo?: { _id: string; [key: string]: unknown };
  education?: unknown[];
  previousEmployments?: unknown[];
}

export interface IUserQueryParams {
  reporteesOnly?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  name?: string;
  email?: string;
  status?: string;
  role?: string;
  department?: string;
  designation?: string;
  employmentType?: string;
  employeeId?: string;
  search?: string;
}

export interface ICreateUserBody {
  email: string;
  workEmail: string;
  employeeId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  bloodGroup?: string;
  uanNumber?: string;
  aadharCardNo?: string;
  panCardNo?: string;
  dob?: string;
  profilePic?: string;
  motherName?: string;
  fatherName?: string;
  role?: string;
  status?: string;
  isSuperAdmin?: boolean;
  roleId?: string;
  reportingManager?: string;
  functionalManager?: string;
  department: string;
  designation: string;
  joinDate: string;
  employmentType?: string;
  workLocation?: string;
  workMode?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  permanentAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationshipId?: string;
    phone: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  educationDetails?: Array<{
    institutionName?: string;
    discipline?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
    percentage?: number;
    explainBreaks?: string;
  }>;
  previousEmployments?: Array<{
    employerName?: string;
    designation?: string;
    startDate?: string;
    endDate?: string;
    annualCTC?: number;
    breakReason?: string;
  }>;
  [key: string]: unknown;
}

export interface IUpdateUserBody {
  email?: string;
  workEmail?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender?: string;
  bloodGroup?: string;
  uanNumber?: string;
  aadharCardNo?: string;
  panCardNo?: string;
  dob?: string;
  profilePic?: string;
  motherName?: string;
  fatherName?: string;
  role?: string;
  status?: string;
  isSuperAdmin?: boolean;
  roleId?: string;
  reportingManager?: string;
  functionalManager?: string;
  department?: string;
  designation?: string;
  joinDate?: string;
  employmentType?: string;
  workLocation?: string;
  workMode?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  permanentAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    relationshipId?: string;
    phone?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  educationDetails?: Array<{
    id?: string;
    institutionName?: string;
    discipline?: string;
    startDate?: string;
    endDate?: string;
    grade?: string;
    percentage?: number;
    explainBreaks?: string;
  }>;
  previousEmployments?: Array<{
    id?: string;
    employerName?: string;
    designation?: string;
    startDate?: string;
    endDate?: string;
    annualCTC?: number;
    breakReason?: string;
  }>;
  [key: string]: unknown;
}
