import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import TimesheetMain from "../../components/timesheet/TimesheetMain";

// Mock the complex management component to isolate this wrapper
vi.mock("../../components/timesheet/TimesheetManagement", () => ({
  default: () => <div data-testid="mock-timesheet-management">Management Component</div>,
}));

describe("TimesheetMain", () => {
  it("renders the TimesheetManagement component", () => {
    render(<TimesheetMain />);
    expect(screen.getByTestId("mock-timesheet-management")).toBeInTheDocument();
  });
});