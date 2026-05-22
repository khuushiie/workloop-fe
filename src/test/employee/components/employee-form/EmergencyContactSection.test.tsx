import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmergencyContactSection from "../../../../components/employees/components/employee-form/EmergencyContactSection";

vi.mock("../../../../components/employees/components/employee-form/FormFields", () => ({
  TextField: ({ label, value, onChange, onBlur }: any) => (
    <div data-testid={`text-${label}`}>
      <input 
        data-testid={`input-${label}`} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)} 
        onBlur={onBlur}
      />
    </div>
  ),
  SelectField: ({ label, onChange }: any) => (
    <div data-testid={`select-${label}`}>
      <select data-testid={`input-${label}`} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}));

describe("EmergencyContactSection", () => {
  const defaultProps = {
    contact: { name: "Jane Doe", relationshipId: "rel-1", phone: "9876543210" },
    formData: {},
    isViewMode: false,
    formErrors: {},
    relationshipOptions: [],
    onContactChange: vi.fn(),
    setFormErrors: vi.fn(),
    getValidationErrors: vi.fn(),
    markFieldTouched: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders emergency contact fields", () => {
    render(<EmergencyContactSection {...defaultProps} />);
    expect(screen.getByText("Emergency Contact")).toBeInTheDocument();
    expect(screen.getByTestId("text-Name")).toBeInTheDocument();
    expect(screen.getByTestId("select-Relationship")).toBeInTheDocument();
  });

  it("strips non-numeric characters from emergency phone", () => {
    render(<EmergencyContactSection {...defaultProps} />);
    
    const phoneInput = screen.getByTestId("input-Phone");
    fireEvent.change(phoneInput, { target: { value: "abc9876543210def" } });
    
    expect(defaultProps.onContactChange).toHaveBeenCalledWith("phone", "9876543210");
  });

  it("calls markFieldTouched on blur", () => {
    render(<EmergencyContactSection {...defaultProps} />);
    
    const nameInput = screen.getByTestId("input-Name");
    fireEvent.blur(nameInput);
    
    expect(defaultProps.markFieldTouched).toHaveBeenCalledWith("emergencyName");
  });
});