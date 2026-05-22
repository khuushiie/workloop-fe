import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import ARApproval from "../../components/attendance/ARApproval";

// Mock the heavy child component
vi.mock("../../components/attendance/RegularizationManagement", () => ({
    default: (props: any) => (
        <div data-testid="mock-reg-management">
            Manager View: {props.isManagerView ? "Yes" : "No"}
            Title: {props.title}
        </div>
    ),
}));

describe("ARApproval", () => {
    it("renders RegularizationManagement with manager view enabled", () => {
        render(<ARApproval />);

        const wrapper = screen.getByTestId("mock-reg-management");
        expect(wrapper).toBeInTheDocument();

        // Verify the correct props were passed down
        expect(wrapper).toHaveTextContent("Manager View: Yes");
        expect(wrapper).toHaveTextContent("Title: AR Approvals");
    });
});