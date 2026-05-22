import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import LeaveApprovalSkeleton from "../../components/leave/LeaveApprovalSkeleton";

describe("LeaveApprovalSkeleton", () => {
  it("renders the skeleton wrapper with correct aria roles", () => {
    const { container } = render(<LeaveApprovalSkeleton />);
    
    const wrapper = container.querySelector('[role="status"]');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute("aria-busy", "true");
  });

  it("renders the requested number of rows", () => {
    const { container } = render(<LeaveApprovalSkeleton rows={3} />);
    
    // There should be 1 header row + 3 body rows = 4 rows total
    const rows = container.querySelectorAll("tr");
    expect(rows.length).toBe(4);
  });
});