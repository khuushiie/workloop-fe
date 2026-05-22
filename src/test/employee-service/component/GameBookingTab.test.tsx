import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import GameBookingTab from "../../../components/employee-service/component/GameBookingTab";

// 1. Smart Redux Mock
vi.mock("react-redux", () => ({
    useSelector: vi.fn((fn) => fn ? fn({ auth: { user: { id: "123" } } }) : {}),
    useDispatch: () => vi.fn(),
}));

// 2. Mock Hooks and APIs
vi.mock("../../../store/hooks/useAuth", () => ({
    useAuth: () => ({ user: { id: "123" } })
}));
vi.mock("../../../store/apis/user.api", () => ({
    useGetAllOrgUsersForFilterQuery: () => ({ data: [] })
}));
vi.mock("../../../store/apis/gameBooking.api", () => ({
    useGetMyBookingsQuery: () => ({ data: { data: [], pagination: { totalItems: 0 } }, isLoading: false }),
    useCreateBookingMutation: () => [vi.fn(), { isLoading: false }],
    useCancelBookingMutation: () => [vi.fn(), { isLoading: false }]
}));

// 3. Mock Child Components
vi.mock("../../../components/employee-service/component/GameBookingForm", () => ({
    default: () => <div data-testid="mock-booking-form">Form</div>
}));
vi.mock("../../../components/employee-service/component/GameBookingTable", () => ({
    default: () => <div data-testid="mock-booking-table">Table</div>
}));

describe("GameBookingTab", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithRouter = (ui: React.ReactElement) => {
        return render(<MemoryRouter>{ui}</MemoryRouter>);
    };

    it("renders both the booking form and the upcoming bookings table", () => {
        renderWithRouter(<GameBookingTab />);

        expect(screen.getByTestId("mock-booking-form")).toBeInTheDocument();
        expect(screen.getByTestId("mock-booking-table")).toBeInTheDocument();
    });
});