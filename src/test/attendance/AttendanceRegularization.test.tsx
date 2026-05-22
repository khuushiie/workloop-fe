import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AttendanceRegularization from "../../components/attendance/AttendanceRegularization";

// 1. Mock Auth, RBAC, and Timezone
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "user-123" } }),
}));
vi.mock("../../store/hooks/useRbac", () => ({
    useHasPermission: () => true,
}));
vi.mock("../../hooks/useTimezone", () => ({
    useTimezone: () => ({
        formatDate: (d: string) => d,
        formatTime: (t: string) => t,
        toUTC: (d: string) => d,
        dateToUTC: (d: string) => d,
        todayIST: () => "2024-05-01T00:00:00Z",
    }),
}));

// 2. Stable RTK Query Mocks
vi.mock("../../store/apis/attendance.api", () => ({
    useLazyGetCalendarDataQuery: () => [vi.fn(), { isLoading: false }],
    useLazyGetTodayStatusByDateQuery: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("../../store/apis/attendanceRegularization.api", () => {
    const stablePaginated = { data: [], pagination: { total: 0 } };
    const mockMutation = [vi.fn(), { isLoading: false }];

    return {
        useGetMyRegularizationRequestsQuery: () => ({
            data: stablePaginated,
            isLoading: false,
            isFetching: false
        }),
        useCreateRegularizationMutation: () => mockMutation,
        usePullbackRegularizationMutation: () => mockMutation,
    };
});

vi.mock("../../store/apis/masterConfig.api", () => ({
    useGetMasterConfigByCategoryQuery: () => ({ data: [], isLoading: false }),
}));

// 3. Mock standard UI components
vi.mock("../../components/common/FilterWrapper", () => ({
    default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock("../../components/attendance/Skeleton", () => ({
    RegularizationTableSkeleton: () => <div data-testid="mock-skeleton">Loading Table...</div>,
}));

describe("AttendanceRegularization", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the main layout header and apply button", () => {
        render(<AttendanceRegularization />);

        expect(screen.getByText("Attendance Regularization")).toBeInTheDocument();

        // FIX: Updated to match the actual "Submit" button text in your UI
        const applyBtn = screen.getByRole("button", { name: /Submit/i });
        expect(applyBtn).toBeInTheDocument();
    });

    it("shows the empty state message when no data is returned", () => {
        render(<AttendanceRegularization />);

        // FIX: Updated to match the actual empty state text in your UI
        expect(
            screen.getByText(/No regularization requests found/i)
        ).toBeInTheDocument();
    });
});