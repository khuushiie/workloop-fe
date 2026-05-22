import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ChangePassword from "../../components/auth/ChangePassword";

// 1. Mock the Auth hook
const mockChangePassword = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
const mockMarkFirstLogin = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
const mockLogout = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });

// By default, simulate a "First Login" scenario
let mockUser = { isFirstLogin: true };

vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({
        user: mockUser,
        changePassword: { mutate: mockChangePassword, isLoading: false, error: null },
        markFirstLoginComplete: { mutate: mockMarkFirstLogin, isLoading: false },
        logout: { mutate: mockLogout, isLoading: false },
    }),
}));

describe("ChangePassword", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = { isFirstLogin: true }; // Reset to first login
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it("renders specific instructions for First Login users", () => {
        renderWithRouter(<ChangePassword />);

        // FIX: Using getByRole for the heading to avoid text ambiguity
        expect(screen.getByRole("heading", { name: /Set Your Password/i })).toBeInTheDocument();
        expect(screen.getByText(/You must change your password before accessing the system/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Set Password/i })).toBeInTheDocument();
    });

    it("renders standard UI for regular password changes", () => {
        mockUser = { isFirstLogin: false }; // Simulate normal user
        renderWithRouter(<ChangePassword />);

        // FIX: Using getByRole to avoid conflicting with the "Change Password" button text
        expect(screen.getByRole("heading", { name: /Change Password/i })).toBeInTheDocument();
        expect(screen.queryByText(/You must change your password before accessing the system/i)).not.toBeInTheDocument();
    });

    it("validates password policy and prevents submission", () => {
        renderWithRouter(<ChangePassword />);

        // Enter a weak password
        fireEvent.change(screen.getByPlaceholderText(/Enter new password/i), { target: { value: "weak" } });
        fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), { target: { value: "weak" } });

        fireEvent.click(screen.getByRole("button", { name: /Set Password/i }));

        // Should show error and NOT call mutation
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("validates password mismatch and prevents submission", () => {
        renderWithRouter(<ChangePassword />);

        fireEvent.change(screen.getByPlaceholderText(/Enter new password/i), { target: { value: "StrongPass1!" } });
        fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), { target: { value: "DifferentPass2@" } });

        fireEvent.click(screen.getByRole("button", { name: /Set Password/i }));

        expect(screen.getByText("New passwords do not match")).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });
});