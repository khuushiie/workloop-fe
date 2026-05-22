import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import EmployeeStatsCards from "../../../components/employees/components/EmployeeStatsCards";

describe("EmployeeStatsCards", () => {
  const mockStats = {
    total: 150,
    active: 145,
    departments: 12,
    newThisMonth: 5,
  };

  it("renders all four stat cards with correct labels", () => {
    render(<EmployeeStatsCards stats={mockStats} />);
    
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
    expect(screen.getByText("Active Employees")).toBeInTheDocument();
    expect(screen.getByText("Departments")).toBeInTheDocument();
    expect(screen.getByText("New This Month")).toBeInTheDocument();
  });

  it("renders the correct values from the stats prop", () => {
    render(<EmployeeStatsCards stats={mockStats} />);
    
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("145")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});