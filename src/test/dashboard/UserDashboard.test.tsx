import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import UserDashboard from "../../components/dashboard/UserDashboard";

// 1. Mock Hooks and Utils
let mockUser = { id: "user123", role: "Admin" };
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: mockUser }),
}));

vi.mock("../../store/hooks/useSignedUrl", () => ({
    useSignedUrl: () => "http://mock-profile-pic.com/img.jpg",
}));

// 2. Mock ALL RTK Query API Hooks
vi.mock("../../store/apis/user.api", () => ({
    useGetUserByIdQuery: () => ({
        data: {
            firstName: "John",
            lastName: "Doe",
            workEmail: "john.doe@example.com",
            departmentName: "Engineering",
            designationName: "Frontend Developer",
            employeeId: "EMP-101",
        },
        isLoading: false,
    }),
    useGetAdminDashboardStatsQuery: () => ({
        data: {
            leaveBalance: 12,
            timesheetHoursThisMonth: 150.5,
            leaveApproved: 3,
            pendingTimesheetRequests: 5,
        },
        isLoading: false,
    }),
}));

vi.mock("../../store/apis/attendance.api", () => ({
    useGetTodayStatusQuery: () => ({
        data: { data: { checkInTime: "09:00", checkOutTime: null } },
        isLoading: false,
    }),
}));

// 3. Mock Child Widget Components to isolate the Dashboard
vi.mock("../../components/dashboard/MyCalendar", () => ({
    default: () => <div data-testid="mock-calendar">MyCalendar</div>,
    CalendarCardSkeleton: () => <div>Calendar Loading...</div>,
}));
vi.mock("../../components/dashboard/EmployeeCard", () => ({
    default: () => <div data-testid="mock-employee-card">EmployeeCard</div>,
}));
vi.mock("../../components/holiday/HolidayCard", () => ({
    default: () => <div data-testid="mock-holiday-card">HolidayCard</div>,
}));
vi.mock("../../components/dashboard/RecentJoinersCard", () => ({
    default: () => <div data-testid="mock-recent-joiners">RecentJoiners</div>,
}));
vi.mock("../../components/dashboard/BirthdayAnniversaryCard", () => ({
    default: () => <div data-testid="mock-birthday-card">BirthdayCard</div>,
}));
vi.mock("../../components/dashboard/Skeleton", () => ({
    EmployeeInfoSkeleton: () => <div data-testid="mock-employee-skeleton">Loading Employee...</div>,
    TeamStatusSkeleton: () => <div>Loading...</div>,
    HolidaysCardSkeleton: () => <div>Loading...</div>,
    MonthlyJoinersSkeleton: () => <div>Loading...</div>,
    BirthdayAnniversaryCardSkeleton: () => <div>Loading...</div>,
}));

describe("UserDashboard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders admin/manager stats correctly when user is AdminLike", () => {
        mockUser = { id: "user123", role: "Admin" }; // Set to Admin
        render(<UserDashboard />);

        // Top Stats Bar should be present
        expect(screen.getByText("Leave Balance")).toBeInTheDocument();
        expect(screen.getByText("12 days")).toBeInTheDocument();

        expect(screen.getByText("Hours This Month")).toBeInTheDocument();
        expect(screen.getByText("150.50 hrs")).toBeInTheDocument();

        expect(screen.getByText("Approved Leaves")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();

        expect(screen.getByText("Pending Timesheet Requests")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("renders Employee Information card correctly when user is not Super Admin", () => {
        mockUser = { id: "user123", role: "Employee" }; // Set to Employee (not Super Admin)
        render(<UserDashboard />);

        // The Employee Info section should be rendered with our mocked data
        expect(screen.getByText("Employee Information")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("EMP-101")).toBeInTheDocument();
        expect(screen.getByText("Engineering")).toBeInTheDocument();
        expect(screen.getByText("Frontend Developer")).toBeInTheDocument();

        // The Top Stats Bar should NOT be present for standard employees
        expect(screen.queryByText("Leave Balance")).not.toBeInTheDocument();
    });

    it("does not render Employee Information card for Super Admin", () => {
        mockUser = { id: "user123", role: "SuperAdmin" }; // Set to Super Admin
        render(<UserDashboard />);

        // Super Admins shouldn't see their own basic employee info card
        expect(screen.queryByText("Employee Information")).not.toBeInTheDocument();
        // But they should see the Top Stats Bar
        expect(screen.getByText("Leave Balance")).toBeInTheDocument();
    });

    it("renders all the child dashboard widgets", () => {
        mockUser = { id: "user123", role: "Employee" };
        render(<UserDashboard />);

        expect(screen.getByTestId("mock-calendar")).toBeInTheDocument();
        expect(screen.getByTestId("mock-employee-card")).toBeInTheDocument();
        expect(screen.getByTestId("mock-holiday-card")).toBeInTheDocument();
        expect(screen.getByTestId("mock-recent-joiners")).toBeInTheDocument();
        expect(screen.getByTestId("mock-birthday-card")).toBeInTheDocument();
    });
});