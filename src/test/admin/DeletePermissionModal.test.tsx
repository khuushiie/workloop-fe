import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import DeletePermissionModal from "../../components/admin/access-rights/DeletePermissionModal";

describe("DeletePermissionModal", () => {
    const mockOnClose = vi.fn();
    const mockOnConfirm = vi.fn();

    // Exactly matching your IPermission interface from rbac.ts
    const mockModuleNode = {
        id: "1",
        code: "PAYROLL",
        name: "Payroll",
        type: "MODULE" as const,
        order: 1,
        children: [],
    };

    it("returns null and renders nothing if node is null", () => {
        const { container } = render(
            <DeletePermissionModal
                isOpen={true}
                onClose={mockOnClose}
                node={null}
                onConfirm={mockOnConfirm}
                submitting={false}
                error={null}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it("renders the correct warning message for a MODULE", () => {
        render(
            <DeletePermissionModal
                isOpen={true}
                onClose={mockOnClose}
                node={mockModuleNode}
                onConfirm={mockOnConfirm}
                submitting={false}
                error={null}
            />
        );
        expect(screen.getByText(/Are you sure you want to delete module "Payroll"\?/i)).toBeInTheDocument();
        expect(screen.getByText(/This will also delete all submodules/i)).toBeInTheDocument();
    });

    it("calls onConfirm when Delete button is clicked", () => {
        render(
            <DeletePermissionModal
                isOpen={true}
                onClose={mockOnClose}
                node={mockModuleNode}
                onConfirm={mockOnConfirm}
                submitting={false}
                error={null}
            />
        );

        const deleteBtn = screen.getByRole("button", { name: /delete/i });
        fireEvent.click(deleteBtn);
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
});