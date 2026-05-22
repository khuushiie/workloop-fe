import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import EmployeeFormModal from "../../../components/employees/components/EmployeeFormModal";

// ✅ Correct Path: Go up 3 levels (../../../) to hit 'src', then into 'store'
vi.mock("../../../store/hooks/useSignedUrl", () => ({
  useSignedUrl: () => "mock-signed-url",
}));

// ✅ Bulletproof Redux Mock
vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});

vi.mock("../../../store/hooks", () => ({
  useAppSelector: vi.fn(() => ({
    user: { role: "ADMIN", organizationId: "org-1" },
  })),
}));

vi.mock("../../../store/apis/organization.api", () => ({
  useGetOrganizationsFilterQuery: vi.fn(() => ({ data: null })),
  useLazyGetOrgDetailsQuery: vi.fn(() => [vi.fn().mockResolvedValue({})]),
}));

vi.mock("../../../store/apis/rbac.api", () => ({
  useLazyListRolesQuery: vi.fn(() => [
    vi.fn().mockResolvedValue([{ id: "1", name: "Role 1" }]),
    { isFetching: false },
  ]),
}));

vi.mock("../../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryForOrgQuery: vi.fn(() => ({ data: [], isLoading: false })),
}));

vi.mock("../../../store/apis/user.api", () => ({
  useGetUsersForFilterQuery: vi.fn(() => ({ data: [] })),
}));

// ✅ Corrected Paths for Child Components
vi.mock("../../../components/employees/components/employee-form/BasicInfoSection", () => ({
  default: () => <div data-testid="basic-info-section">Basic Info</div>,
}));
vi.mock("../../../components/employees/components/employee-form/WorkInfoSection", () => ({
  default: () => <div data-testid="work-info-section">Work Info</div>,
}));
vi.mock("../../../components/employees/components/employee-form/AddressSection", () => ({
  default: () => <div data-testid="address-section">Address Info</div>,
}));
vi.mock("../../../components/employees/components/employee-form/EmergencyContactSection", () => ({
  default: () => <div data-testid="emergency-section">Emergency Info</div>,
}));
vi.mock("../../../components/employees/components/employee-form/BankDetailsSection", () => ({
  default: () => <div data-testid="bank-section">Bank Info</div>,
}));
vi.mock("../../../components/employees/components/employee-form/EmploymentHistorySection", () => ({
  default: () => <div data-testid="employment-section">Employment Info</div>,
}));
vi.mock("../../../components/employees/components/employee-form/EducationSection", () => ({
  default: () => <div data-testid="education-section">Education Info</div>,
}));

// ✅ Helper to wrap Redux Provider
const mockStore = configureStore({
  reducer: {
    auth: () => ({ user: { role: "ADMIN", organizationId: "org-1" } }),
    api: () => ({}), // Dummy API reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe("EmployeeFormModal", () => {
  const defaultProps = {
    isOpen: true,
    mode: "create" as const,
    initialValues: {},
    employees: [],
    departmentOptions: [],
    positionOptions: [],
    employmentTypeOptions: [],
    disciplineOptions: [],
    relationshipOptions: [],
    statusOptions: [],
    genderOptions: [],
    isSubmitting: false,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly in create mode", () => {
    renderWithProvider(<EmployeeFormModal {...defaultProps} />);
    
    expect(screen.getByText("Add New Employee")).toBeInTheDocument();
    expect(screen.getByTestId("basic-info-section")).toBeInTheDocument();
    expect(screen.getByTestId("work-info-section")).toBeInTheDocument();
  });

  it("renders correctly in edit mode", () => {
    renderWithProvider(<EmployeeFormModal {...defaultProps} mode="edit" />);
    
    expect(screen.getByText("Edit Employee")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    renderWithProvider(<EmployeeFormModal {...defaultProps} />);
    
    // Grab the exact button to avoid ambiguity
    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);
    
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});