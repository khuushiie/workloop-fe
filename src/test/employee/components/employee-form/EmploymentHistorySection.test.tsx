import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmploymentHistorySection from "../../../../components/employees/components/employee-form/EmploymentHistorySection";

// ✅ Mock FormFields
vi.mock(
  "../../../../components/employees/components/employee-form/FormFields",
  () => ({
    TextField: ({ label, value, onChange, type }: any) => (
      <div>
        <label htmlFor={label}>{label}</label>
        <input
          id={label}
          type={type || "text"}
          data-testid={`input-${label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
    SelectField: ({ label, value, onChange }: any) => (
      <div>
        <label htmlFor={label}>{label}</label>
        <select
          id={label}
          data-testid={`input-${label}`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    ),
  })
);

// ✅ Mock DatePicker (clean)
vi.mock("../../../common", () => ({
  DatePicker: ({ label, onChange }: any) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={`date-${label}`}
        onChange={(e) =>
          onChange(e.target.value ? { format: () => e.target.value } : null)
        }
      />
    </div>
  ),
}));

// ✅ Mock TextArea (IMPORTANT FIX)
vi.mock("../../../common/TextArea", () => ({
  TextArea: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <textarea
        data-testid="textarea-reason"
        placeholder="Enter your reason for leaving here..."
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

describe("EmploymentHistorySection", () => {
  const mockEmployments = [
    {
      employerName: "Tech Corp",
      designation: { id: "1", name: "Software Engineer" },
      startDate: "2020-01-01",
      endDate: "2022-01-01",
      annualCTC: 1000000,
      breakReason: "",
    },
  ];

  const defaultProps = {
    employments: mockEmployments,
    positionOptions: [{ label: "Software Engineer", value: "1" }],
    isViewMode: false,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders employment fields", () => {
    render(<EmploymentHistorySection {...defaultProps} />);

    expect(screen.getByLabelText(/Employer Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Annual CTC/i)).toBeInTheDocument();

    // ✅ FIX: use placeholder (since label not linked)
    expect(
      screen.getByPlaceholderText(/reason for leaving/i)
    ).toBeInTheDocument();
  });

  it("calls onAdd when Add Employment is clicked", () => {
    render(<EmploymentHistorySection {...defaultProps} />);

    fireEvent.click(screen.getByText(/Add Employment/i));

    expect(defaultProps.onAdd).toHaveBeenCalled();
  });

  it("calls onChange when employer name is updated", () => {
    render(<EmploymentHistorySection {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Employer Name/i), {
      target: { value: "New Tech Corp" },
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      0,
      "employerName",
      "New Tech Corp"
    );
  });

  it("converts annual CTC to a number on change", () => {
    render(<EmploymentHistorySection {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Annual CTC/i), {
      target: { value: "1500000" },
    });

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      0,
      "annualCTC",
      1500000
    );
  });
});