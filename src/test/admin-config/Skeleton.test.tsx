import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import { FeatureFlagsTableSkeleton } from "../../components/admin-config/Skeleton"; // Adjust path as needed

describe("FeatureFlag Skeleton", () => {
    it("renders the FeatureFlagsTableSkeleton without crashing", () => {
        const { container } = render(<FeatureFlagsTableSkeleton />);

        // Check that it rendered elements
        expect(container.firstChild).toBeInTheDocument();

        // Check for the shimmer class used in your Skeleton component
        const shimmerElements = container.querySelectorAll(".animate-shimmer");
        expect(shimmerElements.length).toBeGreaterThan(0);
    });
});