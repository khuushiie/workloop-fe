import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BankDetailsSection from "../../../../components/employees/components/employee-form/BankDetailsSection";

// ✅ The Golden Mock for FormFields
vi.mock(
  "../../../../components/employees/components/employee-form/FormFields",
  () => ({
    TextField: ({ label, value, onChange, onBlur, error }: any) => (
      <div>
        <label htmlFor={label}>{label}</label>
        <input
          id={label}
          data-testid={`input-${label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        {error && <span data-testid={`error-${label}`}>{error}</span>}
      </div>
    ),
  })
);

describe("BankDetailsSection", () => {
  const defaultProps = {
    bankDetails: {
      accountHolderName: "John Doe",
      accountNumber: "123456789",
      ifscCode: "SBIN0001234",
      branchName: "Main Branch",
      bankName: "State Bank",
    },
    isViewMode: false,
    formErrors: {},
    ifscLookupLoading: false,
    ifscLookupError: "",
    onBankChange: vi.fn(),
    onIfscLookup: vi.fn(),
    setFormErrors: vi.fn(),
    markFieldTouched: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all bank detail fields", () => {
    render(<BankDetailsSection {...defaultProps} />);

    expect(screen.getByLabelText(/Account Holder Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/IFSC Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Branch Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bank Name/i)).toBeInTheDocument();
  });

  it("calls onBankChange when a standard field is updated", () => {
    render(<BankDetailsSection {...defaultProps} />);

    const nameInput = screen.getByLabelText(/Account Holder Name/i);
    fireEvent.change(nameInput, { target: { value: "Jane Doe" } });

    expect(defaultProps.onBankChange).toHaveBeenCalledWith(
      "accountHolderName",
      "Jane Doe"
    );
  });

  it("strips non-numeric characters from account number", () => {
    render(<BankDetailsSection {...defaultProps} />);

    const accInput = screen.getByLabelText(/Account Number/i);
    fireEvent.change(accInput, { target: { value: "123abc456" } });

    expect(defaultProps.onBankChange).toHaveBeenCalledWith(
      "accountNumber",
      "123456"
    );
  });

  it("strips non-alphabetic characters from bank name", () => {
    render(<BankDetailsSection {...defaultProps} />);

    const bankNameInput = screen.getByLabelText(/Bank Name/i);
    fireEvent.change(bankNameInput, { target: { value: "HDFC Bank 123!" } });

    expect(defaultProps.onBankChange).toHaveBeenCalledWith(
      "bankName",
      "HDFC Bank "
    );
  });

  it("triggers IFSC lookup on blur if code exists", () => {
    render(<BankDetailsSection {...defaultProps} />);

    const ifscInput = screen.getByLabelText(/IFSC Code/i);
    fireEvent.blur(ifscInput);

    expect(defaultProps.markFieldTouched).toHaveBeenCalledWith("ifscCode");
    expect(defaultProps.onIfscLookup).toHaveBeenCalledWith("SBIN0001234");
  });
});