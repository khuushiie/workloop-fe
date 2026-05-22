import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import RejectionModal from "../../../components/leave/modals/RejectionModal";

describe("RejectionModal", () => {
  const defaultProps = {
    rejectionReason: "",
    setRejectionReason: vi.fn(),
    setShowRejectModal: vi.fn(),
    setSelectedLeave: vi.fn(),
    confirmReject: vi.fn(),
    processing: false,
    selectedLeave: "leave-1",
  };

  it("renders the modal with default text", () => {
    render(<RejectionModal {...defaultProps} />);
    expect(screen.getByText("Reject Leave Request")).toBeInTheDocument();
    expect(
      screen.getByText("Please provide a reason for rejecting this leave request.")
    ).toBeInTheDocument();
  });

  it("calls setRejectionReason when text is typed", () => {
    render(<RejectionModal {...defaultProps} />);
    
    // ✅ FIX: Find by placeholder instead of testid
    const textarea = screen.getByPlaceholderText(/Enter rejection reason/i);
    
    fireEvent.change(textarea, { target: { value: "Not enough leave balance" } });
    expect(defaultProps.setRejectionReason).toHaveBeenCalledWith("Not enough leave balance");
  });

  it("disables the confirm button if reason is empty", () => {
    render(<RejectionModal {...defaultProps} rejectionReason="   " />);
    const confirmBtn = screen.getByText("Confirm Reject");
    expect(confirmBtn).toBeDisabled();
  });

  it("calls confirmReject when confirm button is clicked", () => {
    render(<RejectionModal {...defaultProps} rejectionReason="Valid reason" />);
    const confirmBtn = screen.getByText("Confirm Reject");
    fireEvent.click(confirmBtn);
    expect(defaultProps.confirmReject).toHaveBeenCalled();
  });

  it("calls reset functions when cancel is clicked", () => {
    render(<RejectionModal {...defaultProps} />);
    const cancelBtn = screen.getByText("Cancel");
    fireEvent.click(cancelBtn);

    expect(defaultProps.setShowRejectModal).toHaveBeenCalledWith(false);
    expect(defaultProps.setRejectionReason).toHaveBeenCalledWith("");
    expect(defaultProps.setSelectedLeave).toHaveBeenCalledWith(null);
  });
});