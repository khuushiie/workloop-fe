import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FeatureFlagManagement from "../../components/admin-config/FeatureFlagManagement";

// 1. Stable Mocks for RTK Query to prevent infinite loops
vi.mock("../../store/apis/featureFlag.api", () => {
    const stableData = { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } };
    const mockMutation = [vi.fn(), { isLoading: false }];

    return {
        useGetFeatureFlagsQuery: () => ({ data: stableData, isLoading: false, isFetching: false }),
        useUpdateFeatureFlagMutation: () => mockMutation,
        useDeleteFeatureFlagMutation: () => mockMutation,
    };
});

// 2. Mock Contexts
vi.mock("../../contexts/FeatureFlagsContext", () => ({
    useFeatureFlags: () => ({ flags: {} }),
}));

// 3. Mock Child Components to isolate the test
vi.mock("../../components/admin-config/Skeleton", () => ({
    FeatureFlagsTableSkeleton: () => <div data-testid="flag-skeleton">Loading...</div>,
}));

describe("FeatureFlagManagement", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the main layout correctly", () => {
        render(<FeatureFlagManagement />);

        // Verify header and search input are present
        expect(screen.getByPlaceholderText("Search by name or description")).toBeInTheDocument();
    });

    it("renders the empty message when no flags are found", () => {
        render(<FeatureFlagManagement />);

        // Your Table component renders this message when data is empty
        expect(
            screen.getByText("No feature flags found. Adjust your search to find feature flags.")
        ).toBeInTheDocument();
    });
});