import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import PermissionTree from "../../components/admin/access-rights/PermissionTree";

describe("PermissionTree", () => {
    // Create a realistic mini-tree matching your IPermission type
    const mockTree: any[] = [
        {
            id: "module-1",
            code: "CORE_HR",
            name: "Core HR",
            type: "MODULE",
            order: 1,
            children: [
                {
                    id: "sub-1",
                    code: "EMPLOYEE_DIR",
                    name: "Employee Directory",
                    type: "SUBMODULE",
                    order: 1,
                    children: [],
                },
            ],
        },
    ];

    const defaultProps = {
        tree: mockTree,
        value: [], // No permissions selected initially
        onChange: vi.fn(),
    };

    it("renders the root module and its children", () => {
        render(<PermissionTree {...defaultProps} />);

        expect(screen.getByText("Core HR")).toBeInTheDocument();
        expect(screen.getByText("Employee Directory")).toBeInTheDocument();
    });

    it("shows checkboxes as checked if their ID is in the value array", () => {
        // Pass "sub-1" as an already selected value
        render(<PermissionTree {...defaultProps} value={["sub-1"]} />);

        // Find the checkbox by its label text
        const employeeDirCheckbox = screen.getByLabelText("Employee Directory");
        expect(employeeDirCheckbox).toBeChecked();
    });

    it("calls onChange when a checkbox is toggled", () => {
        const mockOnChange = vi.fn();
        render(<PermissionTree {...defaultProps} onChange={mockOnChange} />);

        const coreHrCheckbox = screen.getByLabelText("Core HR");

        // Simulate user clicking the "Core HR" checkbox
        fireEvent.click(coreHrCheckbox);

        // Because selecting a parent selects its children in your logic,
        // onChange should be called with an array containing the IDs.
        expect(mockOnChange).toHaveBeenCalled();
    });

    it("disables the entire tree if the disabled prop is true", () => {
        render(<PermissionTree {...defaultProps} disabled={true} />);

        const coreHrCheckbox = screen.getByLabelText("Core HR");
        const employeeDirCheckbox = screen.getByLabelText("Employee Directory");

        expect(coreHrCheckbox).toBeDisabled();
        expect(employeeDirCheckbox).toBeDisabled();
    });

    it("disables specific nodes if they are in the lockedIds set", () => {
        const lockedSet = new Set(["sub-1"]);
        render(<PermissionTree {...defaultProps} lockedIds={lockedSet} />);

        const coreHrCheckbox = screen.getByLabelText("Core HR");
        const employeeDirCheckbox = screen.getByLabelText("Employee Directory");

        expect(coreHrCheckbox).not.toBeDisabled();
        expect(employeeDirCheckbox).toBeDisabled(); // Only this one should be locked
    });
});