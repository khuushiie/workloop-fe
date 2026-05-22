import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import UserRoleTableSection from "../../components/admin/access-rights/UserRoleTableSection";

describe("UserRoleTableSection", () => {
    const mockOnPageChange = vi.fn();
    const mockOnItemsPerPageChange = vi.fn();
    const mockOnEditUser = vi.fn();

    const mockUsers = [
        {
            id: "u1",
            name: "John Doe",
            workEmail: "john@example.com",
            role: "Admin",
            department: "Engineering",
        },
    ];

    const defaultProps = {
        users: mockUsers,
        loading: false,
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 1,
        onPageChange: mockOnPageChange,
        onItemsPerPageChange: mockOnItemsPerPageChange,
        onEditUser: mockOnEditUser,
    };

    it("renders the user table correctly", () => {
        render(<UserRoleTableSection {...defaultProps} />);

        expect(screen.getByText("Users (1)")).toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("shows an empty message when no users are provided", () => {
        render(<UserRoleTableSection {...defaultProps} users={[]} totalItems={0} />);

        expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    it("calls onEditUser when the edit button is clicked", () => {
        render(<UserRoleTableSection {...defaultProps} />);

        // In your component, the edit button has an aria-label="Edit"
        const editBtn = screen.getByRole("button", { name: /edit/i });
        fireEvent.click(editBtn);

        expect(mockOnEditUser).toHaveBeenCalledWith(mockUsers[0]);
    });
});