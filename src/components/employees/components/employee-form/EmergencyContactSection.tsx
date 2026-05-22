import React from "react";
import type { IUserDetail } from "../../../../types";
import { SelectOption } from "../../../common/Select";
import { TextField, SelectField } from "./FormFields";
import { ValidationErrors } from "./formDefaults";

interface EmergencyContactSectionProps {
  contact?: IUserDetail["emergencyContact"];
  formData: Partial<IUserDetail>;
  isViewMode: boolean;
  selfEditMode?: boolean;
  formErrors: Record<string, string>;
  relationshipOptions: SelectOption[];
  onContactChange: <K extends keyof NonNullable<IUserDetail["emergencyContact"]>>(
    field: K,
    value: NonNullable<IUserDetail["emergencyContact"]>[K]
  ) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  getValidationErrors: (data: Partial<IUserDetail>) => ValidationErrors;
  markFieldTouched: (fieldName: string) => void;
}

const EmergencyContactSection: React.FC<EmergencyContactSectionProps> = ({
  contact,
  isViewMode,
  selfEditMode,
  formErrors,
  relationshipOptions,
  onContactChange,
  setFormErrors,
  markFieldTouched,
}) => {
  const handleFieldBlur = (errorKey: string) => {
    // Just mark as touched, the global useEffect will handle validation
    markFieldTouched(errorKey);
  };

  const handleTextFieldChange = (
    field: keyof NonNullable<IUserDetail["emergencyContact"]>,
    value: string
  ) => {
    onContactChange(field, value);

    // Determine the error key
    const errorKey =
      field === "name"
        ? "emergencyName"
        : field === "phone"
        ? "emergencyPhone"
        : "emergencyRelationship";

    // Clear error immediately if value is entered
    if (value !== undefined && value !== null && value !== "") {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  const handleSelectChange = (
    field: keyof NonNullable<IUserDetail["emergencyContact"]>,
    value: string
  ) => {
    onContactChange(field, value);

    // Clear error immediately if value is selected
    const errorKey = "emergencyRelationship";
    if (value) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [errorKey]: "",
      }));
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-900">Emergency Contact</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TextField
          label="Name"
          placeholder="Enter the person name here..."
          value={contact?.name}
          onChange={(value) => handleTextFieldChange("name", value)}
          required
          disabled={isViewMode && !selfEditMode}
          onBlur={() => handleFieldBlur("emergencyName")}
          error={formErrors.emergencyName}
        />
        <SelectField
          label="Relationship"
          value={contact?.relationshipId}
          options={relationshipOptions}
          onChange={(value) => handleSelectChange("relationshipId", value)}
          required
          disabled={isViewMode && !selfEditMode}
          searchable
          onBlur={() => handleFieldBlur("emergencyRelationship")}
          error={formErrors.emergencyRelationship}
        />
        <TextField
          label="Phone"
          placeholder="9876543210"
          value={contact?.phone}
          onChange={(value) =>
            handleTextFieldChange(
              "phone",
              value.replace(/[^\d]/g, "").slice(0, 10)
            )
          }
          required
          disabled={isViewMode && !selfEditMode}
          onBlur={() => handleFieldBlur("emergencyPhone")}
          error={formErrors.emergencyPhone}
        />
      </div>
    </section>
  );
};
export default EmergencyContactSection;
