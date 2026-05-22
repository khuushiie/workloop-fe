import type {
  IUserDetail,
  IUserDetailAddress,
  IUserDetailEmergencyContact,
  IUserDetailBankDetails,
  IUserDetailEducation,
  IUserDetailPreviousEmployment,
} from "../../../../types";

export type EducationDetail = IUserDetailEducation;
export type EmploymentDetail = IUserDetailPreviousEmployment;
export type Address = IUserDetailAddress;
export type EmergencyContact = IUserDetailEmergencyContact;
export type BankDetails = IUserDetailBankDetails;
export type ValidationErrors = Record<string, string>;

export const createDefaultEducation = (): EducationDetail => ({
  institutionName: "",
  discipline: "",
  startDate: "",
  endDate: "",
  grade: "",
  explainBreaks: "",
});

export const createDefaultEmployment = (): EmploymentDetail => ({
  employerName: "",
  designation: "",
  startDate: "",
  endDate: "",
  annualCTC: 0,
  breakReason: "",
});

export const DEFAULT_ADDRESS: Address = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
};

export const DEFAULT_PERMANENT_ADDRESS: Address = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
};

export const DEFAULT_EMERGENCY_CONTACT: EmergencyContact = {
  name: "",
  relationshipId: "",
  phone: "",
};

export const DEFAULT_BANK_DETAILS: BankDetails = {
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
  bankName: "",
};

export const DEFAULT_EMPLOYEE_VALUES: Partial<IUserDetail> = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  workEmail: "",
  phone: "",
  gender: "",
  bloodGroup: "",
  uanNumber: "",
  aadharCardNo: "",
  panCardNo: "",
  department: "",
  designation: "",
  joinDate: new Date().toISOString().split("T")[0],
  dob: "",
  motherName: "",
  fatherName: "",
  employmentType: "",
  status: "",
  reportingManagerName: "",
  functionalManagerName: "",
  reportingManagerId: "",
  functionalManagerId: "",
  address: { ...DEFAULT_ADDRESS },
  permanentAddress: { ...DEFAULT_PERMANENT_ADDRESS },
  emergencyContact: { ...DEFAULT_EMERGENCY_CONTACT },
  bankDetails: { ...DEFAULT_BANK_DETAILS },
  educationDetails: [createDefaultEducation()],
  previousEmployments: [createDefaultEmployment()],
};

export const ensureAddress = (address?: Address): Address => ({
  ...DEFAULT_ADDRESS,
  ...(address ?? {}),
});

export const ensurePermanentAddress = (address?: Address): Address => ({
  ...DEFAULT_PERMANENT_ADDRESS,
  ...(address ?? {}),
});

export const ensureEmergencyContact = (
  contact?: EmergencyContact
): EmergencyContact => ({
  ...DEFAULT_EMERGENCY_CONTACT,
  ...(contact ?? {}),
});

export const ensureBankDetails = (details?: BankDetails): BankDetails => ({
  ...DEFAULT_BANK_DETAILS,
  ...(details ?? {}),
});

export const normalizeEducationList = (
  list?: EducationDetail[] | null
): EducationDetail[] =>
  (list && list.length ? list : DEFAULT_EMPLOYEE_VALUES.educationDetails)!.map(
    (item) => ({
      ...createDefaultEducation(),
      ...item,
    })
  );

export const normalizeEmploymentList = (
  list?: EmploymentDetail[] | null
): EmploymentDetail[] =>
  (list && list.length
    ? list
    : DEFAULT_EMPLOYEE_VALUES.previousEmployments)!.map((item) => ({
    ...createDefaultEmployment(),
    ...item,
  }));

export const mergeEmployeeInitialValues = (
  value: Partial<IUserDetail> | null | undefined
): Partial<IUserDetail> => {
  if (!value) {
    return { ...DEFAULT_EMPLOYEE_VALUES };
  }

  return {
    ...DEFAULT_EMPLOYEE_VALUES,
    ...value,
    address: ensureAddress(value.address),
    permanentAddress: ensurePermanentAddress(value.permanentAddress),
    emergencyContact: ensureEmergencyContact(value.emergencyContact),
    bankDetails: ensureBankDetails(value.bankDetails),
    educationDetails: normalizeEducationList(value.educationDetails),
    previousEmployments: normalizeEmploymentList(value.previousEmployments),
  };
};

