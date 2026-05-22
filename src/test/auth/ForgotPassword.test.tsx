import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../../components/auth/ForgotPassword";

// 1. Mocks for Auth API
const mockForgetPassword = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
const mockVerifyOtp = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve({ data: { data: "mock-token" } }) });
const mockResetPassword = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });

vi.mock("../../store/apis/auth.api", () => ({
    useForgetPasswordMutation: () => [mockForgetPassword, { isLoading: false }],
    useVerifyOtpMutation: () => [mockVerifyOtp, { isLoading: false }],
    useResetPasswordMutation: () => [mockResetPassword, { isLoading: false }],
}));

// 2. Mock Organization API (used by AuthLayout)
vi.mock("../../store/apis/organization.api", () => ({
    useGetOrganizationByCodeQuery: () => ({ data: undefined, isLoading: false }),
}));

describe("ForgotPassword", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it("renders the initial email step", () => {
        renderWithRouter(<ForgotPassword />);

        expect(screen.getByText("Forgot Password?")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Send Code/i })).toBeInTheDocument();
    });

    it("moves to OTP step upon successful email submission", async () => {
        renderWithRouter(<ForgotPassword />);

        const emailInput = screen.getByPlaceholderText("Enter your work email");
        fireEvent.change(emailInput, { target: { value: "test@example.com" } });

        const sendBtn = screen.getByRole("button", { name: /Send Code/i });
        fireEvent.click(sendBtn);

        await waitFor(() => {
            expect(mockForgetPassword).toHaveBeenCalled();
            expect(screen.getByText("Check your email")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /Verify Code/i })).toBeInTheDocument();
        });
    });
});