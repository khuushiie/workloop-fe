import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LeaveOverview from "../../components/leave/LeaveOverview";

const stableReportResponse = {
  data: {
    data: [
      {
        employeeId: "EMP-1",
        fullName: "John Doe",
        departmentName: "Engineering",
        totalBalance: 10,
      },
    ],
    total: 1,
  },
  isLoading: false,
  isError: false,
};

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true),
}));

// ✅ FIX: Properly mock RTK Query lazy trigger with `.unwrap()`
vi.mock("../../store/apis/leave.api", () => ({
  useGetLeaveBalanceReportQuery: vi.fn(() => stableReportResponse),
  useLazyGetLeaveBalanceReportDownloadQuery: vi.fn(() => [
    vi.fn(() => ({
      unwrap: () =>
        Promise.resolve(new Blob(["test csv"], { type: "text/csv" })),
    })),
    { isLoading: false },
  ]),
}));

vi.mock("../../components/common/FilterWrapper", () => ({
  default: ({ children }: any) => (
    <div data-testid="filter-wrapper">{children}</div>
  ),
}));

vi.mock("../../components/common", () => ({
  Table: () => <div data-testid="mock-table">Table</div>,
  Pagination: () => <div data-testid="mock-pagination">Pagination</div>,
  SearchInput: () => <input data-testid="mock-search" />,
  DepartmentFilter: () => <select data-testid="mock-dept-filter" />,
  Button: ({ onClick, "aria-label": ariaLabel }: any) => (
    <button onClick={onClick} aria-label={ariaLabel}>
      Download
    </button>
  ),
  SimpleTooltip: ({ children }: any) => <div>{children}</div>,
  OverflowTooltip: ({ text }: any) => <span>{text}</span>,
}));

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe("LeaveOverview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
  });

  const renderWithProvider = (ui: React.ReactNode) =>
    render(<Provider store={mockStore}>{ui}</Provider>);

  it("renders permission denied if user lacks access", async () => {
    const rbac = await import("../../store/hooks/useRbac");
    (rbac.useHasPermission as any).mockReturnValueOnce(false);

    renderWithProvider(<LeaveOverview />);
    expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument();
  });

  it("renders the overview dashboard when permitted", () => {
    renderWithProvider(<LeaveOverview />);
    expect(screen.getByText("Leave Overview")).toBeInTheDocument();
  });

  it("triggers CSV download when the download button is clicked", async () => {
    renderWithProvider(<LeaveOverview />);

    // ✅ FIX: specific role query
    const downloadBtn = screen.getByRole("button", { name: /Download/i });
    fireEvent.click(downloadBtn);

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });
});
