import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import GameBookingTable from "../../../components/employee-service/component/GameBookingTable";

// Mock the common UI components
vi.mock("../../../components/common/Table", () => ({
    default: () => <div data-testid="mock-table">Table</div>
}));
vi.mock("../../../components/common/Pagination", () => ({
    default: () => <div data-testid="mock-pagination">Pagination</div>
}));

describe("GameBookingTable", () => {
    const defaultProps = {
        title: "Upcoming Bookings",
        bookings: [],
        loading: false,
        onViewDetails: vi.fn(),
    };

    it("renders the title and table component", () => {
        render(<GameBookingTable {...defaultProps} />);

        expect(screen.getByText("Upcoming Bookings")).toBeInTheDocument();
        expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    });

    it("renders pagination when props are passed", () => {
        const paginationProps = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 5,
            onPageChange: vi.fn(),
            onItemsPerPageChange: vi.fn(),
        };

        render(<GameBookingTable {...defaultProps} pagination={paginationProps} />);

        expect(screen.getByTestId("mock-pagination")).toBeInTheDocument();
    });
});