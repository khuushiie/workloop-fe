import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import TabSelector from "../../../components/employee-service/component/TabSelector";

describe("TabSelector", () => {
    const mockTabs = [
        { k: "comp-off", label: "Compensatory Off" },
        { k: "game-booking", label: "Game Booking" },
    ] as any;

    const mockOnChange = vi.fn();

    it("renders all provided tabs", () => {
        render(<TabSelector tabs={mockTabs} active="comp-off" onChange={mockOnChange} />);

        expect(screen.getByText("Compensatory Off")).toBeInTheDocument();
        expect(screen.getByText("Game Booking")).toBeInTheDocument();
    });

    it("applies the active styling to the currently selected tab", () => {
        render(<TabSelector tabs={mockTabs} active="comp-off" onChange={mockOnChange} />);

        const activeTab = screen.getByText("Compensatory Off");
        expect(activeTab).toHaveClass("bg-primary-600");
        expect(activeTab).toHaveClass("text-white");
    });

    it("calls the onChange handler with the correct key when clicked", () => {
        render(<TabSelector tabs={mockTabs} active="comp-off" onChange={mockOnChange} />);

        const gameTab = screen.getByText("Game Booking");
        fireEvent.click(gameTab);

        expect(mockOnChange).toHaveBeenCalledWith("game-booking");
    });
});