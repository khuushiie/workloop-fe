import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ViewModeTabs from "../../../components/attendance/regularization-management/ViewModeTabs";
import { VIEW_MODE } from "../../../utils/constants";

describe("ViewModeTabs", () => {
    const mockSetViewMode = vi.fn();
    const mockSetPage = vi.fn();

    it("renders both tabs", () => {
        render(
            <ViewModeTabs
                viewMode={VIEW_MODE.ALL}
                setViewMode={mockSetViewMode}
                setPage={mockSetPage}
            />
        );
        expect(screen.getByText("All Employees")).toBeInTheDocument();
        expect(screen.getByText("My Reportees")).toBeInTheDocument();
    });

    it("calls setViewMode and setPage when clicking 'My Reportees'", () => {
        render(
            <ViewModeTabs
                viewMode={VIEW_MODE.ALL}
                setViewMode={mockSetViewMode}
                setPage={mockSetPage}
            />
        );

        const reporteesTab = screen.getByText("My Reportees");
        fireEvent.click(reporteesTab);

        expect(mockSetViewMode).toHaveBeenCalledWith(VIEW_MODE.REPORTEES);
        expect(mockSetPage).toHaveBeenCalledWith(1);
    });
});