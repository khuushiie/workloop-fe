import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "../../components/auth/Login";

// 1. Mock Auth hook
const mockLoginMutate = vi.fn();
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({
        login: {
            mutate: mockLoginMutate,
            isLoading: false,
            isError: false,
            error: null,
        },
    }),
}));

// 2. Mock API used by AuthLayout wrapper
vi.mock("../../store/apis/organization.api", () => ({
    useGetOrganizationByCodeQuery: () => ({ data: undefined, isLoading: false }),
}));

// 3. Mock Common UI
vi.mock("../../components/common", () => ({
    Button: ({ children, onClick, htmlType, disabled }: any) => (
        <button type={htmlType} onClick={onClick} disabled={disabled} data-testid="submit-btn">
            {children}
        </button>
    ),
}));

describe("Login", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it("renders the login form correctly", () => {
        renderWithRouter(<Login />);

        expect(screen.getByPlaceholderText("Enter your work email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your password")).toBeInTheDocument();
        expect(screen.getByTestId("submit-btn")).toBeInTheDocument();
    });

    it("toggles password visibility", () => {
        renderWithRouter(<Login />);

        const passwordInput = screen.getByPlaceholderText("Enter your password");
        const toggleBtn = screen.getByRole("button", { name: /show password/i });

        expect(passwordInput).toHaveAttribute("type", "password");

        // Click show
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute("type", "text");
    });

    it("calls login mutation with entered credentials", async () => {
        renderWithRouter(<Login />);

        const emailInput = screen.getByPlaceholderText("Enter your work email");
        const passwordInput = screen.getByPlaceholderText("Enter your password");
        const submitBtn = screen.getByTestId("submit-btn");

        fireEvent.change(emailInput, { target: { value: "john@example.com" } });
        fireEvent.change(passwordInput, { target: { value: "Password123!" } });

        fireEvent.click(submitBtn);

        expect(mockLoginMutate).toHaveBeenCalledWith(expect.objectContaining({
            workEmail: "john@example.com",
            password: "Password123!",
        }));
    });
});