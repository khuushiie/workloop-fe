import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TabSelector from "../../components/admin/access-rights/AccessTabs";
// Import the hook we want to mock
import * as authHook from "../../store/hooks/useAuth";

// Tell Vitest to mock the entire file
vi.mock("../../store/hooks/useAuth");

describe("AccessTabs (TabSelector)", () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders all tabs including 'Module Management' for SuperAdmin", () => {
        // Force useAuth to return a SuperAdmin user
        vi.spyOn(authHook, "useAuth").mockReturnValue({
            user: { role: "SuperAdmin" },
        } as any);

        render(<TabSelector active="roles" onChange={mockOnChange} />);

        expect(screen.getByText("Setup Roles Permission")).toBeInTheDocument();
        expect(screen.getByText("Users")).toBeInTheDocument();
        expect(screen.getByText("Additional Users Permissions")).toBeInTheDocument();
        expect(screen.getByText("Module Management")).toBeInTheDocument(); // Should exist!
    });

    it("hides 'Module Management' for non-SuperAdmin users (e.g., HR)", () => {
        // Force useAuth to return an HR user
        vi.spyOn(authHook, "useAuth").mockReturnValue({
            user: { role: "HR" },
        } as any);

        render(<TabSelector active="roles" onChange={mockOnChange} />);

        expect(screen.getByText("Setup Roles Permission")).toBeInTheDocument();
        expect(screen.queryByText("Module Management")).not.toBeInTheDocument(); // Should be hidden!
    });

    it("calls onChange with the correct tab key when clicked", () => {
        vi.spyOn(authHook, "useAuth").mockReturnValue({ user: { role: "SuperAdmin" } } as any);
        render(<TabSelector active="roles" onChange={mockOnChange} />);

        const usersTab = screen.getByText("Users");
        fireEvent.click(usersTab);

        expect(mockOnChange).toHaveBeenCalledWith("users");
    });
});