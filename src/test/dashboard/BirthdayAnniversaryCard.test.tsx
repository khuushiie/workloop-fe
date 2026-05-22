import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BirthdayAnniversaryCard from "../../components/dashboard/BirthdayAnniversaryCard";

// Mock the user API
const mockGetCelebrationsQuery = vi.fn();
vi.mock("../../store/apis/user.api", () => ({
    useGetCelebrationsQuery: () => mockGetCelebrationsQuery(),
}));

describe("BirthdayAnniversaryCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders loading state correctly", () => {
        mockGetCelebrationsQuery.mockReturnValue({ data: null, isLoading: true });
        const { container } = render(<BirthdayAnniversaryCard />);
        // Check for the spinner
        expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("renders empty states for both tabs", () => {
        mockGetCelebrationsQuery.mockReturnValue({
            data: { birthdays: [], anniversaries: [] },
            isLoading: false,
        });

        render(<BirthdayAnniversaryCard />);

        expect(screen.getByText("Birthdays")).toBeInTheDocument();
        expect(screen.getByText("No birthdays today")).toBeInTheDocument();

        // Switch to Anniversaries
        fireEvent.click(screen.getByText("Anniversaries"));
        expect(screen.getByText("No anniversaries today")).toBeInTheDocument();
    });

    it("renders populated data and toggles correctly", () => {
        mockGetCelebrationsQuery.mockReturnValue({
            data: {
                birthdays: [{ name: "John Doe", workEmail: "john@example.com" }],
                anniversaries: [{ name: "Jane Smith", workEmail: "jane@example.com", yearsOfService: 5 }],
            },
            isLoading: false,
        });

        render(<BirthdayAnniversaryCard />);

        // Birthdays Tab is active by default
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();

        // Click Anniversaries Tab
        fireEvent.click(screen.getByText("Anniversaries"));

        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("5 Years")).toBeInTheDocument();
    });
});