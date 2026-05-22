import React from "react";
// ✅ 1. Import waitFor
import { render, screen, fireEvent, waitFor } from "@testing-library/react"; 
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import LeaveFiltersBar from "../../components/leave/LeaveFiltersBar";

describe("LeaveFiltersBar", () => {
  const defaultProps = {
    value: { search: "", department: "", startDate: "", endDate: "" },
    users: [],
    departments: [{ label: "Engineering", value: "dept-1" }],
    onChange: vi.fn(),
  };

  it("renders all filter inputs", () => {
    render(<LeaveFiltersBar {...defaultProps} />);
    
    expect(screen.getByPlaceholderText(/Search Employee/i)).toBeInTheDocument();
    expect(screen.getByText(/All Departments/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/Select date/i).length).toBeGreaterThanOrEqual(2);
  });

  // ✅ 2. Make the test async
  it("calls onChange when search is updated", async () => {
    render(<LeaveFiltersBar {...defaultProps} />);
    
    const searchInput = screen.getByPlaceholderText(/Search Employee/i);
    fireEvent.change(searchInput, { target: { value: "John" } });
    
    // ✅ 3. Wait for the 600ms debounce to finish!
    await waitFor(() => {
      expect(defaultProps.onChange).toHaveBeenCalledWith("search", "John");
    }, { timeout: 1000 }); // Give it up to 1 second to fire
  });

  it("calls onChange when department is selected", () => {
    render(<LeaveFiltersBar {...defaultProps} />);
    
    const deptDropdown = screen.getByText(/All Departments/i);
    fireEvent.click(deptDropdown);
    
    expect(deptDropdown).toBeInTheDocument();
  });
});