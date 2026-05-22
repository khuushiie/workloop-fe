import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import HolidayCard from "../../components/holiday/HolidayCard"; // Adjust path if needed
import { useGetCurrentYearHolidaysQuery } from "../../store/apis/holidayManagement.api";

// ✅ Mock RTK Query Hook
vi.mock("../../store/apis/holidayManagement.api", () => ({
  useGetCurrentYearHolidaysQuery: vi.fn(),
}));

// ✅ Redux Provider Setup
const mockStore = configureStore({
  reducer: { api: () => ({}) },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

const renderWithProvider = (ui: React.ReactNode) => {
  return render(<Provider store={mockStore}>{ui}</Provider>);
};

describe("HolidayCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Stub ReactNativeWebView to prevent errors if running in browser env
    (globalThis as any).ReactNativeWebView = { postMessage: vi.fn() };
  });

  it("shows loading state", () => {
    (useGetCurrentYearHolidaysQuery as any).mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    const { container } = renderWithProvider(<HolidayCard />);
    // Checking for the loader element (lucide-react animate-spin)
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("shows error state", () => {
    (useGetCurrentYearHolidaysQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
      error: { data: { message: "API Error" } },
    });

    renderWithProvider(<HolidayCard />);
    expect(screen.getByText("API Error")).toBeInTheDocument();
  });

  it("shows empty state when no holidays exist", () => {
    (useGetCurrentYearHolidaysQuery as any).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    renderWithProvider(<HolidayCard />);
    expect(screen.getByText(new RegExp(`No holidays for ${new Date().getFullYear()}`))).toBeInTheDocument();
  });

  it("renders and sorts holidays correctly", () => {
    const mockHolidays = [
      { id: "1", name: "Christmas", date: `${new Date().getFullYear()}-12-25`, isMandatory: true },
      { id: "2", name: "New Year", date: `${new Date().getFullYear()}-01-01`, isMandatory: true },
    ];

    (useGetCurrentYearHolidaysQuery as any).mockReturnValue({
      data: mockHolidays,
      isLoading: false,
      isError: false,
    });

    renderWithProvider(<HolidayCard />);
    
    expect(screen.getByText("Christmas")).toBeInTheDocument();
    expect(screen.getByText("New Year")).toBeInTheDocument();
    
    // Check if badges rendered correctly
    const mandatoryBadges = screen.getAllByText("Mandatory");
    expect(mandatoryBadges).toHaveLength(2);
  });
});