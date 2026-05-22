import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import GameBookingForm from "../../../components/employee-service/component/GameBookingForm";

// 1. Mock the API for fetching Master Configs (Game Types)
vi.mock("../../../store/apis/masterConfig.api", () => ({
    useGetMasterConfigByCategoryQuery: () => ({
        data: [{ id: "game-1", displayName: "Table Tennis" }]
    })
}));

// 2. Mock complex UI components to keep the test purely about layout
vi.mock("../../../components/common", () => ({
    Select: ({ placeholder }: any) => <div data-testid="mock-select">{placeholder}</div>,
    DatePicker: ({ label }: any) => <div data-testid="mock-datepicker">{label}</div>,
    TimePicker: ({ label }: any) => <div data-testid="mock-timepicker">{label}</div>,
    Button: ({ children, onClick, htmlType }: any) => (
        <button type={htmlType} onClick={onClick} data-testid={`mock-btn-${children}`}>
            {children}
        </button>
    ),
}));

vi.mock("../../../components/common/TextArea", () => ({
    TextArea: ({ label }: any) => <div data-testid="mock-textarea">{label}</div>
}));

describe("GameBookingForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const defaultProps = {
        users: [],
        currentUserId: "u1",
        onSubmit: vi.fn(),
        submitting: false,
    };

    it("renders all form input fields correctly", () => {
        render(<GameBookingForm {...defaultProps} />);

        expect(screen.getByText("Select game")).toBeInTheDocument();
        expect(screen.getByText("Select duration")).toBeInTheDocument();
        expect(screen.getByText("Select participants")).toBeInTheDocument();

        expect(screen.getByTestId("mock-datepicker")).toBeInTheDocument();
        expect(screen.getByTestId("mock-timepicker")).toBeInTheDocument();
        expect(screen.getByTestId("mock-textarea")).toBeInTheDocument();
    });

    it("renders buttons with correct loading state", () => {
        render(<GameBookingForm {...defaultProps} submitting={true} />);
        expect(screen.getByTestId("mock-btn-Booking...")).toBeInTheDocument();
    });
});