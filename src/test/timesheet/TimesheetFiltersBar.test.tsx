import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TimesheetFiltersBar from "../../components/timesheet/TimesheetFiltersBar";

const stableConfigResponse = { data: [] };

vi.mock("../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: vi.fn(() => stableConfigResponse),
}));

vi.mock("../../components/common/SearchInput", () => ({
  default: ({ onChange, placeholder }: any) => (
    <input 
      placeholder={placeholder || "Search"} 
      onChange={(e) => onChange(e.target.value)} 
    />
  )
}));

vi.mock("../../components/common", () => ({
  Select: ({ onChange, label }: any) => (
    <div>
      <span>{label}</span>
      <select onChange={(e) => onChange(e.target.value)}>
        <option value="test">Test Option</option>
      </select>
    </div>
  ),
  DatePicker: ({ onChange, label }: any) => (
    <div>
      <label>{label}</label>
      <input 
        onChange={(e) => onChange(e.target.value ? { format: () => e.target.value } : null)} 
      />
    </div>
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("TimesheetFiltersBar", () => {
  const defaultProps = {
    setFilters: vi.fn(),
    setCurrentPage: vi.fn(),
    value: { search: "", department: "", status: "", fromDate: "", toDate: "" },
    users: [],
    onChange: vi.fn(),
    showDateRange: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all filter inputs", () => {
    render(<TimesheetFiltersBar {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    
    // ✅ FIX: Use getByText for labels instead of getByTitle
    expect(screen.getByText(/Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Department/i)).toBeInTheDocument();
  });

  it("calls onChange when search is updated (with debounce wait)", async () => {
    render(<TimesheetFiltersBar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Search/i);
    fireEvent.change(searchInput, { target: { value: "Project X" } });

    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalledWith("search", "Project X");
    }, { timeout: 1000 });
  });
});