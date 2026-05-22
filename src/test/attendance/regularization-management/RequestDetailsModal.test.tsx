import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import RequestDetailsModal from "../../../components/attendance/regularization-management/RequestDetailsModal";

describe("RequestDetailsModal", () => {
    const mockOnClose = vi.fn();
    const mockFormatDate = vi.fn((date) => date);
    const mockFormatTime = vi.fn((time) => time);
    const mockGetRegularizationTypeLabel = vi.fn((type) => type);
    const mockGetStatusColor = vi.fn(() => "bg-blue-100 text-blue-800");

    const mockRequest = {
        id: "req-1",
        fullName: "Jane Smith",
        employeeId: "EMP-001",
        departmentName: "Engineering",
        date: "2024-01-01",
        regularizationType: "forgot_checkin",
        requestedCheckInTime: "09:00",
        requestedCheckOutTime: "18:00",
        reason: "Forgot to punch in via mobile app",
        status: "pending",
        statusLabel: "Pending Approval",
    } as any;

    it("renders employee details correctly", () => {
        render(
            <RequestDetailsModal
                isOpen={true}
                onClose={mockOnClose}
                request={mockRequest}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
                getRegularizationTypeLabel={mockGetRegularizationTypeLabel}
                getStatusColor={mockGetStatusColor}
            />
        );

        // Verify Name and ID
        expect(screen.getByText("Jane Smith (EMP-001)")).toBeInTheDocument();

        // Verify Department
        expect(screen.getByText("Engineering")).toBeInTheDocument();

        // Verify Reason
        expect(screen.getByText("Forgot to punch in via mobile app")).toBeInTheDocument();

        // Verify Status Badge
        expect(screen.getByText("Pending Approval")).toBeInTheDocument();
    });

    it("renders rejection reason if present", () => {
        const rejectedRequest = { ...mockRequest, status: "rejected", rejectionReason: "Invalid reason provided" };

        render(
            <RequestDetailsModal
                isOpen={true}
                onClose={mockOnClose}
                request={rejectedRequest}
                formatDate={mockFormatDate}
                formatTime={mockFormatTime}
                getRegularizationTypeLabel={mockGetRegularizationTypeLabel}
                getStatusColor={mockGetStatusColor}
            />
        );

        expect(screen.getByText("Rejection Reason")).toBeInTheDocument();
        expect(screen.getByText("Invalid reason provided")).toBeInTheDocument();
    });
});