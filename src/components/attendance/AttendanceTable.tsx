import React from "react";
import { Calendar, Download, FileText, Loader2 } from "lucide-react";
import {
  AttendanceTableProps,
  UserAttendanceData,
  AttendanceSummary,
  AttendanceRecord,
} from "./types";
import {
  getStatusColor,
  getDaysInMonth,
  getMonthName,
  isHalfDayStatus,
} from "./utils";
import AttendanceTooltip from "./AttendanceTooltip";
import Pagination from "../common/Pagination";
import { EmployeeStatusEnum } from "../../utils/constants";
import { Button } from "../common";
import ExcelIcon from "../../icons/ExcelIcon";
import {
  convertToHourMinute,
  formatBreakHoursForDisplay,
} from "../../utils/convertToHourMinute";
import { isWeekOffDay } from "../../utils/weekOff";
import { useAppSelector } from "../../store/hooks";

interface AttendanceTableComponentProps extends AttendanceTableProps {
  currentUser?: UserAttendanceData;
  onExport?: () => void;
  isExporting?: boolean;
}

const formatUserName = (user: UserAttendanceData): string => {
  if (user.name?.trim()) return user.name.trim();

  const parts = [user.firstName, user.lastName]
    .map((value) => value?.trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" ");

  if (user.workEmail) {
    const [username] = user.workEmail.split("@");
    if (username) return username;
    return user.workEmail;
  }

  return "Unknown Employee";
};

const getUserMeta = (
  user: UserAttendanceData
): { hasMeta: boolean; node: React.ReactNode } => {
  const code = user.employeeId?.trim();
  const department = user.department?.trim();
  const hasMeta = Boolean(code || department);

  if (!hasMeta) {
    return { hasMeta: false, node: null };
  }

  return {
    hasMeta: true,
    node: (
      <>
        {code}
        {code && department && (
          <span className="mx-1 text-slate-400" aria-hidden="true">
            &bull;
          </span>
        )}
        {department}
      </>
    ),
  };
};

