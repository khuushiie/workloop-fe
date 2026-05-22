import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeeCard from "../../components/dashboard/EmployeeCard";

// Mock the user API
const mockGetActiveUsersStatusQuery = vi.fn();
vi.mock("../../store/apis/user.api", () => ({
    useGetActiveUsersStatusQuery: () => mockGetActiveUsersStatusQuery(),
}));

describe("EmployeeCard", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders error state correctly", () => {
        mockGetActiveUsersStatusQuery.mockReturnValue({
            data: null,
            isLoading: false,
            isError: true,
            error: { data: { message: "API Error" } },
        });

        render(<EmployeeCard />);
        expect(screen.getByText("API Error")).toBeInTheDocument();
    });

    it("renders employee counts and list correctly", () => {
        mockGetActiveUsersStatusQuery.mockReturnValue({
            data: {
                users: [
                    { userId: "1", name: "Alice", status: "checked_in", employeeId: "EMP01" },
                    { userId: "2", name: "Bob", status: "on_break", employeeId: "EMP02" },
                ],
                counts: { checked_in: 1, on_break: 1, not_checked_in: 0, checked_out: 0 },
            },
            isLoading: false,
            isError: false,
        });

        render(<EmployeeCard />);

        // Verify Counts (1 Online, 1 On Break, 0 Offline)
        expect(screen.getByText("1", { selector: "span.text-green-600" })).toBeInTheDocument();
        expect(screen.getByText("1", { selector: "span.text-orange-600" })).toBeInTheDocument();

        // Verify Employee List
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
    });

    it("filters employees based on search query", () => {
        mockGetActiveUsersStatusQuery.mockReturnValue({
            data: {
                users: [
                    { userId: "1", name: "Alice", status: "checked_in", employeeId: "EMP01" },
                    { userId: "2", name: "Bob", status: "not_checked_in", employeeId: "EMP02" },
                ],
                counts: { checked_in: 1, on_break: 0, not_checked_in: 1, checked_out: 0 },
            },
            isLoading: false,
            isError: false,
        });

        render(<EmployeeCard />);

        // Click search icon to open input
        const searchBtn = screen.getByRole("button", { name: /Toggle team search/i });
        fireEvent.mouseDown(searchBtn); // The component uses onMouseDown

        // Type in search
        const searchInput = screen.getByPlaceholderText("Search by name");
        fireEvent.change(searchInput, { target: { value: "Alice" } });

        // Alice should be visible, Bob should be hidden
        expect(screen.getByText("Alice")).toBeInTheDocument();
        expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });
});