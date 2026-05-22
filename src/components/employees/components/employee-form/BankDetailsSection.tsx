import React from "react";
import type { IUserDetail } from "../../../../types";
import { TextField } from "./FormFields";
import { ValidationErrors } from "./formDefaults";

interface BankDetailsSectionProps {
  bankDetails?: IUserDetail["bankDetails"];
  isViewMode: boolean;
  selfEditMode?: boolean;
  formErrors: Record<string, string>;
  ifscLookupLoading: boolean;
  ifscLookupError: string;
  onBankChange: <K extends keyof NonNullable<IUserDetail["bankDetails"]>>(
    field: K,
    value: NonNullable<IUserDetail["bankDetails"]>[K]
  ) => void;
  onIfscLookup: (ifscCode: string) => void;
  setFormErrors: React.Dispatch<React.SetStateAction<ValidationErrors>>;
  markFieldTouched: (fieldName: string) => void;
}

const BankDetailsSection: React.FC<BankDetailsSectionProps> = ({
  bankDetails,
  isViewMode,
  selfEditMode,
  formErrors,
  ifscLookupLoading,
  ifscLookupError,
  onBankChange,
  onIfscLookup,
  setFormErrors,
  markFieldTouched,
}) => {
  const handleFieldChange = <
    K extends keyof NonNullable<IUserDetail["bankDetails"]>
  >(
    field: K,
    value: NonNullable<IUserDetail["bankDetails"]>[K]
  ) => {
    onBankChange(field, value);

    // Clear error immediately if value is entered
    if (value !== undefined && value !== null && value !== "") {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleAccountNumberChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    onBankChange("accountNumber", numericValue);
    if (numericValue.length >= 9 && numericValue.length <= 16) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        accountNumber: "",
      }));
    }
  };

  const validateAccountNumber = () => {
    const accountNumber = bankDetails?.accountNumber || "";
    if (accountNumber && (accountNumber.length < 9 || accountNumber.length > 16)) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        accountNumber: "Account number must be between 9 and 16 digits",
      }));
    }
    markFieldTouched("accountNumber");
  };

  const handleBankNameChange = (value: string) => {
    const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, "");
    onBankChange("bankName", sanitizedValue);
    if (sanitizedValue) {
      setFormErrors((prev: ValidationErrors) => ({
        ...prev,
        bankName: "",
      }));
    }
  };

  return (
    <section className="space-y-5">
      <h4 className="text-lg font-semibold text-slate-900">Bank Details</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="Account Holder Name"
          placeholder="Enter account holder name here..."
          value={bankDetails?.accountHolderName}
          onChange={(value) => handleFieldChange("accountHolderName", value)}
          disabled={isViewMode && !selfEditMode}
        />
        <TextField
          label="Account Number"
          placeholder="Enter account number here..."
          value={bankDetails?.accountNumber}
          onChange={handleAccountNumberChange}
          disabled={isViewMode && !selfEditMode}
          error={formErrors.accountNumber}
          maxLength={16}
          onBlur={validateAccountNumber}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="IFSC Code"
          placeholder="SBIN0005943"
          value={bankDetails?.ifscCode}
          onChange={(value) =>
            handleFieldChange("ifscCode", value.toUpperCase())
          }
          disabled={isViewMode && !selfEditMode}
          error={formErrors.ifscCode ?? ifscLookupError}
          maxLength={11}
          onBlur={() => {
            markFieldTouched("ifscCode");
            if (bankDetails?.ifscCode?.trim()) {
              onIfscLookup(bankDetails.ifscCode.trim());
            }
          }}
        />
        <TextField
          label="Branch Name"
          placeholder="Enter your bank branch name here..."
          value={bankDetails?.branchName}
          onChange={(value) => handleFieldChange("branchName", value)}
          disabled={isViewMode && !selfEditMode}
        />
      </div>

      {ifscLookupLoading && (
        <p className="text-xs text-slate-500">Fetching bank details...</p>
      )}

      <TextField
        label="Bank Name"
        placeholder="Enter your bank name here..."
        value={bankDetails?.bankName}
        onChange={handleBankNameChange}
        disabled={isViewMode && !selfEditMode}
      />
    </section>
  );
};

export default BankDetailsSection;
