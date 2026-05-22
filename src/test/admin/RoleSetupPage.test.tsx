import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RoleSetupPage from "../../components/admin/access-rights/RoleSetupPage";

// 1. Mock the UI Child Components
vi.mock("../../components/admin/access-rights/AccessTabs", () => ({
    default: () => <div data-testid="access-tabs">Tabs</div>,
}));
vi.mock("../../components/admin/access-rights/RoleCards", () => ({
    RoleFormCard: () => <div data-testid="role-form-card">Role Form</div>,
    PermissionCard: () => <div data-testid="permission-card">Permission Card</div>,
    RoleTableCard: () => <div data-testid="role-table-card">Role Table</div>,
    UserAssignmentCard: () => <div data-testid="user-assignment-card">User Assignment</div>,
    OverridesSidebar: () => <div data-testid="overrides-sidebar">Overrides</div>,
}));
vi.mock("../../components/admin/access-rights/ModuleBuilderCard", () => ({
    default: () => <div data-testid="module-builder">Module Builder</div>,
}));
vi.mock("../../components/common/PermissionGate", () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// 2. STABLE Custom Hooks Mock
vi.mock("../../store/hooks/useRbac", () => {
    const stableCodes = new Set();
    const stableHierarchy: any[] = [];
    return {
        useEffectivePermissions: () => ({ codes: stableCodes, hierarchy: stableHierarchy, isReady: true }),
        useHasPermission: () => true,
    };
});

vi.mock("../../store/hooks/useAuth", () => {
    const stableUser = { role: "SuperAdmin" };
    return {
        useAuth: () => ({ user: stableUser, isAuthenticated: true }),
    };
});

// 3. STABLE APIs Mock (Now with .unwrap() support!)
vi.mock("../../store/apis/rbac.api", () => {
    const stableTree = { tree: [] };
    const stablePaginated = { data: [], pagination: { total: 0 } };
    const stableRoles = { items: [], total: 0 };

    // Create a mock trigger that successfully resolves the .unwrap() call
    const mockMutationTrigger = vi.fn().mockReturnValue({
        unwrap: () => Promise.resolve({})
    });
    const mockMutation = [mockMutationTrigger, { isLoading: false }];

    const mockLazyRolesTrigger = vi.fn().mockReturnValue({
        unwrap: () => Promise.resolve(stableRoles)
    });

    const mockLazyUsersTrigger = vi.fn().mockReturnValue({
        unwrap: () => Promise.resolve(stablePaginated)
    });

    return {
        useGetPermissionTreeQuery: () => ({ data: stableTree, isLoading: false }),
        useCreatePermissionEntityMutation: () => mockMutation,
        useUpdatePermissionMutation: () => mockMutation,
        useDeletePermissionMutation: () => mockMutation,
        useLazyListRolesQuery: () => [mockLazyRolesTrigger, { data: stableRoles, isFetching: false }],
        useLazyGetRoleQuery: () => [mockMutationTrigger, { isLoading: false }],
        useCreateRoleMutation: () => mockMutation,
        useUpdateRoleMutation: () => mockMutation,
        useDeleteRoleMutation: () => mockMutation,
        useGetUserRoleQuery: () => ({ data: null, isFetching: false }),
        useAssignRoleMutation: () => mockMutation,
        useGetAdditionalPermissionsQuery: () => ({ data: null, isFetching: false }),
        useUpdateAdditionalPermissionsMutation: () => mockMutation,
        useLazyGetUserAccessUsersQuery: () => [mockLazyUsersTrigger, { data: stablePaginated, isFetching: false }],
        useBulkAssignRoleMutation: () => mockMutation,
    };
});

vi.mock("../../store/apis/user.api", () => {
    const stableData: any[] = [];
    return {
        useGetUsersForFilterQuery: () => ({ data: stableData, isLoading: false }),
    };
});

vi.mock("../../store/apis/masterConfig.api", () => {
    const stableData: any[] = [];
    return {
        useGetMasterConfigByCategoryQuery: () => ({ data: stableData, isLoading: false }),
    };
});

// 4. Mock react-router-dom
vi.mock("react-router-dom", () => ({
    useLocation: () => ({ pathname: "/" }),
    useNavigate: () => vi.fn(),
}));

describe("RoleSetupPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Notice we made this test async
    it("renders the main page structure without crashing", async () => {
        render(<RoleSetupPage />);

        expect(screen.getByTestId("access-tabs")).toBeInTheDocument();

        // We use findByTestId here to wait for the loading skeleton to finish!
        expect(await screen.findByTestId("role-form-card")).toBeInTheDocument();
        expect(screen.getByTestId("permission-card")).toBeInTheDocument();
        expect(screen.getByTestId("role-table-card")).toBeInTheDocument();
    });
});