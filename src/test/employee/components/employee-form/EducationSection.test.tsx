import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EducationSection from "../../../../components/employees/components/employee-form/EducationSection";

// ✅ Mock FormFields
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

// ✅ Mock Custom Components (DatePicker & TextArea)
vi.mock("../../../common", () => ({
  DatePicker: ({ label, onChange }: any) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        data-testid={`date-${label}`}
        onChange={(e) => {
          // Simulate dayjs object formatting
          onChange(e.target.value ? { format: () => e.target.value } : null);
        }}
      />
    </div>
  ),
}));

vi.mock("../../../common/TextArea", () => ({
  TextArea: ({ label, value, onChange }: any) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <textarea
        id={label}
        data-testid={`textarea-${label}`}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}));

describe("EducationSection", () => {
  const mockEducation = [
    {
      institutionName: "MIT",
      discipline: { id: "1", name: "Computer Science" },
      startDate: "2015-08-01",
      endDate: "2019-05-01",
      grade: "3.8",
      explainBreaks: "",
    },
  ];

  const defaultProps = {
    educationDetails: mockEducation,
    disciplines: [{ label: "Computer Science", value: "1" }],
    isViewMode: false,
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders education fields", () => {
    render(<EducationSection {...defaultProps} />);

    expect(screen.getByLabelText(/Institution Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Discipline/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/GPA \/ Grade/i)).toBeInTheDocument();
  });

  it("calls onAdd when Add Education is clicked", () => {
    render(<EducationSection {...defaultProps} />);

    const addButton = screen.getByText(/Add Education/i);
    fireEvent.click(addButton);

    expect(defaultProps.onAdd).toHaveBeenCalled();
  });

  it("calls onChange when a field is updated", () => {
    render(<EducationSection {...defaultProps} />);

    const instInput = screen.getByLabelText(/Institution Name/i);
    fireEvent.change(instInput, { target: { value: "Harvard" } });

    expect(defaultProps.onChange).toHaveBeenCalledWith(
      0,
      "institutionName",
      "Harvard"
    );
  });
});