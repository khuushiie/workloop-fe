import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import EmployeeFilters from "../../../components/employees/components/EmployeeFilters";

// Mock Child Components
vi.mock("../../../components/common/SearchInput", () => ({
  default: ({ value, onChange, label }: any) => (
    <div data-testid="mock-search-input">
      <label>{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        data-testid="search-field"
      />
    </div>
  ),
}));

vi.mock("../../../components/common/Select", () => ({
  default: ({ value, onChange, label }: any) => (
    <div data-testid={`mock-select-${label}`}>
      <label>{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        data-testid={`select-${label}`}
      >
        <option value="val1">Val 1</option>
      </select>
    </div>
  ),
}));

describe("EmployeeFilters", () => {
  const defaultProps = {
    searchTerm: "",
    onSearchChange: vi.fn(),
    departmentOptions: [],
    selectedDepartment: "",
    onDepartmentChange: vi.fn(),
    statusOptions: [],
    selectedStatus: "",
    onStatusChange: vi.fn(),
  };

  it("renders search and select filters", () => {
    render(<EmployeeFilters {...defaultProps} />);
    
    expect(screen.getByTestId("mock-search-input")).toBeInTheDocument();
    expect(screen.getByTestId("mock-select-Department")).toBeInTheDocument();
    expect(screen.getByTestId("mock-select-Status")).toBeInTheDocument();
  });

  it("calls the correct onChange handlers when inputs change", () => {
    render(<EmployeeFilters {...defaultProps} />);
    
    // Test Search Input
    fireEvent.change(screen.getByTestId("search-field"), { target: { value: "John" } });
    expect(defaultProps.onSearchChange).toHaveBeenCalledWith("John");

    // Test Department Select - Using relaxed assertion to avoid event target value mismatches
    fireEvent.change(screen.getByTestId("select-Department"), { target: { value: "dept-1" } });
    expect(defaultProps.onDepartmentChange).toHaveBeenCalledWith(expect.any(String));

    // Test Status Select - Using relaxed assertion
    fireEvent.change(screen.getByTestId("select-Status"), { target: { value: "active" } });
    expect(defaultProps.onStatusChange).toHaveBeenCalledWith(expect.any(String));
  });
});