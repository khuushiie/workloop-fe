import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { describe, it, expect } from "vitest";
import EmployeeProfile from "../../components/user-profile/EmployeeProfile";

describe("EmployeeProfile", () => {
  const mockData = {
    aadharCardNo: "1234-5678-9012",
    panCardNo: "ABCDE1234F",
    uanNumber: "100000000000",
    emergencyContact: {
      name: "Jane Doe",
      phone: "9876543210",
      relationshipName: "Spouse",
    },
    bankDetails: {
      bankName: "State Bank",
      branchName: "Main Branch",
      ifscCode: "SBIN0001234",
      accountHolderName: "John Doe",
      accountNumber: "1234567890",
    },
    educationDetails: [
      {
        institutionName: "MIT",
        discipline: { displayName: "Computer Science" },
        startDate: "2015-08-01",
        endDate: "2019-05-01",
        grade: "A",
      },
    ],
    previousEmployments: [
      {
        employerName: "Tech Corp",
        designation: { displayName: "Software Engineer" },
        annualCTC: "1000000",
        breakReason: "Career Growth",
      },
    ],
  };

  it("renders the General tab by default", () => {
    render(<EmployeeProfile data={mockData as any} />);
    
    // Check if tabs are rendered
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Bank Details")).toBeInTheDocument();
    
    // Check General content
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    expect(screen.getByText("Emergency Contact")).toBeInTheDocument();
    expect(screen.getByText("1234-5678-9012")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("switches to the Bank Details tab and displays data", () => {
    render(<EmployeeProfile data={mockData as any} />);
    
    const bankTab = screen.getByText("Bank Details");
    fireEvent.click(bankTab);
    
    expect(screen.getByText("SBIN0001234")).toBeInTheDocument();
    expect(screen.getByText("State Bank")).toBeInTheDocument();
  });

  it("switches to the Education Details tab and displays data", () => {
    render(<EmployeeProfile data={mockData as any} />);
    
    const eduTab = screen.getByText("Education Details");
    fireEvent.click(eduTab);
    
    expect(screen.getByText("Institution Name")).toBeInTheDocument();
    expect(screen.getByText("MIT")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
  });

  it("switches to the Previous Employement tab and displays data", () => {
    render(<EmployeeProfile data={mockData as any} />);
    
    const empTab = screen.getByText("Previous Employement");
    fireEvent.click(empTab);
    
    expect(screen.getByText("Employer Name")).toBeInTheDocument();
    expect(screen.getByText("Tech Corp")).toBeInTheDocument();
    expect(screen.getByText("1000000")).toBeInTheDocument();
  });

  it("renders '-' for missing data gracefully", () => {
    render(<EmployeeProfile data={{} as any} />);
    // Should render without crashing and show hyphens for missing fields
    expect(screen.getByText("Personal Information")).toBeInTheDocument();
    const hyphens = screen.getAllByText("-");
    expect(hyphens.length).toBeGreaterThan(0);
  });
});