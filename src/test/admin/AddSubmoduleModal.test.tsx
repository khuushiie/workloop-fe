import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AddSubmoduleModal from "../../components/admin/access-rights/AddSubmoduleModal";

describe("AddSubmoduleModal", () => {
    const mockOnClose = vi.fn();
    const mockOnSubmoduleNameChange = vi.fn();
    const mockOnSave = vi.fn();

    const defaultProps = {
        isOpen: true,
        onClose: mockOnClose,
        submoduleName: "",
        onSubmoduleNameChange: mockOnSubmoduleNameChange,
        moduleName: "Core HR", // Fake parent module
        onSave: mockOnSave,
        submitting: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders parent module name in a disabled input", () => {
        render(<AddSubmoduleModal {...defaultProps} />);
        const parentInput = screen.getByDisplayValue("Core HR");
        expect(parentInput).toBeDisabled();
    });

    it("calls onSubmoduleNameChange when typing", () => {
        render(<AddSubmoduleModal {...defaultProps} />);
        const input = screen.getByPlaceholderText("e.g. Export Reports");
        fireEvent.change(input, { target: { value: "Leaves" } });
        expect(mockOnSubmoduleNameChange).toHaveBeenCalledWith("Leaves");
    });
});