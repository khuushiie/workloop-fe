import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import AddTimesheetModal from "../../components/timesheet/AddTimesheetModal";

vi.mock("../../store/apis/timesheet.api", () => ({
  useCreateTimesheetMutation: vi.fn(() => [vi.fn().mockResolvedValue({}), { isLoading: false }]),
  useUpdateTimesheetMutation: vi.fn(() => [vi.fn().mockResolvedValue({}), { isLoading: false }]),
}));

vi.mock("../../components/common", () => ({
  DatePicker: ({ onChange }: any) => (
    <input aria-label="Date" onChange={(e) => onChange(e.target.value ? { format: () => e.target.value } : null)} />
  ),
  Button: ({ children, onClick, htmlType }: any) => (
    <button type={htmlType || "button"} onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../../components/common/Input", () => ({
  default: ({ placeholder, onChange, value }: any) => (
    <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock("../../components/common/TextArea", () => ({
  TextArea: ({ placeholder, onChange, value }: any) => (
    <textarea placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

describe("AddTimesheetModal", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithProvider = (ui: React.ReactNode) => render(<Provider store={mockStore}>{ui}</Provider>);

  it("renders the modal in create mode", () => {
    renderWithProvider(<AddTimesheetModal {...defaultProps} />);
    
    // ✅ FIX: Use the exact heading rendered
    expect(screen.getByRole("heading", { name: /Add New Timesheet/i })).toBeInTheDocument();
    
    // ✅ FIX: Use the exact placeholder rendered
    expect(screen.getByPlaceholderText(/Enter project name/i)).toBeInTheDocument();
  });

  it("adds a new task row when 'Add Another Task' is clicked", () => {
    renderWithProvider(<AddTimesheetModal {...defaultProps} />);
    
    const initialInputs = screen.getAllByPlaceholderText(/Enter project name/i);
    expect(initialInputs.length).toBe(1);

    // ✅ FIX: Proper button query
    const addBtn = screen.getByRole("button", { name: /Add Another Task/i });
    fireEvent.click(addBtn);

    const newInputs = screen.getAllByPlaceholderText(/Enter project name/i);
    expect(newInputs.length).toBe(2);
  });
});