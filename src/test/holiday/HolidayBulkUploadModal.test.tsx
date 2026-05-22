import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HolidayBulkUploadModal from "../../components/holiday/HolidayBulkUploadModal"; // Adjust path if needed
import { apiService } from "../../services/api";

// ✅ Mock the API service
vi.mock("../../services/api", () => ({
  apiService: {
    bulkUploadHolidays: vi.fn(),
  },
}));

describe("HolidayBulkUploadModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
  });

  it("renders nothing when isOpen is false", () => {
    const { container } = render(<HolidayBulkUploadModal {...defaultProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the modal when isOpen is true", () => {
    render(<HolidayBulkUploadModal {...defaultProps} />);
    expect(screen.getByText("Bulk Upload Holidays")).toBeInTheDocument();
    expect(screen.getByText("Download Template")).toBeInTheDocument();
  });

  it("triggers template download when Download Template is clicked", () => {
    render(<HolidayBulkUploadModal {...defaultProps} />);
    
    const downloadBtn = screen.getByText("Download Template");
    fireEvent.click(downloadBtn);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it("handles successful file upload", async () => {
    // Backend now returns the bare stats object — the interceptor passes it
    // through unchanged because there is no top-level `success` field.
    (apiService.bulkUploadHolidays as any).mockResolvedValue({
      totalRecords: 2,
      successfulImports: 2,
      failedImports: 0,
      duplicates: [],
      errors: [],
      summary: "Successfully imported 2 out of 2 records.",
    });

    render(<HolidayBulkUploadModal {...defaultProps} />);

    const file = new File(["Holiday Name,Date\nDiwali,2024-11-01"], "holidays.csv", { type: "text/csv" });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(apiService.bulkUploadHolidays).toHaveBeenCalled();
      expect(screen.getByText(/Upload Completed/i)).toBeInTheDocument();

      expect(screen.getByText("Total Records").previousSibling).toHaveTextContent("2");
      expect(screen.getByText("Successfully Imported").previousSibling).toHaveTextContent("2");
    });
  });

  it("surfaces backend error message when bulk upload is forbidden for super-admin", async () => {
    // Simulate the 403 forbidden shape thrown by the new v2 controller.
    const err = Object.assign(new Error("Request failed with status code 403"), {
      isAxiosError: true,
      name: "AxiosError",
      response: {
        status: 403,
        data: {
          message:
            "Super admin cannot bulk upload holidays. Please sign in as an organization admin.",
          error: "Forbidden",
        },
      },
    });
    (apiService.bulkUploadHolidays as any).mockRejectedValue(err);

    render(<HolidayBulkUploadModal {...defaultProps} />);

    const file = new File(
      ["Holiday Name,Date\nDiwali,2024-11-01"],
      "holidays.csv",
      { type: "text/csv" }
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, "files", { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      // "Upload Failed" header in the inline result card
      expect(screen.getByText(/Upload Failed/i)).toBeInTheDocument();
      // Message is rendered both in the inline card and the alert toast
      expect(
        screen.getAllByText(/Super admin cannot bulk upload holidays/i).length
      ).toBeGreaterThan(0);
    });
  });
});