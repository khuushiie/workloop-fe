import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import PeopleHighlights from "../../components/dashboard/PeopleHighlights";

// Mock the child components
vi.mock("../../components/dashboard/RecentJoinersCard", () => ({
    default: () => <div data-testid="mock-recent-joiners">RecentJoinersCard</div>,
}));

vi.mock("../../components/dashboard/BirthdayAnniversaryCard", () => ({
    default: () => <div data-testid="mock-birthday-card">BirthdayAnniversaryCard</div>,
}));

describe("PeopleHighlights", () => {
    it("renders both highlight cards", () => {
        render(<PeopleHighlights />);

        expect(screen.getByTestId("mock-recent-joiners")).toBeInTheDocument();
        expect(screen.getByTestId("mock-birthday-card")).toBeInTheDocument();
    });
});