import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";

// Mock the common UI components to isolate logic
vi.mock("../../components/common", () => ({
    Select: ({ onChange, value, label }: any) => (
        <div data-testid={`mock-select-${label || 'unlabeled'}`}>
            <select value={value || ""} onChange={(e) => onChange(e.target.value)}>
                <option value="val1">Option 1</option>
            </select>
        </div>
    ),
    DatePicker: ({ onChange }: any) => (
        <input
            data-testid="mock-datepicker"
            type="text" // FIXED: Changed to text so JSDOM doesn't block the change event
            onChange={(e) => {
                if (!e.target.value) {
                    onChange(null);
                    return;
                }
                // FIXED: Return a fake Dayjs object that returns proper numbers
                onChange({
                    format: (fmt: string) => {
                        if (fmt === "YYYY") return "2024";
                        if (fmt === "MM") return "05";
                        return "2024-05";
                    }
                });
            }}
        />
    ),
}));

vi.mock("../../components/common/SearchInput", () => ({
    default: ({ value, onChange }: any) => (
        <input
            data-testid="mock-search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

describe("AttendanceFilters", () => {
    const mockOnFilterChange = vi.fn();
    const mockOnEmployeeSearchChange = vi.fn();

    const defaultProps = {
        filters: {},
        onFilterChange: mockOnFilterChange,
        departments: [{ id: "d1", displayName: "Engineering" }],
        statuses: [{ id: "s1", displayName: "Present" }],
        isAdmin: false,
        employeeSearch: "",
        onEmployeeSearchChange: mockOnEmployeeSearchChange,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders only DatePicker for non-admin users", () => {
        render(<AttendanceFilters {...defaultProps} isAdmin={false} />);

        // Month picker should be present
        expect(screen.getByTestId("mock-datepicker")).toBeInTheDocument();

        // Admin fields should NOT be present
        expect(screen.queryByTestId("mock-search")).not.toBeInTheDocument();
        expect(screen.queryByTestId("mock-select-Department")).not.toBeInTheDocument();
    });

    it("renders all admin filters when isAdmin is true", () => {
        render(<AttendanceFilters {...defaultProps} isAdmin={true} />);

        expect(screen.getByTestId("mock-datepicker")).toBeInTheDocument();
        expect(screen.getByTestId("mock-search")).toBeInTheDocument();
        expect(screen.getByTestId("mock-select-Status")).toBeInTheDocument();
        expect(screen.getByTestId("mock-select-unlabeled")).toBeInTheDocument();
    });

    it("calls onEmployeeSearchChange when typing in search", () => {
        render(<AttendanceFilters {...defaultProps} isAdmin={true} />);

        const searchInput = screen.getByTestId("mock-search");
        fireEvent.change(searchInput, { target: { value: "Alice" } });

        expect(mockOnEmployeeSearchChange).toHaveBeenCalledWith("Alice");
    });

    it("calls onFilterChange when DatePicker changes", () => {
        render(<AttendanceFilters {...defaultProps} />);

        const dateInput = screen.getByTestId("mock-datepicker");

        // Simulate user typing in the fake date input
        fireEvent.change(dateInput, { target: { value: "2024-05" } });

        // Check that it fired correctly with numbers instead of NaN
        expect(mockOnFilterChange).toHaveBeenCalledWith("year", 2024);
        expect(mockOnFilterChange).toHaveBeenCalledWith("month", 5);
    });
});