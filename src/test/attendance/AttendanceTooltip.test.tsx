import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import AttendanceTooltip from "../../components/attendance/AttendanceTooltip";

// Mock the format utility to keep the test predictable
vi.mock("../../utils/convertToHourMinute", () => ({
    convertToHourMinute: (minutes: number) => `${minutes}m`,
    formatBreakHoursForDisplay: (hours: number) => `${hours}h`,
}));

describe("AttendanceTooltip", () => {
    const dummyRecord = {
        date: "2024-05-01",
        status: "present",
        checkInTime: "2024-05-01T09:00:00Z",
        checkOutTime: "2024-05-01T18:00:00Z",
        netWorkHours: 8,
        totalBreakHours: 1,
        notes: "Worked from office",
    };

    it("renders children correctly", () => {
        render(
            <AttendanceTooltip dayRecord={dummyRecord} status="present">
                <div data-testid="tooltip-trigger">Hover me</div>
            </AttendanceTooltip>
        );
        expect(screen.getByTestId("tooltip-trigger")).toBeInTheDocument();
    });

    it("shows tooltip content with formatted data on mouse enter", () => {
        render(
            <AttendanceTooltip dayRecord={dummyRecord} status="present">
                <div data-testid="tooltip-trigger">Hover me</div>
            </AttendanceTooltip>
        );

        const trigger = screen.getByTestId("tooltip-trigger");

        // Simulate hover
        fireEvent.mouseEnter(trigger);

        // Check if the detailed content appears
        expect(screen.getByText("Check In")).toBeInTheDocument();
        expect(screen.getByText("Check Out")).toBeInTheDocument();

        // Check if the notes render
        expect(screen.getByText("Worked from office")).toBeInTheDocument();
    });

    it("shows 'No attendance data' when dayRecord is missing", () => {
        render(
            <AttendanceTooltip dayRecord={undefined} status="absent">
                <div data-testid="tooltip-trigger">Hover me</div>
            </AttendanceTooltip>
        );

        fireEvent.mouseEnter(screen.getByTestId("tooltip-trigger"));
        expect(screen.getByText("No attendance data")).toBeInTheDocument();
    });
});