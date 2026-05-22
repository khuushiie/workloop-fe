import React from "react";
import { User } from "lucide-react";
import type { IUserDetail } from "../../../../types";
import { SelectOption } from "../../../common/Select";
import { TextField, SelectField } from "./FormFields";
import { ValidationErrors } from "./formDefaults";
import { capitalizeWords } from "../../../../utils/nameUtils";
import SignedImage from "../../../common/SignedImage";

interface BasicInfoSectionProps {
  formData: Partial<IUserDetail>;
  formErrors: Record<string, string>;
  genderOptions: SelectOption[];
  managerOptions: SelectOption[];
  isViewMode: boolean;
  selfEditMode?: boolean;
  profilePicPreview: string | null;
  profilePicUploading?: boolean;
  onProfilePicChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onProfilePicRemove: () => void;
  onFieldChange: <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K]
  ) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  getValidationErrors: (data: Partial<IUserDetail>) => ValidationErrors;
  markFieldTouched: (fieldName: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  formErrors,
  genderOptions,
  managerOptions,
  isViewMode,
  selfEditMode,
  profilePicPreview,
  profilePicUploading = false,
  onProfilePicChange,
  onProfilePicRemove,
  onFieldChange,
  setFormErrors,
  markFieldTouched,
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Reset image error state when profile picture changes
  React.useEffect(() => {
    setImgError(false);
  }, [profilePicPreview, formData.profilePic]);

  const handleFieldBlur = (field: keyof IUserDetail) => {
    // Just mark as touched, the global useEffect will handle validation
    markFieldTouched(field);
  };

  const handleFieldChange = <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K]
  ) => {
    // Update the form data
    onFieldChange(field, value);

    // Immediately clear the error for this field if a value is entered
    if (value !== undefined && value !== null && value !== "") {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSelectChange = <K extends keyof IUserDetail>(
    field: K,
    value: IUserDetail[K]
  ) => {
    // Update the form data
    onFieldChange(field, value);

    // Immediately clear the error for this field if a value is selected
    if (value) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <section className="space-y-3">
      <h4 className="text-lg font-semibold text-slate-900">Basic Information</h4>

      <div className="flex flex-col min-h-[169px] items-center py-1">
        <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-slate-200 relative">
          {profilePicUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-10">
              <span className="text-xs text-white font-medium">Uploading…</span>
            </div>
          )}
          {profilePicPreview && !imgError ? (
            <img
              src={profilePicPreview}
              alt="Profile preview"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : formData.profilePic && !imgError ? (
            <SignedImage
              rawUrl={formData.profilePic}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <User className="w-16 h-16 text-slate-400" />
          )}
        </div>
        {!isViewMode && (
          <div className="flex space-x-3 mt-3">
            <label
              htmlFor="profile-upload"
              className="cursor-pointer px-4 py-1.5 text-sm font-medium text-primary-700 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
            >
              {profilePicPreview || formData.profilePic
                ? "Change Photo"
                : "Upload Photo"}
            </label>
            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onProfilePicChange}
            />
            {(profilePicPreview || formData.profilePic) && (
              <button
                type="button"
                onClick={onProfilePicRemove}
                className="px-4 py-1.5 text-sm font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      <TextField
        label="Employee ID"
        value={formData.employeeId}
        onChange={(value) => handleFieldChange("employeeId", value)}
        disabled={isViewMode || selfEditMode}
        required
        onBlur={() => handleFieldBlur("employeeId")}
        error={formErrors.employeeId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="First Name"
          value={formData.firstName}
          onChange={(value) => handleFieldChange("firstName", capitalizeWords(value))}
          required
          onBlur={() => handleFieldBlur("firstName")}
          disabled={isViewMode || selfEditMode}
          error={formErrors.firstName}
        />
        <TextField
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => handleFieldChange("lastName",capitalizeWords( value))}
          onBlur={() => handleFieldBlur("lastName")}
          disabled={isViewMode || selfEditMode}
          error={formErrors.lastName}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Father's Name"
          placeholder="Enter father's name"
          value={formData.fatherName}
          onChange={(value) => handleFieldChange("fatherName", value)}
          disabled={isViewMode}
        />
        <TextField
          label="Mother's Name"
          placeholder="Enter mother's name"
          value={formData.motherName}
          onChange={(value) => handleFieldChange("motherName", value)}
          disabled={isViewMode}
        />
      </div>

      <TextField
        label="Email"
        type="email"
        placeholder="Enter your email address"
        value={formData.email}
        onChange={(value) => handleFieldChange("email", value)}
        onBlur={() => handleFieldBlur("email")}
        disabled={isViewMode}
        error={formErrors.email}
      />

      <TextField
        label="Work Email"
        type="email"
        placeholder="Enter your work email address"
        value={formData.workEmail}
        onChange={(value) => handleFieldChange("workEmail", value)}
        required
        onBlur={() => handleFieldBlur("workEmail")}
        disabled={isViewMode || selfEditMode}
        error={formErrors.workEmail}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Phone"
          placeholder="9876543210"
          value={formData.phone}
          onChange={(value) =>
            handleFieldChange("phone", value.replace(/[^\d]/g, "").slice(0, 10))
          }
          required
          onBlur={() => handleFieldBlur("phone")}
          disabled={isViewMode}
          error={formErrors.phone}
        />
        <SelectField
          label="Gender"
          value={formData.gender}
          options={genderOptions}
          onChange={(value) =>
            handleSelectChange("gender", value as string)
          }
          onBlur={() => handleFieldBlur("gender")}
          required
          disabled={isViewMode}
          error={formErrors.gender}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Reporting Manager"
          value={formData.reportingManagerId as string | undefined}
          options={managerOptions}
          onChange={(value) => handleSelectChange("reportingManagerId", value)}
          clearable
          searchable
          disabled={isViewMode || selfEditMode}
        />
        <SelectField
          label="Functional Manager"
          value={formData.functionalManagerId as string | undefined}
          options={managerOptions}
          onChange={(value) => handleSelectChange("functionalManagerId", value)}
          clearable
          searchable
          disabled={isViewMode || selfEditMode}
        />
      </div>
    </section>
  );
};

export default BasicInfoSection;
