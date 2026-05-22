import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import {
    getWorkflowStatusIcon,
    getPendingColumns,
    getHistoryColumns,
} from "../../../components/attendance/regularization-management/tableColumns";

// Mock the lucide-react icons so we can assert they are returned correctly
vi.mock("lucide-react", () => ({
    CheckCircle: () => <div data-testid="icon-check" />,
    XCircle: () => <div data-testid="icon-x" />,
    Clock: () => <div data-testid="icon-clock" />,
    Calendar: () => <div data-testid="icon-calendar" />,
    AlertCircle: () => <div data-testid="icon-alert" />,
    CircleAlert: () => <div data-testid="icon-circle-alert" />,
    Eye: () => <div data-testid="icon-eye" />,
    X: () => <div data-testid="icon-close" />,
}));

// Spy on the badge variant helper so we can assert WHICH field is passed to it.
// This is the regression hook for the bug where regularizationTypeCode was being
// passed instead of status, causing every badge to render gray.
const getWorkflowStatusVariantSpy = vi.fn((s?: string) =>
    !s ? "gray" : s.startsWith("pending") ? "yellow" : s.startsWith("approved") ? "green" : "gray",
);

vi.mock("../../../utils/badgeVariants", () => ({
    getWorkflowStatusVariant: (s?: string) => getWorkflowStatusVariantSpy(s),
}));

// Capture the props the Badge receives so we can inspect the variant.
const badgeRenderSpy = vi.fn();
vi.mock("../../../components/common/Badge", () => ({
    default: (props: { variant?: string; children?: React.ReactNode }) => {
        badgeRenderSpy(props);
        return <div data-testid="status-badge" data-variant={props.variant}>{props.children}</div>;
    },
}));

vi.mock("../../../components/common", () => ({
    SimpleTooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("tableColumns utilities", () => {
    describe("getWorkflowStatusIcon", () => {
        it("returns CheckCircle for approved statuses", () => {
            // FIX: Use the actual string values instead of the TypeScript type
            const Icon = getWorkflowStatusIcon("approved" as any);
            const { getByTestId } = render(<Icon />);
            expect(getByTestId("icon-check")).toBeDefined();
        });

        it("returns XCircle for rejected statuses", () => {
            // FIX: Use the actual string values
            const Icon = getWorkflowStatusIcon("rejected" as any);
            const { getByTestId } = render(<Icon />);
            expect(getByTestId("icon-x")).toBeDefined();
        });

        it("returns Clock for pending statuses", () => {
            // FIX: Use the actual string values
            const Icon = getWorkflowStatusIcon("pending" as any);
            const { getByTestId } = render(<Icon />);
            expect(getByTestId("icon-clock")).toBeDefined();
        });

        it("returns CircleAlert as a fallback for unknown statuses", () => {
            const Icon = getWorkflowStatusIcon("UNKNOWN_STATUS" as any);
            const { getByTestId } = render(<Icon />);
            expect(getByTestId("icon-circle-alert")).toBeDefined();
        });
    });

    describe("status column variant selection (regression)", () => {
        // Regression: previously the status cell passed r.regularizationTypeCode
        // (the request TYPE, e.g. "late_check_out") into getWorkflowStatusVariant,
        // which always fell through to "gray" instead of "yellow"/"green"/"red".
        // It must use r.status (the workflow status code).

        const baseRow = {
            id: "req-1",
            employeeId: "EMP1",
            fullName: "Test User",
            departmentName: "Eng",
            userName: "Test User",
            department: "Eng",
            date: "2026-04-14",
            regularizationTypeCode: "late_check_out", // NOT a status prefix
            regularizationTypeName: "Late Check-out",
            requestedCheckInTime: "09:00",
            requestedCheckOutTime: "18:00",
            actualCheckInTime: "",
            actualCheckOutTime: "",
            reason: "test",
            statusLabel: "Pending with Reporting Authority",
            currentActorName: "Manager",
            appliedDate: "2026-04-14",
        };

        const baseConfig = {
            formatDate: (d: string) => d,
            formatTime: (t: string) => t,
            getRegularizationTypeLabel: (t: any) => String(t),
            getStatusColor: () => "",
            handleViewDetails: vi.fn(),
        };

        const renderStatusCell = (
            columns: ReturnType<typeof getPendingColumns | typeof getHistoryColumns>,
            row: any,
        ) => {
            const statusCol = columns.find((c) => c.key === "status");
            if (!statusCol || !statusCol.render) {
                throw new Error("status column or render fn missing");
            }
            return render(<>{statusCol.render(undefined, row, 0)}</>);
        };

        beforeEach(() => {
            getWorkflowStatusVariantSpy.mockClear();
            badgeRenderSpy.mockClear();
        });

        it("pending column uses r.status (yellow) for a pending row, not r.regularizationTypeCode (gray)", () => {
            const columns = getPendingColumns({
                ...baseConfig,
                handleApproveClick: vi.fn(),
                handleRejectClick: vi.fn(),
                canActOnRequest: () => false,
                processing: null,
                selectedIds: [],
                setSelectedIds: vi.fn(),
                data: [],
            } as any);

            const row = { ...baseRow, status: "pending_with_reporting_authority" };
            const { getByTestId } = renderStatusCell(columns, row);

            // The variant helper must be called with the status code, not the type code.
            expect(getWorkflowStatusVariantSpy).toHaveBeenCalledWith(
                "pending_with_reporting_authority",
            );
            expect(getWorkflowStatusVariantSpy).not.toHaveBeenCalledWith("late_check_out");
            expect(getByTestId("status-badge").getAttribute("data-variant")).toBe("yellow");
        });

        it("history column uses r.status (yellow) for a pending row, not r.regularizationTypeCode (gray)", () => {
            const columns = getHistoryColumns(baseConfig as any);

            const row = { ...baseRow, status: "pending_with_reporting_authority" };
            const { getByTestId } = renderStatusCell(columns, row);

            expect(getWorkflowStatusVariantSpy).toHaveBeenCalledWith(
                "pending_with_reporting_authority",
            );
            expect(getWorkflowStatusVariantSpy).not.toHaveBeenCalledWith("late_check_out");
            expect(getByTestId("status-badge").getAttribute("data-variant")).toBe("yellow");
        });
    });
});