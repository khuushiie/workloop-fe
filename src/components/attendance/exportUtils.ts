import * as XLSX from "xlsx";
import { AttendanceRecord, LeaveRequest, Employee, AttendanceFilters } from "./types";
import { 
  getMonthName, 
  getDaysInMonth, 
  generateAttendanceTable, 
  calculateEmployeeSummary 
} from "./utils";

interface ExportAttendanceData {
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  filters: AttendanceFilters;
  isAdmin?: boolean;
  currentUser?: { id: string; name: string; department?: string };
  companyName?: string;
}

export const exportAttendanceToXLSX = ({
  attendanceRecords,
  leaveRequests,
  employees,
  filters,
  isAdmin = false,
  currentUser,
  companyName = "Stackmentalist Ventures Pvt. Ltd."
}: ExportAttendanceData) => {
  const daysInMonth = getDaysInMonth(filters.year, filters.month);
  const monthName = getMonthName(filters.month);
  const totalDaysInMonth = daysInMonth;

  // Generate attendance data
  const employeeAttendance = generateAttendanceTable(
    attendanceRecords,
    leaveRequests,
    filters,
    employees
  );
  const worksheetData = [];

  // Add company header
  if (isAdmin) {
    worksheetData.push([companyName]);
    worksheetData.push([
      `Attendance Report for the month - ${monthName}-${filters.year}`,
    ]);
  } else {
    worksheetData.push(["ATTENDANCE REPORT"]);
    worksheetData.push([`${monthName} ${filters.year}`]);
  }
  worksheetData.push([]);
  
  // Add note about partial days
  worksheetData.push([
    "Note: Leave status (EL/SL/LWP/WFH) with time information indicates the employee worked part of the day before taking leave."
  ]);
  worksheetData.push([
    "Note: Employees working less than 4 hours without leave are marked as 'Absent'. If leave is applied for the same day, they are marked as 'Leave'."
  ]);
  worksheetData.push([
    "Note: Break hours are always displayed with proper labels, even when they are 0.00h, ensuring complete daily information."
  ]);
  worksheetData.push([]);

  // Add headers
  const headers = [
    "Serial No.",
    "Employee Name",
    "Department",
    ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
    "Total Days",
    "Present Days",
    "Absent Days",
    "Leave Days",
    "Total Work Hours",
    "Total Break Hours",
    "Net Work Hours",
    "Summary",
  ];
  worksheetData.push(headers);

  // Add employee data
  if (isAdmin) {
    let serialNo = 1;
    employees.forEach((employee) => {
      if (filters.department && employee.department !== filters.department)
        return;
      if (filters.employeeId && employee._id !== filters.employeeId) return;
      if (filters.isActive && filters.isActive !== "all") {
        const status = employee.status || "active";
        if (filters.isActive === "active" && status !== "active") return;
        if (filters.isActive === "inactive" && status !== "inactive") return;
      }

      const attendance = employeeAttendance[employee._id] || {};
      const summary = calculateEmployeeSummary(
        employee._id,
        attendanceRecords,
        leaveRequests,
        filters
      );

      // Calculate summary: Total - Absent
      const summaryValue = totalDaysInMonth - summary.absentDays;

      const row = [
        serialNo.toString(),
        employee.name,
        employee.department,
        ...Array.from({ length: daysInMonth }, (_, i) => {
          const day = (i + 1).toString();
          return attendance[day] || "";
        }),
        totalDaysInMonth.toString(),
        summary.presentDays.toString(),
        summary.absentDays.toString(),
        summary.leaveDays.toString(),
        summary.totalWorkHours.toString(),
        summary.totalBreakHours.toString(),
        summary.netWorkHours.toString(),
        summaryValue.toString(),
      ];

      worksheetData.push(row);
      serialNo++;
    });
  } else if (currentUser) {
    // For user view, only export current user's data
    const attendance = employeeAttendance[currentUser.id] || {};
    const summary = calculateEmployeeSummary(
      currentUser.id,
      attendanceRecords,
      leaveRequests,
      filters
    );

    // Calculate summary: Total - Absent
    const summaryValue = totalDaysInMonth - summary.absentDays;

    const row = [
      "1",
      currentUser.name,
      currentUser.department,
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString();
        return attendance[day] || "";
      }),
      totalDaysInMonth.toString(),
      summary.presentDays.toString(),
      summary.absentDays.toString(),
      summary.leaveDays.toString(),
      summary.totalWorkHours.toString(),
      summary.totalBreakHours.toString(),
      summary.netWorkHours.toString(),
      summaryValue.toString(),
    ];

    worksheetData.push(row);
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = [
    { wch: 10 }, // Serial No.
    { wch: 25 }, // Employee Name
    { wch: 15 }, // Department
    ...Array.from({ length: daysInMonth }, () => ({ wch: 5 })), // Day columns
    { wch: 10 }, // Total Days
    { wch: 12 }, // Present Days
    { wch: 12 }, // Absent Days
    { wch: 12 }, // Leave Days
    { wch: 15 }, // Total Work Hours
    { wch: 15 }, // Total Break Hours
    { wch: 15 }, // Net Work Hours
    { wch: 12 }, // Summary
  ];
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance Report");

  // Generate and download file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = isAdmin 
    ? `attendance_report_${monthName}_${filters.year}.xlsx`
    : `my_attendance_report_${monthName}_${filters.year}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};
