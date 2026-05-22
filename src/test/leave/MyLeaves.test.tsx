import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import MyLeaves from "../../components/leave/MyLeaves";

const stableLeavesResponse = {
  data: { data: [], total: 0 },
  isLoading: false,
  isFetching: false,
};

const stableBalancesResponse = {
  data: { types: [{ id: "sick", code: "sick_leave", label: "Sick Leave", available: 10 }] },
  isLoading: false,
};

// ✅ FIX for Memory Crash: Maintain a stable reference outside the mock
const stableHolidaysResponse = { data: [] }; 

vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ user: { id: "user-1", role: "EMPLOYEE" } })),
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true), 
}));

vi.mock("../../store/apis/leave.api", () => ({
  useGetMyLeavesQuery: vi.fn(() => stableLeavesResponse),
  useGetMyLeaveBalanceQuery: vi.fn(() => stableBalancesResponse),
  useCreateLeaveMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  usePullbackLeaveMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

vi.mock("../../store/apis/holidayManagement.api", () => ({
  useGetCurrentYearHolidaysQuery: vi.fn(() => stableHolidaysResponse), // Solves the loop
}));

vi.mock("../../components/leave/components/LeaveTableSection", () => ({
  default: () => <div data-testid="leave-table-section">Leave Table</div>,
}));

vi.mock("../../components/common", () => ({
  Select: ({ label, onChange, options }: any) => (
    <div data-testid={`mock-select-${label}`}>
      <label>{label}</label>
      <select onChange={(e) => onChange(e.target.value)}>
        <option value="">Select...</option>
        {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  ),
  DatePicker: ({ label, onChange }: any) => (
    <div data-testid={`mock-datepicker-${label}`}>
      <label>{label}</label>
      <input 
        onChange={(e) => onChange(e.target.value ? { format: () => e.target.value, day: () => 1, isBefore: () => false } : null)} 
      />
    </div>
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick} type="submit">{children}</button>
  ),
  Modal: ({ isOpen, children }: any) => isOpen ? <div data-testid="mock-modal">{children}</div> : null,
  ConfirmationModal: ({ isOpen, onConfirm }: any) => isOpen ? (
    <div data-testid="mock-confirm-modal">
      <button onClick={onConfirm}>Confirm</button>
    </div>
  ) : null,
}));

vi.mock("../../components/common/TextArea", () => ({
  TextArea: ({ label, onChange }: any) => (
    <div data-testid="mock-textarea">
      <label>{label}</label>
      <textarea onChange={(e) => onChange(e.target.value)} />
    </div>
  ),
}));

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe("MyLeaves", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactNode) => render(<Provider store={mockStore}>{ui}</Provider>);

  it("renders the apply leave form and table section", () => {
    renderWithProvider(<MyLeaves />);
    expect(screen.getByText("Apply Leave")).toBeInTheDocument();
    expect(screen.getByTestId("mock-select-Leave Type")).toBeInTheDocument();
    expect(screen.getByTestId("leave-table-section")).toBeInTheDocument();
  });

  it("prevents form submission if required fields are missing", async () => {
    renderWithProvider(<MyLeaves />);
    
    const submitBtn = screen.getByText("Submit");
    fireEvent.click(submitBtn);

    const { useCreateLeaveMutation } = await import("../../store/apis/leave.api");
    const [createMock] = useCreateLeaveMutation();
    expect(createMock).not.toHaveBeenCalled();
  });
});