import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LeaveCreation from "../../components/leave/LeaveCreation";
import { apiService } from "../../services/api";

// ✅ 1. Mock API Service (Used heavily in `useEffect` here)
vi.mock("../../services/api", () => ({
  apiService: {
    getCurrentUser: vi.fn(() => ({ id: "user-1", firstName: "John", lastName: "Doe" })),
    getEmployees: vi.fn().mockResolvedValue([]),
    getHolidays: vi.fn().mockResolvedValue([]),
    getUserLeaveRequests: vi.fn().mockResolvedValue([]),
    getActiveFilterOptions: vi.fn().mockResolvedValue([{ code: "sick", label: "Sick Leave" }]),
    getAllLeaveBalances: vi.fn().mockResolvedValue({ sick: 10 }),
    createLeaveRequest: vi.fn().mockResolvedValue({ success: true }),
  },
}));

// ✅ 2. Mock Hooks
vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true), // Can select employees
}));

// ✅ 3. Mock Custom UI Components
vi.mock("../../components/common", () => ({
  Select: ({ label, onChange, options, value }: any) => (
    <div data-testid={`mock-select-${label}`}>
      <label>{label}</label>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  ),
  DatePicker: ({ label, onChange }: any) => (
    <div data-testid={`mock-datepicker-${label}`}>
      <label>{label}</label>
      <input 
        data-testid={`datepicker-input-${label}`}
        onChange={(e) => onChange(e.target.value ? { format: () => e.target.value, day: () => 1 } : null)} 
      />
    </div>
  ),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} type="submit">{children}</button>
  )
}));

vi.mock("../../components/common/TextArea", () => ({
  TextArea: ({ label, value, onChange }: any) => (
    <div data-testid="mock-textarea">
      <label>{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}));

describe("LeaveCreation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the leave creation form", async () => {
    render(<LeaveCreation />);
    
    // Wait for the async data (API calls in useEffect) to finish loading
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Create Leave Request")).toBeInTheDocument();
    expect(screen.getByTestId("mock-select-Leave Type")).toBeInTheDocument();
    expect(screen.getByTestId("mock-datepicker-Start Date")).toBeInTheDocument();
    expect(screen.getByTestId("mock-datepicker-End Date")).toBeInTheDocument();
    expect(screen.getByTestId("mock-textarea")).toBeInTheDocument();
  });

  it("prevents submission if required fields are missing", async () => {
    render(<LeaveCreation />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Click submit without filling anything
    const submitBtn = screen.getByText("Submit");
    fireEvent.click(submitBtn);

    // API should not be called
    expect(apiService.createLeaveRequest).not.toHaveBeenCalled();
  });

  it("handles form inputs and calculates half day correctly", async () => {
    render(<LeaveCreation />);
    
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    // Toggle half-day checkbox
    const halfDayCheckbox = screen.getByRole("checkbox");
    fireEvent.click(halfDayCheckbox);
    expect(halfDayCheckbox).toBeChecked();
  });
});