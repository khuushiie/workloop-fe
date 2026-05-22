import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminDashboard from "../../components/dashboard/AdminDashboard";

// 1. The Redux Safety Net
vi.mock("react-redux", () => ({
    useSelector: vi.fn(),
    useDispatch: () => vi.fn(),
}));

// 2. Mock Auth
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "123", role: "Admin" } }),
}));

// 3. Mock ALL RTK Query API Hooks
vi.mock("../../store/apis/user.api", () => ({
    useGetStatsQuery: () => ({ data: { totalEmployees: 150 }, isLoading: false }),
}));
vi.mock("../../store/apis/timesheet.api", () => ({
    useGetTimesheetStatsQuery: () => ({ data: { pending: 12, change: "+5%" }, isLoading: false }),
}));
vi.mock("../../store/apis/leave.api", () => ({
    useGetLeavesQuery: () => ({ data: { total: 8 }, isLoading: false }),
}));
vi.mock("../../store/apis/attendance.api", () => ({
    useGetTodayStatusQuery: () => ({ data: { data: { checkInTime: "09:00", checkOutTime: null } }, isLoading: false }),
}));
vi.mock("../../store/apis/attendanceRegularization.api", () => ({
    useGetRegularizationStatsQuery: () => ({ data: { pending: 4 }, isLoading: false }),
}));

// 4. Mock Skeletons
vi.mock("../../components/dashboard/Skeleton", () => ({
    StatCardSkeleton: () => <div data-testid="mock-stat-skeleton">Stat Loading...</div>,
    CalendarCardSkeleton: () => <div>Loading...</div>,
    TeamStatusSkeleton: () => <div>Loading...</div>,
    HolidaysCardSkeleton: () => <div>Loading...</div>,
    MonthlyJoinersSkeleton: () => <div>Loading...</div>,
    BirthdayAnniversaryCardSkeleton: () => <div>Loading...</div>,
}));

// 5. Mock Child Components
vi.mock("../../components/dashboard/MyCalendar", () => ({
    default: () => <div data-testid="mock-calendar">Calendar</div>,
    CalendarCardSkeleton: () => <div>Calendar Loading...</div>,
}));
vi.mock("../../components/dashboard/EmployeeCard", () => ({
    default: () => <div data-testid="mock-employee-card">Employee Card</div>,
}));
vi.mock("../../components/holiday/HolidayCard", () => ({
    default: () => <div data-testid="mock-holiday-card">Holiday Card</div>,
}));
vi.mock("../../components/dashboard/RecentJoinersCard", () => ({
    default: () => <div data-testid="mock-recent-joiners">Recent Joiners</div>,
}));
vi.mock("../../components/dashboard/BirthdayAnniversaryCard", () => ({
    default: () => <div data-testid="mock-birthday-card">Birthday Card</div>,
}));

describe("AdminDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders stat cards with correct data from mocked APIs", () => {
        render(<AdminDashboard />);

        // Check Total Employees
        expect(screen.getByText("Total Employees")).toBeInTheDocument();
        expect(screen.getByText("150")).toBeInTheDocument();

        // Check Pending Leaves
        expect(screen.getByText("Pending Leaves")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();

        // Check Pending Timesheets
        expect(screen.getByText("Pending Timesheets")).toBeInTheDocument();
        expect(screen.getByText("12")).toBeInTheDocument();

        // Check AR Pending
        expect(screen.getByText("AR Pending")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("renders all dashboard widget child components", () => {
        render(<AdminDashboard />);

        expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
        expect(screen.getByTestId("mock-employee-card")).toBeInTheDocument();
        expect(screen.getByTestId("mock-holiday-card")).toBeInTheDocument();
        expect(screen.getByTestId("mock-recent-joiners")).toBeInTheDocument();
        expect(screen.getByTestId("mock-birthday-card")).toBeInTheDocument();
    });
});