import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import EmployeeSelfService from "../../components/employee-service/EmployeeSelfService";

/* =========================================================
   ✅ 1. DAYJS MOCK (FIXES tz.guess + prevents crashes)
========================================================= */
vi.mock("dayjs", () => {
  const d: any = () => ({
    format: () => "2024-01-01",
    startOf: () => d(),
    endOf: () => d(),
  });

  // ✅ FIX: add extend
  d.extend = () => { };

  // ✅ FIX: timezone support
  d.tz = {
    guess: () => "Asia/Kolkata",
    setDefault: () => { },
  };

  return { default: d };
});
vi.mock("dayjs/plugin/localeData", () => ({
  default: () => { },
}));

vi.mock("dayjs/plugin/timezone", () => ({
  default: () => { },
}));

vi.mock("dayjs/plugin/utc", () => ({
  default: () => { },
}));

/* =========================================================
   ✅ 2. STABLE API MOCKS (FIXES INFINITE LOOP)
========================================================= */
const mockQueryResponse = {
  data: { data: [], pagination: { totalItems: 0 } },
  isLoading: false,
  refetch: vi.fn(),
};

const mockUsers = { data: [] };

vi.mock("../../store/apis/compOff.api", () => ({
  useGetCompOffListQuery: () => mockQueryResponse,
  useCreateCompOffMutation: () => [vi.fn(), { isLoading: false }],
  useApproveCompOffMutation: () => [vi.fn(), { isLoading: false }],
  useRejectCompOffMutation: () => [vi.fn(), { isLoading: false }],
}));

vi.mock("../../store/apis/user.api", () => ({
  useGetUsersForFilterQuery: () => mockUsers,
}));

/* =========================================================
   ✅ 3. REDUX MOCK (STABLE)
========================================================= */
vi.mock("react-redux", () => ({
  useSelector: (fn: any) =>
    fn({
      auth: {
        user: { id: "123", role: "Admin" },
        token: "mock",
        isAuthenticated: true,
      },
    }),
  useDispatch: () => vi.fn(),
}));

/* =========================================================
   ✅ 4. CUSTOM HOOKS
========================================================= */
vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "123", role: "Admin" } }),
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: () => true,
}));

/* =========================================================
   ✅ 5. FEATURE FLAGS
========================================================= */
vi.mock("../../contexts/FeatureFlagsContext", () => ({
  useFeatureFlags: () => ({
    isFeatureEnabled: () => true,
    isEnabled: () => true,
  }),
}));

/* =========================================================
   ✅ 6. UI COMPONENTS
========================================================= */
vi.mock("../../components/common/Table", () => ({
  default: () => <div data-testid="mock-table">Table</div>,
}));

vi.mock("../../components/common/Pagination", () => ({
  default: () => <div data-testid="mock-pagination">Pagination</div>,
}));

/* =========================================================
   ✅ TEST SUITE
========================================================= */
describe("EmployeeSelfService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it("renders the layout, title, and table", () => {
    renderWithRouter(<EmployeeSelfService />);

    expect(
      screen.getByRole("heading", { name: /employee service/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /comp-off request approval/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /comp-off approval history/i })
    ).toBeInTheDocument();

    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
  });
});