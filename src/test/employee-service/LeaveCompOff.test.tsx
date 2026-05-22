import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LeaveCompOff from "../../components/employee-service/LeaveCompOff";

/* =========================================================
   ✅ 1. FIXED MOMENT-TIMEZONE MOCK (MAIN ISSUE)
========================================================= */
vi.mock("dayjs", () => {
  const d: any = () => ({
    format: () => "2024-01-01",
    startOf: () => d(),
    endOf: () => d(),
  });

  d.tz = {
    guess: () => "Asia/Kolkata",
    setDefault: () => {},
  };

  return { default: d };
});

/* =========================================================
   ✅ 2. REDUX MOCK (SAFE)
========================================================= */
vi.mock("react-redux", () => ({
  useSelector: (fn: any) =>
    fn({
      auth: {
        user: { role: "Employee" },
        token: "mock",
        isAuthenticated: true,
      },
    }),
  useDispatch: () => vi.fn(),
}));

/* =========================================================
   ✅ 3. CUSTOM HOOKS MOCK
========================================================= */
vi.mock("../../store/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "123" } }),
}));

vi.mock("../../store/hooks/useRbac", () => ({
  useHasPermission: () => true,
}));

/* =========================================================
   ✅ 4. FEATURE FLAGS MOCK
========================================================= */
vi.mock("../../contexts/FeatureFlagsContext", () => ({
  useFeatureFlags: () => ({
    isFeatureEnabled: () => true,
    isEnabled: () => true,
  }),
}));

/* =========================================================
   ✅ 5. API MOCKS
========================================================= */
vi.mock("../../store/apis/compOff.api", () => ({
  useGetCompOffListQuery: () => ({
    data: { data: [], pagination: { total: 0 } },
    isLoading: false,
  }),
  useCreateCompOffMutation: () => [vi.fn(), { isLoading: false }],
  usePullBackCompOffMutation: () => [vi.fn(), { isLoading: false }],
}));

/* =========================================================
   ✅ 6. CHILD COMPONENTS MOCK
========================================================= */
vi.mock("../../components/employee-service/component/TabSelector", () => ({
  default: () => <div data-testid="mock-tab-selector">TabSelector</div>,
}));

vi.mock(
  "../../components/employee-service/component/CompensatoryLeaveTable",
  () => ({
    default: () => (
      <div data-testid="mock-comp-off-table">CompOffTable</div>
    ),
  })
);

vi.mock("../../components/employee-service/component/GameBookingTab", () => ({
  default: () => <div data-testid="mock-game-booking">GameBookingTab</div>,
}));

vi.mock("../../components/common", () => ({
  Modal: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="mock-modal">{children}</div> : null,
  ConfirmationModal: ({ isOpen }: any) =>
    isOpen ? <div data-testid="mock-confirm-modal">Confirm</div> : null,
  DatePicker: () => <div data-testid="mock-datepicker" />,
  Button: ({ children }: any) => <button>{children}</button>,
}));

vi.mock("../../components/common/TextArea", () => ({
  TextArea: () => <div data-testid="mock-textarea" />,
}));

/* =========================================================
   ✅ TEST SUITE
========================================================= */
describe("LeaveCompOff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it("renders the layout and the TabSelector", () => {
    renderWithRouter(<LeaveCompOff />);
    expect(screen.getByText("Employee Self Service")).toBeInTheDocument();
    expect(screen.getByTestId("mock-tab-selector")).toBeInTheDocument();
    expect(screen.getByTestId("mock-comp-off-table")).toBeInTheDocument();
  });
});