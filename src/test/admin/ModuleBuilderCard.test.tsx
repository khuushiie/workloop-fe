import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ModuleBuilderCard from "../../components/admin/access-rights/ModuleBuilderCard";

describe("ModuleBuilderCard", () => {
    const defaultProps = {
        moduleName: "",
        onModuleNameChange: vi.fn(),
        submoduleName: "",
        onSubmoduleNameChange: vi.fn(),
        actionName: "",
        onActionNameChange: vi.fn(),
        generatedCodes: { moduleCode: "", submoduleCode: "", actionCode: "" },
        moduleError: null,
        moduleSuccess: null,
        onCreateModule: vi.fn(),
        moduleSubmitting: false,
        onOpenEditModule: vi.fn(),
        moduleSummary: { moduleCount: 5 },
        canManage: true,
    };

    it("renders correctly with module count", () => {
        render(<ModuleBuilderCard {...defaultProps} />);
        expect(screen.getByText("Manage Module")).toBeInTheDocument();
        expect(screen.getByText("5 modules")).toBeInTheDocument();
    });

    it("displays generated codes when they are provided", () => {
        render(
            <ModuleBuilderCard
                {...defaultProps}
                generatedCodes={{
                    moduleCode: "MOD_HR",
                    submoduleCode: "SUB_LEAVE",
                    actionCode: "ACT_VIEW",
                }}
            />
        );
        expect(screen.getByText("Generated Codes")).toBeInTheDocument();
        expect(screen.getByText("MOD_HR")).toBeInTheDocument();
        expect(screen.getByText("SUB_LEAVE")).toBeInTheDocument();
        expect(screen.getByText("ACT_VIEW")).toBeInTheDocument();
    });

    it("calls onCreateModule when Create button is clicked", () => {
        render(<ModuleBuilderCard {...defaultProps} />);
        const createBtn = screen.getByRole("button", { name: /create module/i });
        fireEvent.click(createBtn);
        expect(defaultProps.onCreateModule).toHaveBeenCalledTimes(1);
    });
});