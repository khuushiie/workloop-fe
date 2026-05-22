import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RecentJoinersCard from "../../components/dashboard/RecentJoinersCard";

// Mock the user API
const mockGetCelebrationsQuery = vi.fn();
vi.mock("../../store/apis/user.api", () => ({
    useGetCelebrationsQuery: () => mockGetCelebrationsQuery(),
}));

describe("RecentJoinersCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state correctly", () => {
        mockGetCelebrationsQuery.mockReturnValue({ data: null, isLoading: true });
        const { container } = render(<RecentJoinersCard />);

        expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders empty state when there are no recent joiners", () => {
        mockGetCelebrationsQuery.mockReturnValue({
            data: { monthJoiners: [] },
            isLoading: false,
        });

        render(<RecentJoinersCard />);

        expect(screen.getByText("No recent joiners")).toBeInTheDocument();
        expect(screen.getByText("0")).toBeInTheDocument(); // The badge count
    });

    it("renders populated list of recent joiners", () => {
        mockGetCelebrationsQuery.mockReturnValue({
            data: {
                monthJoiners: [
                    { name: "Alice Smith", workEmail: "alice@example.com", employeeId: "EMP001" },
                    { name: "Bob Jones", workEmail: "bob@example.com" }, // Testing without employeeId
                ],
            },
            isLoading: false,
        });

        render(<RecentJoinersCard />);

        // Verify badge count
        expect(screen.getByText("2")).toBeInTheDocument();

        // Verify first joiner
        expect(screen.getByText("Alice Smith")).toBeInTheDocument();
        expect(screen.getByText("ID: EMP001")).toBeInTheDocument();
        expect(screen.getByText("alice@example.com")).toBeInTheDocument();

        // Verify second joiner fallback text
        expect(screen.getByText("Bob Jones")).toBeInTheDocument();
        expect(screen.getByText("Employee")).toBeInTheDocument();
        expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });
});