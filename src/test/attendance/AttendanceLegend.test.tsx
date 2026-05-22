import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import AttendanceLegend from "../../components/attendance/AttendanceLegend";

describe("AttendanceLegend", () => {
    it("renders all legend items correctly", () => {
        render(<AttendanceLegend />);

        // Check Title
        expect(screen.getByText("Legends")).toBeInTheDocument();

        // Check Exact Statuses rendered by your component
        expect(screen.getByText("Present")).toBeInTheDocument();
        expect(screen.getByText("Absent")).toBeInTheDocument();
        expect(screen.getByText("Half Day")).toBeInTheDocument();
        expect(screen.getByText("Earned Leave")).toBeInTheDocument();
        expect(screen.getByText("Leave Without Pay")).toBeInTheDocument();
        expect(screen.getByText("Compensatory Leave")).toBeInTheDocument();

        // Check Warning/Break indicators
        expect(screen.getByText("Break Hours")).toBeInTheDocument();

        // FIX: Used a regex matcher to bypass the HTML escaped character (&lt;)
        expect(screen.getByText(/4h work/i)).toBeInTheDocument();

        // Check explanatory notes
        expect(screen.getByText(/Employees working less than 4 hours/i)).toBeInTheDocument();
    });
});