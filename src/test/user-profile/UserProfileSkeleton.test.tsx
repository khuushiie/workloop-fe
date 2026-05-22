import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import UserProfileSkeleton from "../../components/user-profile/UserProfileSkeleton";

describe("UserProfileSkeleton", () => {
  it("renders the skeleton wrapper with correct aria attributes", () => {
    render(<UserProfileSkeleton />);
    
    // Check if the main container is accessible as a loading status
    const skeletonContainer = screen.getByRole("status");
    expect(skeletonContainer).toBeInTheDocument();
    expect(skeletonContainer).toHaveAttribute("aria-busy", "true");
  });

  it("renders the layout structures", () => {
    const { container } = render(<UserProfileSkeleton />);
    
    // Check if it renders the shimmer blocks (by class)
    const shimmerBlocks = container.querySelectorAll(".animate-shimmer");
    expect(shimmerBlocks.length).toBeGreaterThan(0);
  });
});