const AttendanceTable: React.FC<AttendanceTableComponentProps> = ({
  users,
  holidays = [],
  filters,
  loading,
  isAdmin = false,
  currentUser,
  pagination,
  onPageChange,
  onItemsPerPageChange,
  onExport,
  isExporting = false,
}) => {
  const weekOffConfig = useAppSelector(
    (state) => state.auth.weekOffConfig,
  );
  const daysInMonth = getDaysInMonth(filters.year, filters.month);
  // All filtering (search, department, status) is handled server-side
  // Use users array if available, otherwise fall back to currentUser
  const usersToFilter =
    users.length > 0 ? users : currentUser ? [currentUser] : [];

  // Only filter out inactive users without attendance data (UI convenience)
  const filteredUsers = usersToFilter.filter((user) => {
    const status = (user.status || EmployeeStatusEnum.ACTIVE).toLowerCase();
    const isInactive =
      status === EmployeeStatusEnum.INACTIVE ||
      status === EmployeeStatusEnum.TERMINATED;

    // For active users, always show
    if (!isInactive) {
      return true;
    }

    // For inactive users, show them only if they have attendance data
    const hasAnyMarkedDay = Object.values(user.attendanceStatus || {}).some(
      Boolean
    );
    return hasAnyMarkedDay;
  });

  const fallbackLimit = filteredUsers.length || 1;
  const currentPage = Math.max(pagination?.page ?? 1, 1);
  const itemsPerPage = pagination?.limit ?? fallbackLimit;
  const totalUsersCount = isAdmin
    ? pagination?.total ?? filteredUsers.length
    : filteredUsers.length;
  const MIN_USERS_FOR_PAGINATION = 5;
  const shouldShowPagination =
    isAdmin &&
    totalUsersCount >= MIN_USERS_FOR_PAGINATION &&
    !!pagination &&
    typeof onPageChange === "function" &&
    typeof onItemsPerPageChange === "function";

  // Show NM only for past days in the selected month/year
  const isPastDayInSelectedMonth = (
    year: number,
    month: number,
    day: number
  ): boolean => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // 1-based
    const currentDay = today.getDate();

    if (year < currentYear) return true;
    if (year > currentYear) return false;
    if (month < currentMonth) return true;
    if (month > currentMonth) return false;
    return day < currentDay;
  };

  const isHoliday = (year: number, month: number, day: number): boolean => {
    const formatDate = (y: number, m: number, d: number): string => {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    };
    const dateString = formatDate(year, month, day);

    return holidays.some((holiday) => {
      if (!holiday.isMandatory) return false;
      const holidayDate = new Date(holiday.date);
      const holidayYear = holidayDate.getFullYear();
      const holidayMonth = holidayDate.getMonth() + 1;
      const holidayDay = holidayDate.getDate();
      const holidayDateString = formatDate(
        holidayYear,
        holidayMonth,
        holidayDay
      );
      return holidayDateString === dateString;
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        <div className="p-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Attendance Report - {getMonthName(filters.month)} {filters.year}
          </h2>
        </div>
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary-600" />
          <p className="mt-2 text-slate-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-soft border border-slate-200">
        <div className="p-3 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Attendance Report - {getMonthName(filters.month)} {filters.year}
          </h2>
        </div>
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-slate-500">
            {isAdmin
              ? "No employees found for the selected filters"
              : "No user data available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-soft border border-slate-200">
      <div className="p-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            {isAdmin || users.length > 0
              ? "Attendance Report"
              : "My Attendance Report"}{" "}
            - {getMonthName(filters.month)} {filters.year}
          </h2>

          {onExport && (
            <button
              onClick={onExport}
              disabled={loading || isExporting}
              className="
    bg-transparent
    border-0
    p-0
    cursor-pointer
    flex
    items-center
    gap-2
    disabled:opacity-50
  "
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              ) : (
                <ExcelIcon />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 z-10">
                Employee
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const currentDate = new Date(
                  filters.year,
                  filters.month - 1,
                  day
                );
                const dayName = currentDate.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const isOrgWeekOffDay = weekOffConfig
                  ? isWeekOffDay(filters.year, filters.month, day, weekOffConfig)
                  : false;
                const isHolidayDay = isHoliday(
                  filters.year,
                  filters.month,
                  day
                );
                return (
                  <th
                    key={day}
                    className={`px-6 py-3 text-center text-xs font-medium uppercase tracking-wider relative ${isHolidayDay
                        ? "text-orange-600 border-l-2 border-r-2 border-orange-300"
                        : isOrgWeekOffDay
                        ? "text-primary-600 border-l-2 border-r-2 border-primary-300"
                        : "text-slate-500"
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span
                        className={`font-semibold ${
                          isOrgWeekOffDay ? "text-primary-700" : ""
                        } ${isHolidayDay ? "text-orange-700" : ""}`}
                      >
                        {day}
                      </span>
                      <span
                        className={`text-xs font-normal mt-1 text-primary-500 text-uppercase ${
                          isOrgWeekOffDay ? "text-primary-700" : ""
                        } ${isHolidayDay ? "text-orange-700" : ""
                        }`}
                      >
                        {dayName}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Days
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Present
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Absent
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Leave
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Work Hours
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Break Hours
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Net Work Hours
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                Summary
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredUsers.map((user) => {
              // Get attendance status and summary directly from the user object
              const attendance = user.attendanceStatus || {};
              const summary: AttendanceSummary = user.summary || {
                totalDays: daysInMonth,
                presentDays: 0,
                absentDays: 0,
                halfDays: 0,
                leaveDays: 0,
                totalLeaves: 0,
                totalWorkHours: 0,
                totalBreakHours: 0,
                netWorkHours: 0,
              };

              // Calculate summary: Total - Absent
              const summaryValue = daysInMonth - summary.absentDays;

              const { hasMeta, node } = getUserMeta(user);

              return (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {formatUserName(user)}
                      </div>
                      {hasMeta && (
                        <div className="text-xs text-slate-500">{node}</div>
                      )}
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = (i + 1).toString();
                    const dayNumber = i + 1;
                    const status = attendance[day] || "";
                    const currentDate = new Date(
                      filters.year,
                      filters.month - 1,
                      dayNumber
                    );
                    const isOrgWeekOffDay = weekOffConfig
                      ? isWeekOffDay(filters.year, filters.month, dayNumber, weekOffConfig)
                      : false;
                    const isHolidayDay = isHoliday(
                      filters.year,
                      filters.month,
                      dayNumber
                    );

                    // Find the attendance record for this day from user's embedded records
                    const dayRecord = user.attendanceRecords?.find(
                      (record: AttendanceRecord) =>
                        new Date(record.date).getDate() === dayNumber
                    );

                    // Check if this is a half-day leave (e.g., P/EL, HD/SL)
                    const isHalfDayLeave = isHalfDayStatus(status);

                    // Check if this is a full-day leave with attendance record (partial day work)
                    const isLeaveWithAttendance =
                      dayRecord &&
                      !isHalfDayLeave &&
                      (status === "EL" ||
                        status === "SL" ||
                        status === "LWP" ||
                        status === "WFH");

                    // Check if this is marked as absent due to 4-hour rule
                    const isAbsentDueTo4HourRule =
                      status === "A" &&
                      dayRecord &&
                      dayRecord.totalWorkHours !== undefined &&
                      dayRecord.totalWorkHours < 4;

                    return (
                      <td
                        key={dayNumber}
                        className={`px-6 py-4 whitespace-nowrap text-center ${
                          isOrgWeekOffDay
                            ? "text-primary-600 border-l-2 border-r-2 border-primary-300"
                            : isHolidayDay
                            ? "text-orange-600 border-l-2 border-r-2 border-orange-300"
                            : "text-slate-500"
                        }`}
                      >
                        {/* //-----------------------------------status----------------- */}
                        {status ? (
                          <AttendanceTooltip
                            dayRecord={dayRecord}
                            status={status}
                          >
                            <div className="flex flex-col items-center space-y-1 group cursor-pointer">
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-all duration-200 group-hover:shadow-md ${getStatusColor(
                                  status.toLowerCase()
                                )}`}
                              >
                                {status}
                              </span>
                              {isHalfDayLeave && (
                                <div className="text-xs text-primary-600 italic">
                                  Half day
                                </div>
                              )}
                              {isLeaveWithAttendance && !isHalfDayLeave && (
                                <div className="text-xs text-slate-500 italic">
                                  Partial day
                                </div>
                              )}
                              {isAbsentDueTo4HourRule && (
                                <div className="text-xs text-red-500 italic">
                                  &lt;4h work
                                </div>
                              )}
                              {dayRecord &&
                                (dayRecord.checkInTime ||
                                  dayRecord.checkOutTime) && (
                                  <div className="w-1 h-1 bg-slate-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                )}
                            </div>
                          </AttendanceTooltip>
                        ) : isHolidayDay ? (
                          <AttendanceTooltip
                            dayRecord={dayRecord}
                            status={"Holiday"}
                          >
                            <div className="flex flex-col items-center">
                              <span className="px-2 py-1 text-xs rounded-full font-medium transition-all duration-200 group-hover:shadow-md text-orange-600">
                                HL
                              </span>
                            </div>
                          </AttendanceTooltip>
                        ) : isOrgWeekOffDay ? (
                          <AttendanceTooltip
                            dayRecord={dayRecord}
                            status={"Holiday"}
                          >
                            <div className="flex flex-col items-center">
                              <span
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-all duration-200 group-hover:shadow-md text-orange-600}`}
                              >
                                HL
                              </span>
                            </div>
                          </AttendanceTooltip>
                        ) : isPastDayInSelectedMonth(
                          filters.year,
                          filters.month,
                          dayNumber
                        ) ? (
                          <AttendanceTooltip
                            dayRecord={dayRecord}
                            status={"NM"}
                          >
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium transition-all duration-200 group-hover:shadow-md ${getStatusColor(
                                "NM"
                              )}`}
                            >
                              NM
                            </span>
                          </AttendanceTooltip>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center font-medium">
                    {daysInMonth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                    {summary.presentDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                    {summary.absentDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center">
                    {summary.leaveDays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center font-medium">
                    {summary.totalWorkHours > 0 ? (
                      <span className="text-green-600 font-semibold">
                        {convertToHourMinute(summary?.totalWorkHours || 0)}hr
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center font-medium">
                    {summary.totalBreakHours !== undefined ? (
                      <span
                        className={`font-semibold ${summary.totalBreakHours > 0
                            ? "text-orange-600"
                            : "text-slate-500"
                        }`}
                      >
                        {formatBreakHoursForDisplay(summary?.totalBreakHours || 0)}hr
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center font-medium">
                    {summary.netWorkHours > 0 ? (
                      <span className="text-purple-600 font-semibold">
                        {convertToHourMinute(summary?.netWorkHours || 0)}hr
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-center font-medium">
                    {summaryValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {shouldShowPagination && pagination && (
        <div className="border-t border-slate-200">
          <Pagination
            currentPage={currentPage}
            totalItems={totalUsersCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            className="border-0 shadow-none p-0"
            itemsPerPageOptions={[5, 10, 20, 50, 100]}
          />
        </div>
      )}
      {(isAdmin || users.length > 0) &&
        !shouldShowPagination &&
        totalUsersCount > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 text-sm text-slate-600">
            Showing all {totalUsersCount} employees
          </div>
        )}
    </div>
  );
};

export default AttendanceTable;
