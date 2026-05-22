import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { TextField, SelectField } from "../../../../components/employees/components/employee-form/FormFields";

// Mock the underlying Select component to keep it simple
vi.mock("../../../../components/common/Select", () => ({
  default: ({ label, value, onChange, options, error }: any) => (
    <div data-testid={`mock-select-${label}`}>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid="select-input">
        <option value="">Select...</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="error">{error}</span>}
    </div>
  )
}));

describe("FormFields", () => {
  describe("TextField", () => {
    it("renders correctly with label and placeholder", () => {
      render(
        <TextField label="First Name" onChange={vi.fn()} placeholder="Enter name" />
      );
      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
    });

    it("displays error message when provided", () => {
      render(
        <TextField label="Email" onChange={vi.fn()} error="Invalid email" />
      );
      expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    it("calls onChange with the typed value", () => {
      const handleChange = vi.fn();
      render(<TextField label="Name" onChange={handleChange} />);
      
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "John" } });
      
      expect(handleChange).toHaveBeenCalledWith("John");
    });
  });

  describe("SelectField", () => {
    const options = [{ label: "Admin", value: "admin" }];

    it("renders correctly and passes options", () => {
      render(
        <SelectField label="Role" options={options} onChange={vi.fn()} />
      );
      expect(screen.getByTestId("mock-select-Role")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("calls onChange when a new option is selected", () => {
      const handleChange = vi.fn();
      render(
        <SelectField label="Role" options={options} onChange={handleChange} />
      );
      
      const select = screen.getByTestId("select-input");
      fireEvent.change(select, { target: { value: "admin" } });
      
      expect(handleChange).toHaveBeenCalledWith("admin");
    });
  });
});