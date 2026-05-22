import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ARViewModal from "../../components/attendance/ARViewModal";
import { WorkflowStatusCode } from "../../utils/constants";

// 1. Mock the Timezone hook to return predictable strings
vi.mock("../../hooks/useTimezone", () => ({
    useTimezone: () => ({
        formatDate: (date: string) => `Date: ${date}`,
        formatTime: (time: string) => `Time: ${time}`,
    }),
}));

// 2. Mock the common Modal component to just render its children
vi.mock("../../components/common", () => ({
    Modal: ({ children, isOpen, title }: any) =>
        isOpen ? (
            <div data-testid="mock-modal">
                <h2>{title}</h2>
                {children}
            </div>
        ) : null,
}));

describe("ARViewModal", () => {
    const mockOnClose = vi.fn();

    const baseRequest = {
        id: "1",
        userId: "u1",
        userName: "John Doe",
        employeeId: "EMP-001",
        department: "Engineering",
        date: "2024-01-01",
        regularizationType: "forgot_checkin",
        regularizationTypeName: "Forgot Check-in",
        regularizationTypeCode: "FCI",
        requestedCheckInTime: "09:00",
        requestedCheckOutTime: "18:00",
        reason: "Forgot to punch in",
        status: "pending" as WorkflowStatusCode,
        statusLabel: "Pending",
        appliedDate: "2024-01-02",
        attendanceUpdated: false,
        createdAt: "2024-01-02",
        updatedAt: "2024-01-02",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns null if request is null", () => {
        const { container } = render(<ARViewModal isOpen={true} onClose={mockOnClose} request={null} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("renders employee details and formatted times correctly", () => {
        render(<ARViewModal isOpen={true} onClose={mockOnClose} request={baseRequest} />);

        expect(screen.getByTestId("mock-modal")).toBeInTheDocument();
        expect(screen.getByText("John Doe (EMP-001)")).toBeInTheDocument();
        expect(screen.getByText("Engineering")).toBeInTheDocument();
        expect(screen.getByText("Time: 09:00 - Time: 18:00")).toBeInTheDocument();
        expect(screen.getByText("Forgot to punch in")).toBeInTheDocument();
    });

    it("renders approved details when status is approved", () => {
        const approvedRequest = {
            ...baseRequest,
            status: "approved" as WorkflowStatusCode,
            approvedByName: "Admin User",
        };

        render(<ARViewModal isOpen={true} onClose={mockOnClose} request={approvedRequest} />);

        expect(screen.getByText("Approved By")).toBeInTheDocument();
        expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    it("renders rejection reason when status is rejected", () => {
        const rejectedRequest = {
            ...baseRequest,
            status: "rejected" as WorkflowStatusCode,
            rejectionReason: "Invalid proof provided",
        };

        render(<ARViewModal isOpen={true} onClose={mockOnClose} request={rejectedRequest} />);

        expect(screen.getByText("Rejection Reason")).toBeInTheDocument();
        expect(screen.getByText("Invalid proof provided")).toBeInTheDocument();
    });
});