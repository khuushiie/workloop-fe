import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import { RoleViewModal } from "../../components/admin/access-rights/RoleModals";

describe("RoleModals", () => {
    const mockOnClose = vi.fn();

    describe("RoleViewModal", () => {
        const mockRole = {
            id: "r1",
            name: "HR Manager",
            type: "HR" as const,
            description: "Manages HR tasks",
            permissions: [],
            isActive: true,
        };

        it("renders role details when viewRole is provided", () => {
            render(
                <RoleViewModal
                    isOpen={true}
                    loading={false}
                    viewRole={mockRole}
                    viewNodeIds={[]}
                    tree={[]}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByText("View Role: HR Manager")).toBeInTheDocument();
            expect(screen.getByText("Manages HR tasks")).toBeInTheDocument();
        });

        it("renders nothing inside if viewRole is null", () => {
            render(
                <RoleViewModal
                    isOpen={true}
                    loading={false}
                    viewRole={null}
                    viewNodeIds={[]}
                    tree={[]}
                    onClose={mockOnClose}
                />
            );
            // FIX: Matches the exact text rendered by your component!
            expect(screen.getByText("No role data available.")).toBeInTheDocument();
        });
    });
});