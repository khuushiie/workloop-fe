import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import {
    RoleFormCard,
    UserAssignmentCard,
    OverridesSidebar
} from "../../components/admin/access-rights/RoleCards";

// We mock the PermissionGate since it relies on Redux/Context we don't want to wire up here
vi.mock("../../components/common/PermissionGate", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("RoleCards components", () => {

    describe("RoleFormCard", () => {
        const defaultFormProps = {
            roleName: "",
            onRoleNameChange: vi.fn(),
            roleType: "" as any,
            roleTypeOptions: [{ label: "HR", value: "HR" }],
            onRoleTypeChange: vi.fn(),
            isActive: true,
            onStatusChange: vi.fn(),
            roleDesc: "",
            onRoleDescChange: vi.fn(),
            onSubmit: vi.fn(),
            saving: false,
        };

        it("renders create mode properly", () => {
            render(<RoleFormCard {...defaultFormProps} />);
            expect(screen.getByText("Create Role")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
        });

        it("renders edit mode properly with a cancel button", () => {
            const mockCancel = vi.fn();
            render(<RoleFormCard {...defaultFormProps} isEditing={true} onCancel={mockCancel} />);

            expect(screen.getByText("Update Role")).toBeInTheDocument();

            const cancelBtn = screen.getByRole("button", { name: /cancel/i });
            expect(cancelBtn).toBeInTheDocument();

            fireEvent.click(cancelBtn);
            expect(mockCancel).toHaveBeenCalledTimes(1);
        });
    });

    describe("UserAssignmentCard", () => {
        const defaultAssignProps = {
            userOptions: [{ label: "John Doe", value: "u1" }],
            roleOptions: [{ label: "Admin", value: "r1" }],
            selectedUserIds: [],
            selectedUserId: undefined,
            setSelectedUserid: vi.fn(),
            selectedRoleId: undefined,
            onUserChange: vi.fn(),
            onRoleChange: vi.fn(),
            onReset: vi.fn(),
            onAssign: vi.fn(),
            isBulkAssignLoading: false,
            canAssign: true,
            rolePrefillLoading: false,
        };

        it("renders properly and handles reset click", () => {
            render(<UserAssignmentCard {...defaultAssignProps} />);
            expect(screen.getByText("Role Assignment")).toBeInTheDocument();

            const resetBtn = screen.getByRole("button", { name: /reset/i });
            fireEvent.click(resetBtn);
            expect(defaultAssignProps.onReset).toHaveBeenCalledTimes(1);
        });

        it("shows loading state on assign button", () => {
            render(<UserAssignmentCard {...defaultAssignProps} isBulkAssignLoading={true} />);
            const btn = screen.getByRole("button", { name: /assigning.../i });
            expect(btn).toBeInTheDocument();
            // AntD uses pointer-events-none and ant-btn-loading to disable the button visually and functionally
            expect(btn).toHaveClass("!pointer-events-none");
        });
    });

    describe("OverridesSidebar", () => {
        const defaultOverrideProps = {
            userOptions: [{ label: "Jane Smith", value: "u2" }],
            selectedUserId: undefined,
            onUserChange: vi.fn(),
            onSubmit: vi.fn(),
            disableSubmit: false,
            overridesSaving: false,
        };

        it("renders text and handles submit", () => {
            render(<OverridesSidebar {...defaultOverrideProps} />);
            expect(screen.getByText("Additional Permissions")).toBeInTheDocument();

            const submitBtn = screen.getByRole("button", { name: /submit/i });
            fireEvent.click(submitBtn);
            expect(defaultOverrideProps.onSubmit).toHaveBeenCalledTimes(1);
        });
    });

});