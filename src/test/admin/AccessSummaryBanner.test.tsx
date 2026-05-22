import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // Gives us matchers like toBeInTheDocument
import AccessSummaryBanner from "../../components/admin/access-rights/AccessSummaryBanner";
import { describe, it, expect } from "vitest";
describe("AccessSummaryBanner", () => {
    it("renders the main heading correctly", () => {
        // 1. Arrange & Act: Render the component into our virtual test DOM
        render(<AccessSummaryBanner />);

        // 2. Assert: Look for a heading that says "Access Right Management"
        const heading = screen.getByRole("heading", {
            name: /access right management/i,
        });

        expect(heading).toBeInTheDocument();
    });
});