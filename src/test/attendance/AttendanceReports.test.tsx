import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AttendanceReports from "../../components/attendance/AttendanceReports";

// 1. Mock Auth and RBAC
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { role: "HR", department: "HR" } }),
}));
vi.mock("../../store/hooks/useRbac", () => ({
    useHasPermission: () => true,
}));

// 2. Mock the index file exactly as it is imported
vi.mock("../../components/attendance/index", () => ({
    AttendanceFilters: () => <div data-testid="mock-filters">Filters</div>,
    AttendanceLegend: () => <div data-testid="mock-legend">Legend</div>,
    AttendanceTable: () => <div data-testid="mock-table">Table</div>,
    // FIX: Added `users: []` and `data: []` to prevent undefined .length crashes
    useAttendance: () => ({
        users: [],
        scopedUsers: [],
        data: [],
        holidays: [],
        loading: false,
        error: "Mock Error Banner",
        success: "Mock Success Banner",
        filters: {},
        handleFilterChange: vi.fn(),
        employeeSearch: "",
        setEmployeeSearch: vi.fn(),
        departments: [],
        statuses: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        handlePageChange: vi.fn(),
        handleItemsPerPageChange: vi.fn(),
        currentUserData: null,
        handleExport: vi.fn(),
        isDownloadingExcel: false,
    }),
}));

vi.mock("../../components/attendance/Skeleton", () => ({
    AttendanceTableSkeleton: () => <div data-testid="mock-skeleton">Loading Table...</div>,
}));

vi.mock("../../components/common/FilterWrapper", () => ({
    default: ({ children }: any) => <div data-testid="mock-filter-wrapper">{children}</div>,
}));

describe("AttendanceReports", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the layout, banners, and child components correctly", () => {
        render(<AttendanceReports />);

        // Verify the child components are placed correctly
        expect(screen.getByTestId("mock-filter-wrapper")).toBeInTheDocument();
        expect(screen.getByTestId("mock-filters")).toBeInTheDocument();
        expect(screen.getByTestId("mock-table")).toBeInTheDocument();
        expect(screen.getByTestId("mock-legend")).toBeInTheDocument();

        // Verify error and success banners render when hook returns them
        expect(screen.getByText("Mock Error Banner")).toBeInTheDocument();
        expect(screen.getByText("Mock Success Banner")).toBeInTheDocument();
    });
});