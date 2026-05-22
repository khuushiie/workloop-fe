import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LeaveCredits from "../../components/leave/LeaveCredits";

// ✅ 1. STABLE REFERENCES (CRITICAL TO PREVENT MEMORY CRASH)
const stableTransactionsResponse = {
  data: { data: [{ id: "1", userName: "John Doe", leaveTypeName: "Sick Leave", days: 2 }], total: 1 },
  isLoading: false,
  isFetching: false,
};
const stableConfigResponse = { data: [{ id: "sick", displayName: "Sick Leave" }] };
const stableUsersResponse = { data: [{ id: "emp-1", fullName: "John Doe" }] };

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true),
}));

vi.mock("../../store/apis/leaveCredit.api", () => ({
  useGetLeaveTransactionsQuery: vi.fn(() => stableTransactionsResponse),
  useCreditLeaveMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDebitLeaveMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

// ✅ 2. Provide stable references here to stop useEffect loops
vi.mock("../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: vi.fn(() => stableConfigResponse),
}));

vi.mock("../../store/apis/user.api", () => ({
  useGetUsersForFilterQuery: vi.fn(() => stableUsersResponse),
}));

vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal<typeof import("antd")>();
  return {
    ...actual,
    Select: ({ onChange }: any) => (
      <select data-testid="mock-antd-select" onChange={(e) => onChange([e.target.value])}>
        <option value="emp-1">John Doe</option>
      </select>
    ),
  };
});

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe("LeaveCredits", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactNode) => render(<Provider store={mockStore}>{ui}</Provider>);

  it("renders the leave credits dashboard", () => {
    renderWithProvider(<LeaveCredits />);
    
    // Switch to Specific Headings
    expect(screen.getByRole("heading", { name: /Leave Balance/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Manage Balance/i })).toBeInTheDocument();
  });

  it("opens the Manage Balance modal when clicked", () => {
    renderWithProvider(<LeaveCredits />);
    
    const manageBtn = screen.getByRole("button", { name: /Manage Balance/i });
    fireEvent.click(manageBtn);
    
    expect(screen.getByRole("heading", { name: /Manage Leave Balance/i })).toBeInTheDocument();
    expect(screen.getByTestId("mock-antd-select")).toBeInTheDocument();
  });
});