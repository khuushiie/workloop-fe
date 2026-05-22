import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AddModuleModal from "../../components/admin/access-rights/AddModuleModal"; // <-- UPDATE THIS PATH
import { describe, it, expect, vi, beforeEach } from "vitest";
describe("AddModuleModal", () => {
    // 1. Arrange: Create our fake data and functions
    const mockOnClose = vi.fn();
    const mockOnModuleNameChange = vi.fn();
    const mockOnCreateDefaultActionsChange = vi.fn();
    const mockOnSave = vi.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        moduleName: "",
        onModuleNameChange: mockOnModuleNameChange,
        createDefaultActions: false,
        onCreateDefaultActionsChange: mockOnCreateDefaultActionsChange,
        onSave: mockOnSave,
        submitting: false,
    };

    // Clear mock history before each test so they don't interfere with each other
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not render when isOpen is false", () => {
        // Act
        render(<AddModuleModal {...defaultProps} isOpen={false} />);

        // Assert: The modal title should not be in the document
        expect(screen.queryByText("Add Module")).not.toBeInTheDocument();
    });

    it("renders correctly when open", () => {
        render(<AddModuleModal {...defaultProps} />);

        // Assert modal title and input exist
        expect(screen.getByText("Add Module")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g. Payroll Management")).toBeInTheDocument();
    });

    it("calls onModuleNameChange when user types in the input", () => {
        render(<AddModuleModal {...defaultProps} />);

        const input = screen.getByPlaceholderText("e.g. Payroll Management");

        // Act: Simulate a user typing "New Module"
        fireEvent.change(input, { target: { value: "New Module" } });

        // Assert: Our mock function should have been called with "New Module"
        expect(mockOnModuleNameChange).toHaveBeenCalledWith("New Module");
    });

    it("calls onSave when the Create button is clicked", () => {
        render(<AddModuleModal {...defaultProps} />);

        const createButton = screen.getByRole("button", { name: /create/i });

        // Act
        fireEvent.click(createButton);

        // Assert
        expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it("disables inputs and buttons when submitting is true", () => {
        render(<AddModuleModal {...defaultProps} submitting={true} />);

        const input = screen.getByPlaceholderText("e.g. Payroll Management");
        const createButton = screen.getByRole("button", { name: /create/i });
        const cancelButton = screen.getByRole("button", { name: /cancel/i });

        // Assert everything is disabled so the user can't double-click
        expect(input).toBeDisabled();
        expect(createButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });
});