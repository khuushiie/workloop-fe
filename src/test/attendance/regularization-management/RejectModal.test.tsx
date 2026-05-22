import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import RejectModal from "../../../components/attendance/regularization-management/RejectModal";

describe("RejectModal", () => {
    const mockOnClose = vi.fn();
    const mockSetRejectReason = vi.fn();
    const mockOnReject = vi.fn();
    const mockFormatDate = vi.fn((date: string) => `Formatted: ${date}`);

    const mockRequest = {
        id: "req-1",
        userName: "John Doe",
        date: "2024-01-01",
    } as any;

    it("renders single rejection text when a specific request is passed", () => {
        render(
            <RejectModal
                isOpen={true}
                onClose={mockOnClose}
                request={mockRequest}
                rejectReason=""
                setRejectReason={mockSetRejectReason}
                onReject={mockOnReject}
                processing={null}
                formatDate={mockFormatDate}
            />
        );

        expect(
            screen.getByText(/You are about to reject the regularization request for John Doe/i)
        ).toBeInTheDocument();
    });

    it("renders bulk rejection text when no specific request is passed", () => {
        render(
            <RejectModal
                isOpen={true}
                onClose={mockOnClose}
                rejectReason=""
                setRejectReason={mockSetRejectReason}
                onReject={mockOnReject}
                processing={null}
                formatDate={mockFormatDate}
            />
        );

        expect(
            screen.getByText(/Are you sure you want to reject all the selected regularization requests/i)
        ).toBeInTheDocument();
    });

    it("disables the Reject button if rejectReason is empty", () => {
        render(
            <RejectModal
                isOpen={true}
                onClose={mockOnClose}
                request={mockRequest}
                rejectReason="   " // empty/whitespace
                setRejectReason={mockSetRejectReason}
                onReject={mockOnReject}
                processing={null}
                formatDate={mockFormatDate}
            />
        );

        const rejectBtn = screen.getByRole("button", { name: /Reject Request/i });
        expect(rejectBtn).toBeDisabled();
    });
});