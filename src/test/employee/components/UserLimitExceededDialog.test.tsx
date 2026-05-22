import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
// FIX: Corrected import path (3 levels up, then into employees folder based on your error log)
import { UserLimitExceededDialog } from "../../../components/employees/components/UserLimitExceededDialog";

// 1. Redux Safety Net
vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => ({ auth: { user: { id: "1" } } })),
  useDispatch: () => vi.fn(),
}));

// 2. FIX: Corrected relative path to 3 levels up (../../../)
const mockRequestUsers = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() });
vi.mock("../../../store/apis/organization.api", () => ({
  useRequestMoreUsersMutation: () => [mockRequestUsers, { isLoading: false }]
}));

// 3. FIX: Corrected relative path for common components (../../../)
vi.mock("../../../components/common/Modal", () => ({
  default: ({ isOpen, children, footer }: any) => isOpen ? (
    <div data-testid="mock-modal">
      {children}
      {footer}
    </div>
  ) : null,
  ModalFooter: ({ children }: any) => <div>{children}</div>,
  ModalButton: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("../../../components/common/Input", () => ({
  default: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <input 
        data-testid="mock-input" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  )
}));

describe("UserLimitExceededDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    organizationId: "org-123",
    organizationName: "Acme Corp",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the limit exceeded message and org name", () => {
    render(<UserLimitExceededDialog {...defaultProps} />);
    
    expect(screen.getByText(/You have exceeded the number of users/i)).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
  });

  it("allows entering a valid requested count", () => {
    render(<UserLimitExceededDialog {...defaultProps} />);
    
    const input = screen.getByTestId("mock-input");
    fireEvent.change(input, { target: { value: "5" } });
    
    expect(input).toHaveValue("5");
  });

  it("calls the mutation and closes on successful request", async () => {
    render(<UserLimitExceededDialog {...defaultProps} />);
    
    const input = screen.getByTestId("mock-input");
    fireEvent.change(input, { target: { value: "10" } });
    
    const sendBtn = screen.getByText("Send Request");
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mockRequestUsers).toHaveBeenCalledWith({
        organizationId: "org-123",
        requestedCount: 10
      });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});