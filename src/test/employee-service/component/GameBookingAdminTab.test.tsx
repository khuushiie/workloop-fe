import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import GameBookingAdminTab from "../../../components/employee-service/component/GameBookingAdminTab";

// 1. Smart Redux Mock
vi.mock("react-redux", () => ({
  useSelector: vi.fn((fn) => {
    if (typeof fn === "function") {
      return fn({ auth: { user: { id: "123", role: "Admin" }, token: "mock", isAuthenticated: true } });
    }
    return {};
  }),
  useDispatch: () => vi.fn(),
}));

// 2. Mock APIs
vi.mock("../../../store/apis/gameBooking.api", () => ({
  useGetBookingListQuery: () => ({ data: { data: [], pagination: { totalItems: 0 } }, isLoading: false }),
  usePerformBookingActionMutation: () => [vi.fn(), { isLoading: false }]
}));
vi.mock("../../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: () => ({ data: [] })
}));

// 3. Mock Common UI
vi.mock("../../../components/common/FilterWrapper", () => ({
  default: ({ children }: any) => <div data-testid="mock-filter-wrapper">{children}</div>
}));
vi.mock("../../../components/common/Table", () => ({
  default: () => <div data-testid="mock-table">Table</div>
}));

describe("GameBookingAdminTab", () => {
  beforeEach(() => { 
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it("renders the layout with filters and table", () => {
    renderWithRouter(<GameBookingAdminTab />);
    
    // FIX: Updated to match the actual text rendered by your component!
    expect(screen.getByText(/Pending Booking Approvals/i)).toBeInTheDocument();
    
    expect(screen.getByTestId("mock-filter-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
  });
});