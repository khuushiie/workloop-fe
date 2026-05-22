import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BasicInfoSection from "../../../../components/employees/components/employee-form/BasicInfoSection";

vi.mock("../../../../components/common/SignedImage", () => ({
  default: () => <div data-testid="mock-signed-image">Profile Pic</div>,
}));

// ✅ Correct mock
vi.mock(
  "../../../../components/employees/components/employee-form/FormFields",
  () => ({
    TextField: ({ label, value, onChange }: any) => (
      <div>
        <label htmlFor={label}>{label}</label>
        <input
          id={label}
          data-testid={`input-${label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
    SelectField: ({ label, value, onChange }: any) => (
      <div data-testid={`select-${label}`}>
        <select
          data-testid={`input-${label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
  })
);

describe("BasicInfoSection", () => {
  const defaultProps = {
    formData: {
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      phone: "1234567890",
    },
    formErrors: {},
    genderOptions: [],
    managerOptions: [],
    isViewMode: false,
    profilePicPreview: null,
    onProfilePicChange: vi.fn(),
    onProfilePicRemove: vi.fn(),
    onFieldChange: vi.fn(),
    setFormErrors: vi.fn(),
    getValidationErrors: vi.fn(),
    markFieldTouched: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all basic info fields", () => {
    render(<BasicInfoSection {...defaultProps} />);

    expect(screen.getByText("Basic Information")).toBeInTheDocument();

    // ✅ Label-based queries
    expect(screen.getByLabelText(/^First Name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Last Name$/i)).toBeInTheDocument();

    // ✅ FIX: Avoid ambiguity between Email & Work Email
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Work Email$/i)).toBeInTheDocument();

    // Interactions
    fireEvent.change(screen.getByLabelText(/^First Name$/i), {
      target: { value: "Jane" },
    });

    fireEvent.change(screen.getByLabelText(/^Phone$/i), {
      target: { value: "abc123456" },
    });

    // Other elements
    expect(screen.getByTestId("select-Gender")).toBeInTheDocument();
  });

  it("calls onFieldChange when a field is updated", () => {
    render(<BasicInfoSection {...defaultProps} />);

    const input = screen.getByTestId("input-First Name");

    fireEvent.change(input, { target: { value: "Jane" } });

    expect(defaultProps.onFieldChange).toHaveBeenCalledWith(
      "firstName",
      "Jane"
    );
  });

  it("strips non-numeric characters from phone number", () => {
    render(<BasicInfoSection {...defaultProps} />);

    const phoneInput = screen.getByTestId("input-Phone");

    fireEvent.change(phoneInput, {
      target: { value: "abc123456" },
    });

    expect(defaultProps.onFieldChange).toHaveBeenCalledWith(
      "phone",
      "123456"
    );
  });
});