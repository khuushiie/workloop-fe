import React, { useCallback } from "react";
import type { IUserDetail, IUserDetailAddress } from "../../../../types";
import { SelectOption } from "../../../common/Select";
import { TextField, SelectField } from "./FormFields";
import { ValidationErrors } from "./formDefaults";

interface AddressSectionProps {
  address?: IUserDetail["address"];
  permanentAddress?: IUserDetail["permanentAddress"];
  sameAsCurrent: boolean;
  isViewMode: boolean;
  selfEditMode?: boolean;
  formErrors: Record<string, string>;
  stateOptions: SelectOption[];
  countryOptions: SelectOption[];
  onAddressChange: <K extends keyof NonNullable<IUserDetail["address"]>>(
    field: K,
    value: NonNullable<IUserDetail["address"]>[K]
  ) => void;
  onPermanentAddressChange: <K extends keyof NonNullable<IUserDetail["permanentAddress"]>>(
    field: K,
    value: NonNullable<IUserDetail["permanentAddress"]>[K]
  ) => void;
  onSameAsCurrentChange: (checked: boolean) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  markFieldTouched: (fieldName: string) => void;
}

const AddressFields: React.FC<{
  prefix: string;
  address?: IUserDetailAddress;
  disabled: boolean;
  formErrors: Record<string, string>;
  stateOptions: SelectOption[];
  countryOptions: SelectOption[];
  onFieldChange: (field: keyof IUserDetailAddress, value: string) => void;
  onSelectChange: (field: keyof IUserDetailAddress, value: string) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  markFieldTouched: (fieldName: string) => void;
}> = ({
  prefix,
  address,
  disabled,
  formErrors,
  stateOptions,
  countryOptions,
  onFieldChange,
  onSelectChange,
  setFormErrors,
  markFieldTouched,
}) => (
  <>
    <TextField
      label="Street"
      placeholder="Enter street name..."
      value={address?.street}
      onChange={(value) => onFieldChange("street", value)}
      disabled={disabled}
    />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <TextField
        label="City"
        placeholder="E.g. Pune"
        value={address?.city}
        onChange={(value) => onFieldChange("city", value)}
        disabled={disabled}
      />
      <SelectField
        label="State / UT"
        value={address?.state}
        options={stateOptions}
        onChange={(value) => onSelectChange("state", value)}
        disabled={disabled}
        searchable
      />
      <TextField
        label="ZIP / PIN Code"
        placeholder="E.g. 474009"
        value={address?.zipCode}
        onChange={(value) =>
          onFieldChange("zipCode", value.replace(/[^\d]/g, "").slice(0, 6))
        }
        disabled={disabled}
        error={formErrors[`${prefix}zipCode`] || formErrors.zipCode}
        onBlur={() => markFieldTouched(`${prefix}zipCode`)}
      />
      <SelectField
        label="Country"
        value={address?.country ?? "India"}
        options={countryOptions}
        onChange={(value) => onSelectChange("country", value)}
        disabled={disabled}
        searchable
      />
    </div>
  </>
);

const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  permanentAddress,
  sameAsCurrent,
  isViewMode,
  selfEditMode,
  formErrors,
  stateOptions,
  countryOptions,
  onAddressChange,
  onPermanentAddressChange,
  onSameAsCurrentChange,
  setFormErrors,
  markFieldTouched,
}) => {
  const isDisabled = isViewMode && !selfEditMode;

  const handleCurrentFieldChange = useCallback(
    (field: keyof IUserDetailAddress, value: string) => {
      onAddressChange(field, value);
      if (value !== undefined && value !== null && value !== "") {
        setFormErrors((prev: ValidationErrors) => ({ ...prev, [field]: "" }));
      }
    },
    [onAddressChange, setFormErrors]
  );

  const handleCurrentSelectChange = useCallback(
    (field: keyof IUserDetailAddress, value: string) => {
      onAddressChange(field, value);
      if (value) {
        setFormErrors((prev: ValidationErrors) => ({ ...prev, [field]: "" }));
      }
    },
    [onAddressChange, setFormErrors]
  );

  const handlePermanentFieldChange = useCallback(
    (field: keyof IUserDetailAddress, value: string) => {
      onPermanentAddressChange(field, value);
    },
    [onPermanentAddressChange]
  );

  const handlePermanentSelectChange = useCallback(
    (field: keyof IUserDetailAddress, value: string) => {
      onPermanentAddressChange(field, value);
    },
    [onPermanentAddressChange]
  );

  return (
    <section className="space-y-5">
      <h4 className="text-lg font-semibold text-slate-900">Current Address</h4>
      <AddressFields
        prefix=""
        address={address}
        disabled={isDisabled}
        formErrors={formErrors}
        stateOptions={stateOptions}
        countryOptions={countryOptions}
        onFieldChange={handleCurrentFieldChange}
        onSelectChange={handleCurrentSelectChange}
        setFormErrors={setFormErrors}
        markFieldTouched={markFieldTouched}
      />

      <div className="flex items-center justify-between pt-2">
        <h4 className="text-lg font-semibold text-slate-900">Permanent Address</h4>
        {!isDisabled && (
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input
              type="checkbox"
              checked={sameAsCurrent}
              onChange={(e) => onSameAsCurrentChange(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            Same as Current Address
          </label>
        )}
      </div>

      <AddressFields
        prefix="permanent_"
        address={sameAsCurrent ? address : permanentAddress}
        disabled={isDisabled || sameAsCurrent}
        formErrors={formErrors}
        stateOptions={stateOptions}
        countryOptions={countryOptions}
        onFieldChange={handlePermanentFieldChange}
        onSelectChange={handlePermanentSelectChange}
        setFormErrors={setFormErrors}
        markFieldTouched={markFieldTouched}
      />
    </section>
  );
};

export default AddressSection;
