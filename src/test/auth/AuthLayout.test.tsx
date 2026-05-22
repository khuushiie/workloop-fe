import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import * as orgApi from "../../store/apis/organization.api";

// 1. Mock the Footer
vi.mock("../../components/common/Footer", () => ({
    default: () => <div data-testid="mock-footer">Mock Footer</div>,
}));

// 2. Mock RTK Query
vi.mock("../../store/apis/organization.api", () => ({
    useGetOrganizationByCodeQuery: vi.fn(),
}));

describe("AuthLayout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it("renders default organization details when API data is not present", () => {
        // Mock API returning no specific data
        vi.mocked(orgApi.useGetOrganizationByCodeQuery).mockReturnValue({
            data: undefined,
            isLoading: false,
        } as any);

        renderWithRouter(
            <AuthLayout>
                <div data-testid="child-content">Child Content</div>
            </AuthLayout>
        );

        // Verify defaults are rendered
        expect(screen.getByText("THE STACKMENTALIST")).toBeInTheDocument();
        expect(screen.getByText("Great Innovations Ahead")).toBeInTheDocument();
        expect(screen.getByText("Welcome to")).toBeInTheDocument();

        // Verify children and footer render
        expect(screen.getByTestId("child-content")).toBeInTheDocument();
        expect(screen.getByTestId("mock-footer")).toBeInTheDocument();
    });

    it("renders custom organization details when API returns data", () => {
        // Mock API returning custom org data
        vi.mocked(orgApi.useGetOrganizationByCodeQuery).mockReturnValue({
            data: {
                name: "Acme Corp",
                tagline: "Building the future",
                logo: "https://example.com/logo.png",
            },
            isLoading: false,
        } as any);

        renderWithRouter(
            <AuthLayout>
                <div>Content</div>
            </AuthLayout>
        );

        expect(screen.getByText("Acme Corp")).toBeInTheDocument();
        expect(screen.getByText("Building the future")).toBeInTheDocument();

        // Verify logo renders
        const logoImg = screen.getByAltText("Acme Corp");
        expect(logoImg).toBeInTheDocument();
        expect(logoImg).toHaveAttribute("src", "https://example.com/logo.png");
    });
});