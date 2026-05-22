import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import CompensatoryLeaveTable from "../../../components/employee-service/component/CompensatoryLeaveTable";

// Mock the common UI components to prevent DOM bloat
vi.mock("../../../components/common/Table", () => ({
    default: () => <div data-testid="mock-table">Table</div>
}));
vi.mock("../../../components/common/Pagination", () => ({
    default: () => <div data-testid="mock-pagination">Pagination</div>
}));

describe("CompensatoryLeaveTable", () => {
    const defaultProps = {
        title: "Test Comp-Off Table",
        requests: [],
        loading: false,
        onViewDetails: vi.fn(),
        onPullback: vi.fn(),
        canPullback: vi.fn(),
        getStatusLabel: vi.fn(),
        getStatusColor: vi.fn(),
        getStatusIcon: vi.fn(),
        formatDate: vi.fn(),
    };

    it("renders the table and the provided title", () => {
        render(<CompensatoryLeaveTable {...defaultProps} />);

        expect(screen.getByText("Test Comp-Off Table")).toBeInTheDocument();
        expect(screen.getByTestId("mock-table")).toBeInTheDocument();
    });

    it("renders pagination when items are present", () => {
        const paginationProps = {
            currentPage: 1,
            itemsPerPage: 10,
            totalItems: 15,
            onPageChange: vi.fn(),
        };

        render(<CompensatoryLeaveTable {...defaultProps} pagination={paginationProps} />);

        expect(screen.getByTestId("mock-pagination")).toBeInTheDocument();
    });
});