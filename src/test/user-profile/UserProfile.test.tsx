import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UserProfile from "../../components/user-profile/UserProfile";

// ✅ 1. STABLE API RESPONSES
const mockUserData = {
  id: "user-1",
  employeeId: "EMP-001",
  firstName: "John",
  lastName: "Doe",
  workEmail: "john.doe@company.com",
  phone: "9876543210",
  departmentName: "Engineering",
  designationName: "Frontend Developer",
};

const mockRefetch = vi.fn().mockResolvedValue({ data: mockUserData });

const stableUserResponse = { data: mockUserData, isLoading: false, isFetching: false, isError: false, refetch: mockRefetch };
const loadingResponse = { data: null, isLoading: true, isFetching: true, isError: false, refetch: mockRefetch };
const errorResponse = { data: null, isLoading: false, isFetching: false, isError: true, error: { message: "API Error" }, refetch: mockRefetch };

// ✅ 2. MOCK HOOKS & REDUX
vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-redux")>();
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(() => vi.fn()),
  };
});

vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "user-1" } }))
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true) // Simulates having permission to edit
}));

vi.mock("../../store/hooks/useSignedUrl", () => ({
  useSignedUrl: vi.fn(() => "mock-signed-url.jpg")
}));

// ✅ 3. MOCK API SERVICES
const useGetUserByIdQueryMock = vi.fn(() => stableUserResponse);

vi.mock("../../store/apis/user.api", () => ({
  userApi: {
    util: {
      invalidateTags: vi.fn(() => ({ type: "TEST_INVALIDATE" })),
    },
  },
  useGetUserByIdQuery: (...args: any[]) => useGetUserByIdQueryMock(...args),
  useUpdateUserMutation: vi.fn(() => [vi.fn().mockResolvedValue({}), { isLoading: false }])
}));

vi.mock("../../store/apis/masterConfig.api", () => ({
  useGetMasterConfigByCategoryQuery: vi.fn(() => ({ data: [] }))
}));

vi.mock("../../store/apis/uploads.api", () => ({
  useUploadProfileImageMutation: vi.fn(() => [vi.fn()])
}));

// ✅ 4. MOCK CHILD COMPONENTS
// Prevent the giant form modal from throwing rendering errors by isolating it
vi.mock("../../components/employees/components/EmployeeFormModal", () => ({
  default: ({ isOpen, onClose }: any) => isOpen ? (
    <div data-testid="mock-employee-form-modal">
      <h2>Edit Profile Modal</h2>
      <button onClick={onClose}>Close Modal</button>
    </div>
  ) : null
}));

// ✅ 5. STORE SETUP
const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefetch.mockResolvedValue({ data: mockUserData });
    useGetUserByIdQueryMock.mockReturnValue(stableUserResponse);
  });

  it("renders the loading skeleton initially", () => {
    useGetUserByIdQueryMock.mockReturnValue(loadingResponse);
    renderWithProvider(<UserProfile />);
    
    // Check for the aria-busy attribute on the skeleton
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders error state when API fails", () => {
    useGetUserByIdQueryMock.mockReturnValue(errorResponse);
    renderWithProvider(<UserProfile />);
    
    expect(screen.getByText("API Error")).toBeInTheDocument();
  });

  it("renders user data successfully", () => {
    renderWithProvider(<UserProfile />);
    
    // Header
    expect(screen.getByRole("heading", { name: /My Profile/i })).toBeInTheDocument();
    
    // Name and Badges
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
    
    // Basic Info Details
    expect(screen.getByText("EMP-001")).toBeInTheDocument();
    expect(screen.getByText("john.doe@company.com")).toBeInTheDocument();
    expect(screen.getByText("+91 9876543210")).toBeInTheDocument();
  });

  it("opens the edit modal when Edit Info is clicked", async () => {
    renderWithProvider(<UserProfile />);
    
    const editBtn = screen.getByRole("button", { name: /Edit Info/i });
    fireEvent.click(editBtn);
    
    await waitFor(() => {
      expect(screen.getByTestId("mock-employee-form-modal")).toBeInTheDocument();
    });
  });

  it("hides Edit Info button if user lacks permissions", async () => {
    const { useHasPermission } = await import("../../store/hooks/useRbac");
    (useHasPermission as any).mockReturnValueOnce(false);

    renderWithProvider(<UserProfile />);
    
    expect(screen.queryByRole("button", { name: /Edit Info/i })).not.toBeInTheDocument();
  });
});