const validatePhone = (value?: string) =>
  /^[0]?[6-9]\d{9}$/.test((value || "").replace(/\D/g, ""));

const validateZip = (value?: string) =>
  /^[1-9]\d{5}$/.test((value || "").trim());

const validatePAN = (value?: string) =>
  /^[A-Z]{5}[0-9]{4}[A-Z]$/.test((value || "").trim());

const validateAadhar = (value?: string) =>
  /^\d{12}$/.test((value || "").replace(/\s+/g, ""));

const validateIFSC = (value?: string) =>
  /^[A-Z]{4}0[A-Z0-9]{6}$/.test((value || "").trim());

const validateEmail = (value?: string) =>
  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test((value || "").trim());

const validateUAN = (value?: string) => /^\d{12}$/.test(value || "");

export const getValidationErrors = (
  data: Partial<IUserDetail>
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!data.employeeId?.trim()) {
    errors.employeeId = "Employee ID is required.";
  }

  if (!data.firstName?.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!data.workEmail?.trim()) {
    errors.workEmail = "Work email is required.";
  }

  if (data.email?.trim() && data.workEmail?.trim()) {
    if (
      data.workEmail.trim().toLowerCase() === data.email.trim().toLowerCase()
    ) {
      errors.workEmail = "Email and work email cannot be same.";
    }
  }

  if (!data.department?.trim()) {
    errors.department = "Department is required.";
  }

  if (!data.roleId?.trim()) {
    errors.roleId = "Role is required.";
  }

  if (!data.designation?.trim()) {
    errors.designation = "Designation is required.";
  }

  if (!data.joinDate) {
    errors.joinDate = "Join date is required.";
  }

    if (!data.organizationId?.trim()) {
  errors.organizationId = "Organization is required.";
}
  
  if (!data.dob) {
    errors.dob = "DOB is required.";
  } else {
    const dob = new Date(data.dob); 
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      errors.dob = "Employee must be at least 18 years old.";
    }
  }

  if (!data.employmentType?.trim()) {
    errors.employmentType = "Employment type is required.";
  }

  if (!data.status?.trim()) {
    errors.status = "Status is required.";
  }

  if (!data.phone?.trim()) {
    errors.phone = "Phone number is required.";
  }

  if (!data.gender?.trim()) {
    errors.gender = "Gender is required.";
  }

  if (!data.emergencyContact?.name?.trim()) {
    errors.emergencyName = "Contact name is required.";
  }

  if (!data.emergencyContact?.relationshipId?.trim()) {
    errors.emergencyRelationship = "Relationship is required.";
  }

  if (!data.emergencyContact?.phone?.trim()) {
    errors.emergencyPhone = "Contact phone number is required.";
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  if (data.address?.zipCode && !validateZip(data.address.zipCode)) {
    errors.zipCode = "Enter a valid 6-digit PIN code.";
  }

  if (data.email && !validateEmail(data.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (data.workEmail && !validateEmail(data.workEmail)) {
    errors.workEmail = "Enter a valid work email address.";
  }

  if (data.uanNumber && !validateUAN(data.uanNumber)) {
    errors.uanNumber = "Enter a valid UAN number.";
  }

  if (data.panCardNo && !validatePAN(data.panCardNo)) {
    errors.panCardNo = "PAN must be 5 letters, 4 digits, 1 letter.";
  }

  if (data.aadharCardNo && !validateAadhar(data.aadharCardNo)) {
    errors.aadharCardNo = "Aadhar must be exactly 12 digits.";
  }

  if (data.bankDetails?.ifscCode && !validateIFSC(data.bankDetails.ifscCode)) {
    errors.ifscCode =
      "IFSC must be 4 letters, followed by 0, then 6 alphanumeric characters.";
  }

  if (
    data.emergencyContact?.phone &&
    !validatePhone(data.emergencyContact.phone)
  ) {
    errors.emergencyPhone = "Enter a valid 10-digit mobile number.";
  }

  return errors;
};

export const isValidIFSC = validateIFSC;
