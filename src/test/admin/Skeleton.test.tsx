import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
// Adjust the import path if your Skeleton file is located elsewhere
import { KpiMetricCardSkeleton } from "../../components/admin/access-rights/Skeleton";

describe("Skeleton Components", () => {
    it("renders the KpiMetricCardSkeleton without crashing", () => {
        const { container } = render(<KpiMetricCardSkeleton />);

        // Check that it rendered elements (the shimmer blocks)
        expect(container.firstChild).toBeInTheDocument();

        // We can check for the specific animate-shimmer class you use
        const shimmerElements = container.querySelectorAll(".animate-shimmer");
        expect(shimmerElements.length).toBeGreaterThan(0);
    });
});