import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import RegularizationManagement from "../../components/attendance/RegularizationManagement";
import { VIEW_MODE } from "../../utils/constants";

// 1. THE ULTIMATE SAFETY NET: Mock Redux directly so no hooks can crash
vi.mock("react-redux", () => ({
    useSelector: vi.fn(() => ({ user: { role: "Admin" }, isAuthenticated: true })),
    useDispatch: () => vi.fn(),
}));

// 2. Mock Auth and RBAC
vi.mock("../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "123", role: "Admin" }, isAuthenticated: true }),
}));
vi.mock("../../store/hooks/useRbac", () => ({
    useHasPermission: () => true,
}));

// 3. Safety Mocks for APIs
vi.mock("../../store/apis/masterConfig.api", () => ({
    useGetMasterConfigByCategoryQuery: () => ({ data: [], isLoading: false }),
}));
vi.mock("../../store/apis/attendanceRegularization.api", () => ({
    useGetRegularizationRequestsQuery: () => ({ data: { data: [], total: 0 }, isLoading: false }),
    useActionRegularizationMutation: () => [vi.fn(), { isLoading: false }],
}));

// 4. Mock the massive custom hook
const mockHookState = {
    activeAccordion: "pending",
    setActiveAccordion: vi.fn(),
    pendingRequests: [],
    pendingLoading: false,
    pendingPage: 1,
    setPendingPage: vi.fn(),
    pendingLimit: 10,
    setPendingLimit: vi.fn(),
    pendingTotal: 0,
    pendingViewMode: VIEW_MODE.ALL,
    setPendingViewMode: vi.fn(),
    pendingFilters: {},
    setPendingFilters: vi.fn(),
    handlePendingFilterChange: vi.fn(),
    historyRequests: [],
    historyLoading: false,
    historyPage: 1,
    setHistoryPage: vi.fn(),
    historyLimit: 10,
    setHistoryLimit: vi.fn(),
    historyTotal: 0,
    historyFilters: {},
    historyViewMode: VIEW_MODE.ALL,
    setHistoryFilters: vi.fn(),
    setHistoryViewMode: vi.fn(),
    handleHistoryFilterChange: vi.fn(),
    employeeLoading: false,
    departments: [],
    regularizationTypeOptions: [],
    selectedRequest: null,
    showDetailsModal: false,
    setShowDetailsModal: vi.fn(),
    showRejectModal: false,
    setShowRejectModal: vi.fn(),
    showRejectAllModal: false,
    setShowRejectAllModal: vi.fn(),
    rejectReason: "",
    setRejectReason: vi.fn(),
    processing: null,
    loadingApprove: false,
    loadingReject: false,
    selectedIds: [],
    setSelectedIds: vi.fn(),
    handleViewDetails: vi.fn(),
    handleApproveClick: vi.fn(),
    handleRejectClick: vi.fn(),
    handleRejectAll: vi.fn(),
    handleModalReject: vi.fn(),
    handleModalAllReject: vi.fn(),
    canActOnRequest: vi.fn(),
    getStatusColor: vi.fn(),
    formatDate: vi.fn(),
    formatTime: vi.fn(),
    getRegularizationTypeLabel: vi.fn(),
};

vi.mock("../../components/attendance/regularization-management/useRegularizationManagement", () => ({
    useRegularizationManagement: () => mockHookState,
}));

vi.mock("../../components/attendance/regularization-management", async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        useRegularizationManagement: () => mockHookState,
        getPendingColumns: () => [],
        getHistoryColumns: () => [],
        getRegularizationTypeLabel: () => "Mock Label",
    };
});

// 5. Mock Child Components
vi.mock("../../components/attendance/regularization-management/FiltersBar", () => ({
    default: () => <div data-testid="mock-filters-bar">FiltersBar</div>,
}));
vi.mock("../../components/attendance/regularization-management/ViewModeTabs", () => ({
    default: () => <div data-testid="mock-view-tabs">ViewModeTabs</div>,
}));
vi.mock("../../components/attendance/regularization-management/RequestDetailsModal", () => ({
    default: ({ isOpen }: any) => isOpen ? <div data-testid="mock-details-modal">Details Modal</div> : null,
}));
vi.mock("../../components/attendance/regularization-management/RejectModal", () => ({
    default: ({ isOpen }: any) => isOpen ? <div data-testid="mock-reject-modal">Reject Modal</div> : null,
}));
vi.mock("../../components/common/Table", () => ({
    default: () => <div data-testid="mock-table">Table</div>,
}));
vi.mock("../../components/common/Pagination", () => ({
    default: () => <div data-testid="mock-pagination">Pagination</div>,
}));

describe("RegularizationManagement", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it("renders the main layout and title", () => {
        renderWithRouter(
            <RegularizationManagement title="Manager Approvals" />
        );

        // Validating only what ACTUALLY exists in the UI now
        expect(screen.getByText("Manager Approvals")).toBeInTheDocument();
    });

    it("renders the core child components (Filters, Table)", () => {
        renderWithRouter(<RegularizationManagement />);

        // Removed the ViewTabs assertion as it's no longer rendered here
        expect(screen.getByTestId("mock-filters-bar")).toBeInTheDocument();

        const tables = screen.getAllByTestId("mock-table");
        expect(tables.length).toBeGreaterThan(0);
    });

    it("does not render modals by default", () => {
        renderWithRouter(<RegularizationManagement />);

        expect(screen.queryByTestId("mock-details-modal")).not.toBeInTheDocument();
        expect(screen.queryByTestId("mock-reject-modal")).not.toBeInTheDocument();
    });
});