import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EmployeeCredentialsModal from "../../../components/employees/components/EmployeeCredentialsModal";

// Mock the common Modal wrapper
vi.mock("../../../components/common/Modal", () => ({
  default: ({ isOpen, title, children, footer }: any) => isOpen ? (
    <div data-testid="mock-modal">
      <h2>{title}</h2>
      <div>{children}</div>
      <div>{footer}</div>
    </div>
  ) : null,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
  ModalButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe("EmployeeCredentialsModal", () => {
  const defaultProps = {
    isOpen: true,
    name: "John Doe",
    workEmail: "john@example.com",
    password: "Password123!",
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn() },
    });
  });

  it("does not render when isOpen is false", () => {
    render(<EmployeeCredentialsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("mock-modal")).not.toBeInTheDocument();
  });

  it("renders credentials correctly", () => {
    render(<EmployeeCredentialsModal {...defaultProps} />);
    
    // FIX: Use Regex `/text/i` to find text even if it's embedded in a larger sentence
    expect(screen.getByText(/Employee Created Successfully!/i)).toBeInTheDocument();
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Password123!/i)).toBeInTheDocument();
  });

  it("calls clipboard writeText when copying credentials", () => {
    render(<EmployeeCredentialsModal {...defaultProps} />);
    
    const buttons = screen.getAllByRole("button");
    
    // Click the first copy button
    fireEvent.click(buttons[0]);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("john@example.com");
  });
});