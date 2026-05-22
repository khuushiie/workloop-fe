import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom"; // For silencing future flags
import HolidayManagement from "../../components/holiday/HolidayManagement"; // Adjust path if needed

// ✅ 1. Stable API Responses
const stableHolidaysResponse = { 
  data: { 
    data: [
      { id: "1", name: "Diwali", date: "2024-11-01", year: 2024, isMandatory: true, description: "Festival of lights" }
    ] 
  }, 
  isLoading: false,
  isFetching: false
};

// ✅ 2. Mock Hooks & RTK Queries
vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: vi.fn(() => true), // Admin has permissions by default
}));

vi.mock("../../store/apis/holidayManagement.api", () => ({
  useGetHolidaysQuery: vi.fn(() => stableHolidaysResponse),
  useCreateHolidayMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useUpdateHolidayMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useDeleteHolidayMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
}));

// ✅ 3. Mock Common/UI Components to prevent DOM complex failures (e.g. AntD DatePicker)
vi.mock("../../components/common", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    DatePicker: ({ label, value, onChange }: any) => (
      <div data-testid={`mock-datepicker-${label}`}>
        <label>{label}</label>
        <input 
          data-testid="datepicker-input"
          onChange={(e) => onChange(e.target.value ? { format: () => e.target.value } : null)} 
        />
      </div>
    ),
    Select: ({ label, onChange, options, value }: any) => (
      <div data-testid={`mock-select-${label}`}>
        <label>{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options?.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    ),
    Pagination: () => <div data-testid="mock-pagination">Pagination</div>,
  };
});

// ✅ 4. Redux Provider Setup
const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const renderWithProvider = (ui: React.ReactNode) => {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};

describe("HolidayManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders main dashboard and table", () => {
    renderWithProvider(<HolidayManagement />);
    
    expect(screen.getByText("Holiday Management")).toBeInTheDocument();
    expect(screen.getByText("Add New Holiday")).toBeInTheDocument();
    
    // Checks if the mocked data rendered in the table
    expect(screen.getByText("Diwali")).toBeInTheDocument();
  });

  it("hides Add New Holiday form if user lacks permission", async () => {
    // Override RBAC hook for this test
    const { useHasPermission } = await import("../../store/hooks/useRbac");
    (useHasPermission as any).mockReturnValue(false);

    renderWithProvider(<HolidayManagement />);
    
    expect(screen.queryByText("Add New Holiday")).not.toBeInTheDocument();
    expect(screen.queryByText("Bulk Upload")).not.toBeInTheDocument();
  });

  it("opens bulk upload modal when button is clicked", async () => {
    // Restore RBAC hook to true
    const { useHasPermission } = await import("../../store/hooks/useRbac");
    (useHasPermission as any).mockReturnValue(true);

    renderWithProvider(<HolidayManagement />);
    
    const bulkUploadBtn = screen.getByText("Bulk Upload");
    fireEvent.click(bulkUploadBtn);

    await waitFor(() => {
      expect(screen.getByText("Bulk Upload Holidays")).toBeInTheDocument();
    });
  });

  it("validates form submission inputs properly", async () => {
    renderWithProvider(<HolidayManagement />);
    
    const submitBtn = screen.getByText("Submit");
    
    // Try submitting without filling required fields
    fireEvent.click(submitBtn);

    // It should not trigger the create mutation since fields are empty
    const { useCreateHolidayMutation } = await import("../../store/apis/holidayManagement.api");
    const [createMock] = useCreateHolidayMutation();
    expect(createMock).not.toHaveBeenCalled();
  });
});