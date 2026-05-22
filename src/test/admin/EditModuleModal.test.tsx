import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EditModuleModal from "../../components/admin/access-rights/EditModuleModal";

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe("EditModuleModal", () => {
    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        availableModules: [
            { _id: "m1", id: "m1", code: "PR", name: "Payroll", type: "MODULE" as const, order: 1, children: [] }
        ],
        getSubmodulesForModule: [],
        editModuleSelectedModuleId: "",
        onModuleSelect: vi.fn(),
        editModuleSelectedSubmoduleId: "",
        onSubmoduleSelect: vi.fn(),
        editModuleNewSubmoduleName: "",
        onNewSubmoduleChange: vi.fn(),
        editModuleNewActionName: "",
        onNewActionChange: vi.fn(),
        onSave: vi.fn(),
        submitting: false,
        error: null,
        success: null,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders 'Edit Module Permissions' form by default", () => {
        render(<EditModuleModal {...defaultProps} />);
        expect(screen.getByText("Edit Module Permissions")).toBeInTheDocument();
        expect(screen.getByText("Select Module")).toBeInTheDocument();
    });

    it("renders 'Edit Module Name' form when editingNode is passed", () => {
        const mockNode = { id: "1", code: "OLD", name: "Old Name", type: "MODULE" as const, order: 1 };

        render(
            <EditModuleModal
                {...defaultProps}
                editingNode={mockNode}
                editModuleName="Old Name"
            />
        );

        expect(screen.getByText("Edit Module Name")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Old Name")).toBeInTheDocument();
    });
});