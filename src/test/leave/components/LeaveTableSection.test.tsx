import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import LeaveTableSection from "../../../components/leave/components/LeaveTableSection";

describe("LeaveTableSection", () => {
  const defaultProps = {
    title: "My Leave History",
    requests: [],
    loading: false,
    onViewDetails: vi.fn(),
    onPullback: vi.fn(),
    canPullback: vi.fn(() => false),
    getLeaveTypeLabel: vi.fn(),
    getStatusLabel: vi.fn(),
    getStatusColor: vi.fn(),
    getStatusIcon: vi.fn(),
    formatDate: vi.fn(),
    pagination: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      onPageChange: vi.fn(),
    },
  };

  it("renders the title and table", () => {
    render(<LeaveTableSection {...defaultProps} />);
    expect(screen.getByRole("heading", { name: /My Leave History/i })).toBeInTheDocument();
    
    // ✅ FIX: Real DOM table query
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("displays the empty message when no requests are provided", () => {
    render(<LeaveTableSection {...defaultProps} />);
    expect(screen.getByText("No leave requests found")).toBeInTheDocument();
  });

  it("renders pagination only if totalItems > 0", () => {
    const { rerender } = render(<LeaveTableSection {...defaultProps} />);
    expect(screen.queryByText(/Rows per page/i)).not.toBeInTheDocument();

    rerender(
      <LeaveTableSection 
        {...defaultProps} 
        pagination={{ ...defaultProps.pagination, totalItems: 5 }} 
      />
    );
    
    // ✅ FIX: Real DOM text query for pagination
    expect(screen.getByText(/Rows per page/i)).toBeInTheDocument();
  });
});