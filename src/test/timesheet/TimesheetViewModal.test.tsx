import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import TimesheetViewModal from "../../components/timesheet/TimesheetViewModal";

vi.mock("../../components/common/Modal", () => ({
  default: ({ children }: any) => <div data-testid="mock-modal">{children}</div>,
}));

vi.mock("../../components/common/Table", () => ({
  default: () => <div data-testid="mock-table">Task Breakdown Table</div>,
}));

describe("TimesheetViewModal", () => {
  const mockTimesheet = {
    id: "ts-1",
    date: "2024-03-20T00:00:00.000Z",
    status: "approved",
    statusLabel: "Approved",
    totalHours: 8,
    tasks: [],
    userName: "Jane Doe"
  };

  it("does not render timesheet content when timesheet is null", () => {
    render(<TimesheetViewModal timesheet={null} onClose={vi.fn()} />);

    expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
    expect(screen.queryByText(/Name/i)).not.toBeInTheDocument();
  });

  it("renders correctly with timesheet data", () => {
    render(<TimesheetViewModal timesheet={mockTimesheet as any} onClose={vi.fn()} />);

    expect(screen.getByTestId("mock-modal")).toBeInTheDocument();

    expect(screen.getByText(/Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Date/i)).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();

    // ❌ REMOVED fragile 8.00 check as requested

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
  });
});