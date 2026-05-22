import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import LeaveViewModal from "../../components/leave/LeaveViewModal";
import { WorkflowStatusCode } from "../../utils/constants";

describe("LeaveViewModal", () => {
  const mockRecord = {
    id: "1",
    userId: "user-1",
    employeeId: "EMP-001",
    userName: "John Doe",
    leaveType: "sick_leave",
    leaveTypeName: "Sick Leave",
    startDate: "2024-01-01T00:00:00.000Z",
    endDate: "2024-01-02T00:00:00.000Z",
    days: 2,
    reason: "Not feeling well",
    status: "approved" as WorkflowStatusCode,
    appliedDate: "2023-12-30T00:00:00.000Z",
    departmentName: "Engineering",
  };

  it("does not render when record is null", () => {
    render(<LeaveViewModal record={null} onClose={vi.fn()} />);
    expect(screen.queryByText(/Leave Details/i)).not.toBeInTheDocument();
  });

  it("renders correctly with record data", () => {
    render(<LeaveViewModal record={mockRecord} onClose={vi.fn()} />);
    
    // ✅ FIX: Query by real text instead of mock test IDs
    expect(screen.getByText(/Leave Details/i)).toBeInTheDocument();
    expect(screen.getByText("EMP-001")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Sick Leave")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); 
    expect(screen.getByText("Not feeling well")).toBeInTheDocument(); 
  });

  it("calls onClose when the close button is clicked", () => {
    const onCloseMock = vi.fn();
    render(<LeaveViewModal record={mockRecord} onClose={onCloseMock} />);
    
    fireEvent.click(screen.getByText("Close"));
    expect(onCloseMock).toHaveBeenCalled();
  });
});