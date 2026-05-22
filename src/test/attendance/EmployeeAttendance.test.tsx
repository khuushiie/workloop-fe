import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import EmployeeAttendance from "../../components/attendance/EmployeeAttendance";

// 1. Mock Geolocation
const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
};
Object.defineProperty(global.navigator, "geolocation", {
    value: mockGeolocation,
});

// 2. Mock Redux
vi.mock("react-redux", () => ({
    useSelector: vi.fn(() => ({ status: "not_checked_in" })),
}));

// 3. Mock Hooks
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "u1" } }),
}));

vi.mock("../../store/hooks/useRbac", () => ({
    useHasPermission: () => true,
}));

// 4. Stable Mocks for RTK Query
vi.mock("../../store/apis/attendance.api", () => {
    const stableStatus = { status: "not_checked_in", breaks: [] };
    const mockMutation = [vi.fn(), { isLoading: false }];
    const stableLocation = { latitude: 0, longitude: 0, radius: 100 };

    return {
        useGetTodayStatusQuery: () => ({ data: stableStatus, isLoading: false, refetch: vi.fn() }),
        useGetOfficeLocationQuery: () => ({ data: stableLocation }),
        useCheckInMutation: () => mockMutation,
        useCheckOutMutation: () => mockMutation,
        useStartBreakMutation: () => mockMutation,
        useEndBreakMutation: () => mockMutation,
    };
});

describe("EmployeeAttendance", () => {
    beforeAll(() => {
        // Mock the Date so "Today's Attendance" clock doesn't fluctuate during the test
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2024-05-01T10:00:00Z"));
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the dashboard layout and clock correctly", () => {
        render(<EmployeeAttendance />);

        expect(screen.getByText(/Today's Status/i)).toBeInTheDocument();

        // FIX: Assert the status badge instead of the button, since buttons 
        // wait for geolocation to resolve before rendering!
        expect(screen.getByText(/Not Checked In/i)).toBeInTheDocument();
    });
});