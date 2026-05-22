import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddressSection from "../../../../components/employees/components/employee-form/AddressSection";

vi.mock("../../../../components/employees/components/employee-form/FormFields", () => ({
  TextField: ({ label, value, onChange, disabled }: any) => (
    <div data-testid={`text-${label}`}>
      <input data-testid={`input-${label}`} value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </div>
  ),
  SelectField: ({ label, onChange }: any) => (
    <div data-testid={`select-${label}`}>
      <select data-testid={`input-${label}`} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}));

describe("AddressSection", () => {
  const defaultProps = {
    address: { street: "123 Main St", city: "Pune", state: "MH", zipCode: "411001", country: "India" },
    isViewMode: false,
    formErrors: {},
    stateOptions: [],
    countryOptions: [],
    onAddressChange: vi.fn(),
    setFormErrors: vi.fn(),
    markFieldTouched: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders address fields correctly", () => {
    render(<AddressSection {...defaultProps} />);
    expect(screen.getByText("Address Information")).toBeInTheDocument();
    expect(screen.getByTestId("text-Street")).toBeInTheDocument();
    expect(screen.getByTestId("text-ZIP / PIN Code")).toBeInTheDocument();
  });

  it("filters non-numeric characters from ZIP code and limits to 6 digits", () => {
    render(<AddressSection {...defaultProps} />);
    
    const zipInput = screen.getByTestId("input-ZIP / PIN Code");
    fireEvent.change(zipInput, { target: { value: "abc411001999" } });
    
    expect(defaultProps.onAddressChange).toHaveBeenCalledWith("zipCode", "411001");
  });
});