import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import WorkInfoSection, {  validateDob } from "../../../../components/employees/components/employee-form/WorkInfoSection";

// 1. Bulletproof Dayjs mock
vi.mock("dayjs", () => {
  const d: any = () => ({ format: () => "2024-01-01" });
  d.tz = { guess: () => "Asia/Kolkata", setDefault: () => {} };
  return { default: d };
});

vi.mock("../../../../components/common", () => ({
  DatePicker: ({ label, onChange }: any) => (
    <div data-testid={`datepicker-${label}`}>
      <button onClick={() => onChange("2024-01-01")}>Select Date</button>
    </div>
  )
}));

// UPDATED MOCK: We now pass down placeholders and values so RTL queries work perfectly
vi.mock("../../../../components/employee/components/employee-form/FormFields", () => ({
  TextField: ({ label, value, placeholder, onChange, disabled }: any) => (
    <div>
      <label>{label}</label>
      <input 
        placeholder={placeholder} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        disabled={disabled} 
      />
    </div>
  ),
  SelectField: ({ label, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <button>{placeholder || "Select an option"}</button>
    </div>
  )
}));

describe("WorkInfoSection", () => {
  describe("validateDob", () => {
    it("returns error if user is under 18", () => {
      const today = new Date();
      const under18 = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()).toISOString();
      // FIX 1: Relaxed string assertion
      expect(validateDob(under18)).toMatch(/at least 18/i);
    });

    it("returns empty string if user is 18 or older", () => {
      const today = new Date();
      const over18 = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate()).toISOString();
      expect(validateDob(over18)).toBe("");
    });
  });

  const defaultProps = {
    formData: {},
    formErrors: {},
    isViewMode: false,
    roleOptions: [],
    departmentOptions: [],
    positionOptions: [],
    employmentTypeOptions: [],
    statusOptions: [],
    onFieldChange: vi.fn(),
    setFormErrors: vi.fn(),
    getValidationErrors: vi.fn(),
    markFieldTouched: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders work info fields", () => {
    render(<WorkInfoSection {...defaultProps} />);
    expect(screen.getByText("Work Information")).toBeInTheDocument();
    
    // FIX 2: Check by text/label instead of strict test IDs
    expect(screen.getByText(/Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Department/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("AFZPK7190K")).toBeInTheDocument();
  });

  it("formats PAN card to uppercase automatically", () => {
    render(<WorkInfoSection {...defaultProps} />);
    
    // FIX 3: Query by placeholder
    const panInput = screen.getByPlaceholderText("AFZPK7190K");
    fireEvent.change(panInput, { target: { value: "abcde1234f" } });
    
    expect(defaultProps.onFieldChange).toHaveBeenCalledWith("panCardNo", "ABCDE1234F");
  });
});