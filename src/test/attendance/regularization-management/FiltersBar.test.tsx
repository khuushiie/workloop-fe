import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FiltersBar from "../../../components/attendance/regularization-management/FiltersBar";

// 1. Mock the common UI components
vi.mock("../../../components/common", () => ({
    Button: ({ children, onClick }: any) => (
        <button onClick={onClick} data-testid="mock-clear-btn">
            {children}
        </button>
    ),
    SearchInput: ({ value, onChange, placeholder }: any) => (
        <input
            data-testid="mock-search"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
    // FIX: Removed the label prop dependency completely.
    Select: ({ onChange, value }: any) => (
        <select
            data-testid="mock-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="late_checkin">Late Check-in</option>
            <option value="test-val">Test Option</option>
        </select>
    ),
    DatePicker: ({ onChange }: any) => (
        <input
            data-testid="mock-datepicker"
            type="date"
            onChange={(e) => {
                const mockDayjs = e.target.value
                    ? { format: () => e.target.value }
                    : null;
                onChange(mockDayjs);
            }}
        />
    ),
}));

vi.mock("../../../components/common/FilterWrapper", () => ({
    default: ({ children }: any) => <div data-testid="filter-wrapper">{children}</div>,
}));

describe("FiltersBar", () => {
    const mockOnSearchChange = vi.fn();
    const mockOnFilterChange = vi.fn();
    const mockSetFilters = vi.fn();
    const mockSetPage = vi.fn();

    const defaultProps = {
        filters: {},
        regularizationTypeOptions: [{ value: "late_checkin", label: "Late Check-in" }],
        departments: [{ value: "dept-1", label: "Engineering" }],
        searchTerm: "",
        onSearchChange: mockOnSearchChange,
        onFilterChange: mockOnFilterChange,
        setFilters: mockSetFilters,
        setPage: mockSetPage,
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all filter inputs and the clear button", () => {
        render(<FiltersBar {...defaultProps} />);

        expect(screen.getByTestId("mock-search")).toBeInTheDocument();

        // FIX: Grab by the generic mock-select ID. Since there are 2 selects (Type & Dept), length is 2.
        expect(screen.getAllByTestId("mock-select")).toHaveLength(2);
        expect(screen.getAllByTestId("mock-datepicker")).toHaveLength(2); // Start & End date
        expect(screen.getByTestId("mock-clear-btn")).toBeInTheDocument();
    });

    it("calls onSearchChange when search input changes", () => {
        render(<FiltersBar {...defaultProps} />);

        const searchInput = screen.getByTestId("mock-search");
        fireEvent.change(searchInput, { target: { value: "John" } });

        expect(mockOnSearchChange).toHaveBeenCalledWith("John");
    });

    it("calls onFilterChange when a select dropdown changes", () => {
        render(<FiltersBar {...defaultProps} />);

        // FIX: Grab the first select (Regularization Type) out of the array of selects
        const typeSelect = screen.getAllByTestId("mock-select")[0];
        fireEvent.change(typeSelect, { target: { value: "late_checkin" } });

        expect(mockOnFilterChange).toHaveBeenCalledWith("regularizationType", "late_checkin");
    });

    it("resets filters and page when Clear Filters is clicked", () => {
        render(<FiltersBar {...defaultProps} />);

        const clearBtn = screen.getByTestId("mock-clear-btn");
        fireEvent.click(clearBtn);

        expect(mockSetFilters).toHaveBeenCalledWith({
            search: "",
            regularizationType: undefined,
            department: "",
            userId: "",
        });
        expect(mockSetPage).toHaveBeenCalledWith(1);
    });
});