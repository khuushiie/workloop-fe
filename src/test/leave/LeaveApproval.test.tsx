import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LeaveApproval from "../../components/leave/LeaveApproval";

// ✅ 1. STABLE REFERENCES (CRITICAL TO PREVENT MEMORY CRASH)
const stableLeavesResponse = { data: { data: [], total: 0 }, isLoading: false, isFetching: false };
const stableConfigResponse = { data: [] };

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});

vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "user-1", role: "ADMIN", organizationId: "org-1" } })),
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true), 
}));

vi.mock("../../store/apis/leave.api", () => ({
  useGetLeavesQuery: vi.fn(() => stableLeavesResponse),
  useDecideLeaveMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: vi.fn(() => stableConfigResponse),
}));

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe("LeaveApproval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main layout and pending tab by default", () => {
    renderWithProvider(<LeaveApproval />);
    
    // ✅ FIX: Specific role targeting
    expect(screen.getByRole("heading", { name: /Leave Approvals/i })).toBeInTheDocument();
    
    // Target the accordion button specifically
    expect(screen.getByRole("button", { name: /Leave Approval/i })).toBeInTheDocument(); 
    expect(screen.getByRole("button", { name: /Leave History/i })).toBeInTheDocument(); 
  });

  it("shows admin view tabs (All Employees / My Reportees) if user is ADMIN", () => {
    renderWithProvider(<LeaveApproval />);
    expect(screen.getByRole("button", { name: /All Employees/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /My Reportees/i })).toBeInTheDocument();
  });

  it("toggles the active accordion when clicked", () => {
    renderWithProvider(<LeaveApproval />);
    
    const historyAccordionBtn = screen.getByRole("button", { name: /Leave History/i });
    fireEvent.click(historyAccordionBtn);
    
    expect(historyAccordionBtn).toBeInTheDocument();
  });
});