import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi } from "vitest";
import EmployeeTableSection, { getEmployeeStatusIcon } from "../../../components/employees/components/EmployeeTableSection";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";

// Mock Table and Pagination
vi.mock("../../../components/common/Table", () => ({
  default: () => <div data-testid="mock-table">Table</div>
}));
vi.mock("../../../components/common/Pagination", () => ({
  default: () => <div data-testid="mock-pagination">Pagination</div>
}));
vi.mock("../../../components/common", () => ({
  SimpleTooltip: ({ children }: any) => <div data-testid="mock-tooltip">{children}</div>
}));

describe("EmployeeTableSection", () => {
  describe("getEmployeeStatusIcon", () => {
    it("returns correct icons for statuses", () => {
      expect(getEmployeeStatusIcon("active")).toBe(CheckCircle);
      expect(getEmployeeStatusIcon("inactive")).toBe(XCircle);
      expect(getEmployeeStatusIcon("terminated")).toBe(XCircle);
      expect(getEmployeeStatusIcon("unknown")).toBe(MinusCircle);
      expect(getEmployeeStatusIcon(undefined)).toBe(MinusCircle);
    });
  });

  const defaultProps = {
    employees: [],
    loading: false,
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 50,
    onPageChange: vi.fn(),
    onItemsPerPageChange: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canManage: true,
  };

  it("renders the table header with total items", () => {
    render(<EmployeeTableSection {...defaultProps} />);
    expect(screen.getByText("Employees (50)")).toBeInTheDocument();
    expect(screen.getByTestId("mock-table")).toBeInTheDocument();
  });

  it("renders pagination when totalItems is greater than 0", () => {
    render(<EmployeeTableSection {...defaultProps} totalItems={10} />);
    expect(screen.getByTestId("mock-pagination")).toBeInTheDocument();
  });

  it("hides pagination when totalItems is 0", () => {
    render(<EmployeeTableSection {...defaultProps} totalItems={0} />);
    expect(screen.queryByTestId("mock-pagination")).not.toBeInTheDocument();
  });
});