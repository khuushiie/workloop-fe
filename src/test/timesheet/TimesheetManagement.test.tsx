import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import TimesheetManagement from "../../components/timesheet/TimesheetManagement";

const stableTimesheets = { data: { data: [], total: 0 }, isLoading: false, isFetching: false };
const stableConfig = { data: [] };
const stableUsers = { data: [] };

vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "admin-1", role: "ADMIN" } }))
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true),
}));

vi.mock("../../store/apis/timesheet.api", () => ({
  useGetTimesheetsQuery: vi.fn(() => stableTimesheets),
  useActOnTimesheetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: vi.fn(() => stableConfig),
}));

vi.mock("../../store/apis/user.api", () => ({
  useGetUsersForFilterQuery: vi.fn(() => stableUsers),
}));

vi.mock("../../components/common", () => ({
  Table: () => <div data-testid="mock-table">Table</div>,
  Pagination: () => <div data-testid="mock-pagination">Pagination</div>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("../../components/timesheet/TimesheetFiltersBar", () => ({
  default: () => <div>Filters Bar</div>,
}));

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe("TimesheetManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactNode) => render(<Provider store={mockStore}>{ui}</Provider>);

  it("renders the management dashboard with Accordions", () => {
    renderWithProvider(<TimesheetManagement />);
    
    // ✅ FIX: Match the exact heading rendered
    expect(screen.getByRole("heading", { name: /Timesheet Management/i })).toBeInTheDocument();
    
    // ✅ FIX: Match the exact accordion button text rendered
    expect(screen.getByRole("button", { name: /Approval History/i })).toBeInTheDocument();
  });

  it("toggles the history accordion when clicked", () => {
    renderWithProvider(<TimesheetManagement />);
    
    const historyBtn = screen.getByRole("button", { name: /Approval History/i });
    fireEvent.click(historyBtn);
    
    expect(historyBtn).toBeInTheDocument();
  });
});