import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import MyCalendar from "../../components/dashboard/MyCalendar";

// 1. Mock Auth and APIs
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "123" } }),
}));

const mockGetCalendarDataQuery = vi.fn();
vi.mock("../../store/apis/attendance.api", () => ({
    useGetCalendarDataQuery: () => mockGetCalendarDataQuery(),
}));

// 2. Mock Tooltip to keep DOM clean
vi.mock("../../components/attendance/AttendanceTooltip", () => ({
    default: ({ children }: any) => <div data-testid="mock-tooltip">{children}</div>,
}));

describe("MyCalendar", () => {
    beforeAll(() => {
        // Freeze time to May 15, 2024 to make tests deterministic
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2024, 4, 15)); // Month is 0-indexed in JS Dates
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders error state correctly", () => {
        mockGetCalendarDataQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
            error: { data: { message: "Calendar API Error" } },
        });

        render(<MyCalendar />);
        expect(screen.getByText("Calendar API Error")).toBeInTheDocument();
    });

    it("renders calendar grid and month navigation", () => {
        mockGetCalendarDataQuery.mockReturnValue({
            data: { data: { days: [], holidays: [] } },
            isLoading: false,
            isError: false,
        });

        render(<MyCalendar />);

        // Check Header Date (May 2024 based on fake timers)
        expect(screen.getByText("May 2024")).toBeInTheDocument();

        // Navigate to previous month
        fireEvent.click(screen.getByLabelText("Previous month"));
        expect(screen.getByText("Apr 2024")).toBeInTheDocument();

        // Navigate to next month (x2)
        fireEvent.click(screen.getByLabelText("Next month"));
        fireEvent.click(screen.getByLabelText("Next month"));
        expect(screen.getByText("Jun 2024")).toBeInTheDocument();
    });

    it("renders attendance status correctly", () => {
        mockGetCalendarDataQuery.mockReturnValue({
            data: {
                data: {
                    days: [
                        { day: 10, status: "P", date: "2024-05-10" },
                        { day: 11, isHoliday: true, holidayName: "Test Holiday", date: "2024-05-11" },
                    ],
                    holidays: [],
                },
            },
            isLoading: false,
            isError: false,
        });

        render(<MyCalendar />);

        // We mocked the tooltip, so we just check that the tooltips rendered for the days
        const tooltips = screen.getAllByTestId("mock-tooltip");
        expect(tooltips.length).toBeGreaterThan(0);

        // The status 'P' should be rendered inside the grid
        expect(screen.getByText("P")).toBeInTheDocument();
    });
});