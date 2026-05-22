import React from "react";
import type { IUserDetail } from "../../../../types";
import { SelectOption } from "../../../common/Select";
import { TextField, SelectField } from "./FormFields";
import { ValidationErrors } from "./formDefaults";
import { DatePicker } from "../../../common";
import dayjs from "dayjs";

interface WorkInfoSectionProps {
  formData: Partial<IUserDetail>;
  formErrors: Record<string, string>;
  isViewMode: boolean;
  selfEditMode?: boolean;
  roleOptions?: SelectOption[];
  departmentOptions: SelectOption[];
  positionOptions: SelectOption[];
  employmentTypeOptions: SelectOption[];
  statusOptions: SelectOption[];

  onFieldChange: <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K],
  ) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  getValidationErrors: (data: Partial<IUserDetail>) => ValidationErrors;
  markFieldTouched: (fieldName: string) => void;
}

export const validateDob = (dob?: string): string => {
  if (!dob) return "";

  const selected = new Date(dob);
  const today = new Date();

  selected.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const minDob = new Date(today);
  minDob.setFullYear(today.getFullYear() - 18);

  if (selected >= today) {
    return "Date of birth cannot be today or a future date";
  }

  if (selected > minDob) {
    return "Employee must be at least 18 years old";
  }

  return "";
};

