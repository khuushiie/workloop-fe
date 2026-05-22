import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import EmployeeManagement from "../../components/employees/EmployeeManagement";

// ✅ 1. Stable API Responses to prevent infinite loops
const stableUsersResponse = { 
  data: { data: [], pagination: { total: 0 } }, 
  isLoading: false 
};
const stableStatsResponse = { 
  data: { totalEmployees: 10, activeEmployees: 8 }, 
  isLoading: false 
};

// ✅ 2. Mock Redux and API Hooks
vi.mock("../../store/apis/user.api", () => {
  // ✅ 1. Create stable references OUTSIDE the mock function
  const stableUsersResponse = { 
    data: { data: [], pagination: { total: 0 } }, 
    isLoading: false 
  };
  const stableStatsResponse = { 
    data: { totalEmployees: 10, activeEmployees: 8 }, 
    isLoading: false 
  };

  return {
    useGetStatsQuery: vi.fn(() => stableStatsResponse),
    // ✅ 2. Return the stable reference so it doesn't trigger infinite renders
    useGetUsersQuery: vi.fn(() => stableUsersResponse), 
    useGetUsersForFilterQuery: vi.fn(() => ({ data: [] })),
    useGetUserByIdQuery: vi.fn(() => ({ data: null, refetch: vi.fn(), isFetching: false })),
    useCreateUserMutation: vi.fn(() => [vi.fn()]),
    useUpdateUserMutation: vi.fn(() => [vi.fn()]),
    useDeleteUserMutation: vi.fn(() => [vi.fn()]),
  };
});

vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({
    user: { role: "ADMIN", organizationId: "org-1" },
  })),
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true), 
}));

vi.mock("../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: vi.fn(() => ({ data: [] })),
}));

vi.mock("../../store/apis/organization.api", () => ({
  useLazyGetOrganizationByIdQuery: vi.fn(() => [vi.fn().mockResolvedValue({})]),
  useRequestMoreUsersMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../store/apis/uploads.api", () => ({
  useUploadProfileImageMutation: vi.fn(() => [vi.fn()]),
}));

// ✅ 3. Mock Child Components
vi.mock("../../components/employees/components/EmployeeStatsCards", () => ({
  default: () => <div data-testid="stats-cards">Stats</div>,
}));

vi.mock("../../components/employees/components/EmployeeFilters", () => ({
  default: () => <div data-testid="employee-filters">Filters</div>,
}));

// FIX 1: Mock FilterWrapper so it doesn't hide our EmployeeFilters mock behind a collapse!
vi.mock("../../components/common/FilterWrapper", () => ({
  default: ({ children }: any) => <div data-testid="filter-wrapper">{children}</div>,
}));

vi.mock("../../components/employees/components/EmployeeTableSection", () => ({
  default: () => <div data-testid="employee-table">Table</div>,
}));

vi.mock("../../components/employees/components/EmployeeFormModal", () => ({
  default: ({ isOpen }: any) => isOpen ? <div data-testid="employee-form-modal">Form Modal</div> : null,
}));

// ✅ 4. Redux Provider Setup
const mockStore = configureStore({
  reducer: {
    auth: () => ({ user: { role: "ADMIN", organizationId: "org-1" } }),
    api: () => ({}), 
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe("EmployeeManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main components", () => {
    renderWithProvider(<EmployeeManagement />);

    expect(screen.getByText("Employee Management")).toBeInTheDocument();
    expect(screen.getByTestId("stats-cards")).toBeInTheDocument();
    expect(screen.getByTestId("employee-filters")).toBeInTheDocument(); // Will now be visible!
    expect(screen.getByTestId("employee-table")).toBeInTheDocument();
  });

  // FIX 2: Make the test async and use waitFor
  it("opens the Add Employee modal when button is clicked", async () => {
    renderWithProvider(<EmployeeManagement />);
    
    expect(screen.queryByTestId("employee-form-modal")).not.toBeInTheDocument();

    const addButton = screen.getByText("Add Employee");
    fireEvent.click(addButton);

    // Wait for the async state updates to finish
    await waitFor(() => {
      expect(screen.getByTestId("employee-form-modal")).toBeInTheDocument();
    });
  });
});