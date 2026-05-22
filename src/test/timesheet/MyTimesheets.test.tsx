import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import MyTimesheets from "../../components/timesheet/MyTimesheets";

const stableTimesheets = { data: { data: [], total: 0 }, isLoading: false, isFetching: false, isError: false };
const stableStats = { data: { totalHours: 40, pendingTimesheets: 2, approvedTimesheets: 5 }, isLoading: false, isFetching: false, isError: false };

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return { ...actual, useSelector: vi.fn(), useDispatch: vi.fn(() => vi.fn()) };
});

vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "user-1", role: "EMPLOYEE" } }))
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true),
}));

vi.mock("../../store/apis/timesheet.api", () => ({
  useGetMyTimesheetsQuery: vi.fn(() => stableTimesheets),
  useGetTimesheetStatsQuery: vi.fn(() => stableStats),
  useDeleteTimesheetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useSubmitTimesheetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useCreateTimesheetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateTimesheetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../components/common/FilterWrapper", () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../../components/timesheet/TimesheetFiltersBar", () => ({
  default: () => <div data-testid="mock-filters-bar">Filters</div>,
}));

// ✅ FIX: Use importOriginal to preserve DatePicker, Modal, and other common exports
vi.mock("../../components/common", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Table: () => <div data-testid="mock-table">Table</div>,
    Pagination: () => <div data-testid="mock-pagination">Pagination</div>,
    Button: ({ children, onClick }: any) => (
      <button onClick={onClick}>{children}</button>
    ),
    DatePicker: () => <input data-testid="mock-datepicker" aria-label="Date Picker" />,
  };
});

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe("MyTimesheets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactNode) => render(<Provider store={mockStore}>{ui}</Provider>);

  it("renders the stats and timesheet layout", () => {
    renderWithProvider(<MyTimesheets />);

    expect(screen.getByRole("heading", { name: /My Timesheets/i })).toBeInTheDocument();
    expect(screen.getByText(/40\.00/i)).toBeInTheDocument();

    // ✅ FIX: Test the real UI text since the table component path didn't hit our mock
    expect(screen.getByText(/No timesheets found/i)).toBeInTheDocument();
  });

  it("opens the Add Timesheet modal when button is clicked", async () => {
    renderWithProvider(<MyTimesheets />);

    const addBtn = screen.getByRole("button", { name: /Add Timesheet/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText(/Reset/i)).toBeInTheDocument();
    });
  });
});