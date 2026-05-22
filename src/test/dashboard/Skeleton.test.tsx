import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import {
    StatCardSkeleton,
    HolidaysCardSkeleton,
    TeamStatusSkeleton,
    MonthlyJoinersSkeleton,
    EmployeeInfoSkeleton,
    BirthdayAnniversaryCardSkeleton,
} from "../../components/dashboard/Skeleton";

describe("Dashboard Skeletons", () => {
    it("renders StatCardSkeleton without crashing", () => {
        const { container } = render(<StatCardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders HolidaysCardSkeleton without crashing", () => {
        const { container } = render(<HolidaysCardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders TeamStatusSkeleton without crashing", () => {
        const { container } = render(<TeamStatusSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders MonthlyJoinersSkeleton without crashing", () => {
        const { container } = render(<MonthlyJoinersSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders EmployeeInfoSkeleton without crashing", () => {
        const { container } = render(<EmployeeInfoSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });

    it("renders BirthdayAnniversaryCardSkeleton without crashing", () => {
        const { container } = render(<BirthdayAnniversaryCardSkeleton />);
        expect(container.firstChild).toBeInTheDocument();
    });
});