const WorkInfoSection: React.FC<WorkInfoSectionProps> = ({
  formData,
  formErrors,
  isViewMode,
  selfEditMode,
  roleOptions: roleOptionsProp,
  departmentOptions,
  positionOptions,
  employmentTypeOptions,
  statusOptions,
  onFieldChange,
  setFormErrors,
  markFieldTouched,
}) => {
  const handleFieldBlur = (field: keyof IUserDetail) => {
    // Just mark as touched, the global useEffect will handle validation
    markFieldTouched(field);
  };
  const isValidPan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan);

  const handleFieldChange = <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K],
  ) => {
    const fieldName = field as string;

    let errorMessage = "";

    if (field === "dob") {
      errorMessage = validateDob(value as string);
      onFieldChange(field, value);
      if (errorMessage) {
        setFormErrors((prev: ValidationErrors) => ({
          ...prev,
          [fieldName]: errorMessage,
        }));
      } else {
        setFormErrors((prev: ValidationErrors) => ({
          ...prev,
          [fieldName]: "",
        }));
      }
      return;
    }

    if (field === "panCardNo") {
      const pan = (value as string).toUpperCase();

      // Block special characters
      if (!/^[A-Z0-9]*$/.test(pan)) return;

      // First 5 characters → alphabets only
      if (pan.length <= 5 && !/^[A-Z]*$/.test(pan)) return;

      // Next 4 characters → numbers only
      if (pan.length > 5 && pan.length <= 9 && !/^[A-Z]{5}[0-9]*$/.test(pan)) {
        return;
      }

      // 10th character → alphabet
      if (pan.length === 10 && !isValidPan(pan)) {
        errorMessage = "Invalid PAN card number (Format: ABCDE1234F)";
      }
    }

    // If validation fails, set error and STOP
    if (errorMessage) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [fieldName]: errorMessage,
      }));
      return;
    }

    // Update the form data - this will trigger the global validation useEffect
    onFieldChange(field, value);
    // Immediately clear the error for this field if a value is selected
    // This prevents showing stale errors during the brief moment before useEffect runs
    if (value !== undefined && value !== null && value !== "") {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleSelectChange = <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K],
  ) => {
    const fieldName = field as string;
    // Update the form data - this will trigger the global validation useEffect
    onFieldChange(field, value);
    // Immediately clear the error for this field if a value is selected
    // This prevents showing stale errors during the brief moment before useEffect runs
    if (value) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const roleOptions: SelectOption[] = roleOptionsProp?.length
    ? roleOptionsProp
    : [];

  const VALID_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleBloodGroupChange = (value: string) => {
    const sanitizedValue = value.toUpperCase().replace(/[^ABO+-]/g, "");

    const limitedValue = sanitizedValue.slice(0, 3);

    onFieldChange("bloodGroup", limitedValue);

    if (limitedValue && !VALID_BLOOD_GROUPS.includes(limitedValue)) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        bloodGroup: "Enter a valid blood group (e.g., A+, B-, AB+, O-)",
      }));
    } else {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        bloodGroup: "",
      }));
    }
  };

  return (
    <section className="space-y-3">
      <h4 className="text-lg pb-[20px]  font-semibold text-slate-900">
        Work Information
      </h4>

      <SelectField
        label="Role"
        value={formData.roleId ?? formData.role}
        options={roleOptions}
        onChange={(value) => {
          handleSelectChange("roleId", value as any);
        }}
        required
        onBlur={() => handleFieldBlur("roleId")}
        disabled={isViewMode || selfEditMode}
        searchable
        error={formErrors.roleId}
      />

      <SelectField
        label="Department"
        value={formData.department}
        options={departmentOptions}
        onChange={(value) => handleSelectChange("department", value)}
        required
        onBlur={() => handleFieldBlur("department")}
        disabled={isViewMode || selfEditMode}
        searchable
        error={formErrors.department}
      />

      <SelectField
        label="Designation"
        value={formData.designation}
        options={positionOptions}
        onChange={(value) => handleSelectChange("designation", value)}
        required
        onBlur={() => handleFieldBlur("designation")}
        disabled={isViewMode || selfEditMode}
        searchable
        error={formErrors.designation}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePicker
          label="Joining Date"
          value={formData.joinDate ? dayjs(formData.joinDate) : null}
          onChange={(date) => {
            handleFieldChange(
              "joinDate",
              date ? date.format("YYYY-MM-DD") : "",
            );
          }}
          required
          disabled={isViewMode || selfEditMode}
          error={formErrors.joinDate}
          format="DD/MM/YYYY"
        />
        <DatePicker
          label="Date of Birth"
          maxDate={dayjs()}
          value={formData.dob ? dayjs(formData.dob) : null}
          onChange={(date) => {
            handleFieldChange("dob", date ? date.format("YYYY-MM-DD") : "");
          }}
          required
          disabled={isViewMode || selfEditMode}
          error={formErrors.dob}
          format="DD/MM/YYYY"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Employment Type"
          value={formData.employmentType}
          options={employmentTypeOptions}
          onChange={(value) =>
            handleSelectChange(
              "employmentType",
              value as IUserDetail["employmentType"],
            )
          }
          required
          disabled={isViewMode || selfEditMode}
          onBlur={() => handleFieldBlur("employmentType")}
          error={formErrors.employmentType}
        />
        <SelectField
          label="Status"
          value={formData.status}
          options={statusOptions}
          onChange={(value) =>
            handleSelectChange("status", value as IUserDetail["status"])
          }
          required
          disabled={isViewMode || selfEditMode}
          onBlur={() => handleFieldBlur("status")}
          error={formErrors.status}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Blood Group"
          placeholder="E.g. B+"
          value={formData.bloodGroup}
          onChange={handleBloodGroupChange}
          disabled={isViewMode}
          maxLength={3}
          error={formErrors.bloodGroup}
        />
        <TextField
          label="UAN Number"
          placeholder="100194449534"
          value={formData.uanNumber}
          onChange={(value) =>
            handleFieldChange(
              "uanNumber",
              value.replace(/[^\d]/g, "").slice(0, 12),
            )
          }
          disabled={isViewMode}
          error={formErrors.uanNumber}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Aadhar Card Number"
          placeholder="1234 5678 9123"
          value={formData.aadharCardNo}
          onChange={(value) =>
            handleFieldChange(
              "aadharCardNo",
              value.replace(/[^\d]/g, "").slice(0, 12),
            )
          }
          disabled={isViewMode}
          error={formErrors.aadharCardNo}
        />
        <TextField
          label="PAN Card Number"
          placeholder="AFZPK7190K"
          value={formData.panCardNo}
          onChange={(value) =>
            handleFieldChange("panCardNo", value.toUpperCase())
          }
          disabled={isViewMode}
          maxLength={10}
          error={formErrors.panCardNo}
        />
      </div>
    </section>
  );
};

export default WorkInfoSection;
