import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  useGetCalendarDataQuery,
  type ICalendarDay,
} from "../../store/apis/attendance.api";
import { useAppSelector } from "../../store/hooks";
import { useAuth } from "../../store/hooks/useAuth";
import { isWeekOffDay } from "../../utils/weekOff";
import {
  getStatusColor,
  getMonthName,
  getStatusTextColor,
  getDaysInMonth,
} from "../attendance/utils";
import AttendanceTooltip from "../attendance/AttendanceTooltip";

const ATTENDANCE_STATUS = {
  PRESENT: "P",
  ABSENT: "A",
  HALF_DAY: "HD",
  HOLIDAY: "HL",
  PRESENT_FULL: "PRESENT",
  ABSENT_FULL: "ABSENT",
  HALF_DAY_FULL: "HALF_DAY",
  HOLIDAY_FULL: "HOLIDAY",
  OPTIONAL_HOLIDAY: "OH",
  OPTIONAL_HOLIDAY_FULL: "OPTIONAL_HOLIDAY",
} as const;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const STATUS_SEPARATOR = "/";

const MyCalendar: React.FC = () => {
  const { user } = useAuth();
  const weekOffConfig = useAppSelector(
    (state) => state.auth.weekOffConfig,
  );
  const [currentDate, setCurrentDate] = useState(new Date());

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const {
    data: calendarData,
    isFetching: loading,
    isError: hasError,
    error,
  } = useGetCalendarDataQuery(
    { month, year, userId: user?.id },
    { skip: !user?.id }
  );

  const calendarPayload = calendarData?.data;

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month, 1));
  };

  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = getDaysInMonth(year, month);
  const monthName = getMonthName(month);

  const isOptionalHoliday = (date: string): boolean => {
    return Boolean(
      calendarPayload?.holidays?.some(
        (h) => h.date?.startsWith(date) && !h.isMandatory
      )
    );
  };

  const getDayData = (day: number): ICalendarDay | undefined => {
    return calendarPayload?.days?.find((d) => d.day === day);
  };

  const getStatusLabel = (status: string): string => {
    if (!status) return "";

    if (status.includes(STATUS_SEPARATOR)) {
      const [first, second] = status.split(STATUS_SEPARATOR);
      return second || first;
    }

    const upperStatus = status.toUpperCase();
    if (
      upperStatus === ATTENDANCE_STATUS.PRESENT ||
      upperStatus === ATTENDANCE_STATUS.PRESENT_FULL
    ) {
      return ATTENDANCE_STATUS.PRESENT;
    }
    if (
      upperStatus === ATTENDANCE_STATUS.ABSENT ||
      upperStatus === ATTENDANCE_STATUS.ABSENT_FULL
    ) {
      return ATTENDANCE_STATUS.ABSENT;
    }
    if (
      upperStatus === ATTENDANCE_STATUS.HALF_DAY ||
      upperStatus === ATTENDANCE_STATUS.HALF_DAY_FULL
    ) {
      return ATTENDANCE_STATUS.HALF_DAY;
    }
    if (
      upperStatus === ATTENDANCE_STATUS.HOLIDAY ||
      upperStatus === ATTENDANCE_STATUS.HOLIDAY_FULL
    ) {
      return ATTENDANCE_STATUS.HOLIDAY;
    }
    if(
      upperStatus === ATTENDANCE_STATUS.OPTIONAL_HOLIDAY ||
      upperStatus === ATTENDANCE_STATUS.OPTIONAL_HOLIDAY_FULL
    ) {
      return ATTENDANCE_STATUS.OPTIONAL_HOLIDAY;
    }
    return upperStatus;
  };

  const getCellColor = (status: string, isHoliday?: boolean): string => {

    if (isHoliday || status === ATTENDANCE_STATUS.HOLIDAY || status === "HL") {

      return "bg-orange-100 text-orange-800";
    }

    if (!status) {
      return "bg-slate-100 text-slate-600";
    }
    return getStatusColor(status);
  };

  const getStatusLabelColor = (status: string, statusLabel: string): string => {
    if (!statusLabel) return "text-slate-800";
    const statusToUse =
      statusLabel !== status && status.includes(STATUS_SEPARATOR)
        ? statusLabel
        : status;
    return getStatusTextColor(statusToUse);
  };

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() + 1 &&
      year === today.getFullYear()
    );
  };

  const isFutureDate = (day: number): boolean => {
    const today = new Date();
    const currentDay = new Date(year, month - 1, day);
    return currentDay > today;
  };

  if (hasError) {
    const errorMessage =
      (error && typeof error === "object" && "data" in error && (error.data as { message?: string })?.message) ||
      "Failed to load calendar data";
    return (
      <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:px-6 md:py-4 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-primary-600" />
          My Calendar
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="mb-2 rounded transition-colors flex items-center"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 ml-6" />
          </button>
          <h3 className="text-base sm:text-lg text-center font-bold text-slate-900">
            {monthName.slice(0, 3)} {year}
          </h3>
          <button
            onClick={goToNextMonth}
            className="mb-2 rounded transition-colors flex items-center "
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="text-xs sm:text-sm font-medium text-slate-600 text-center py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="aspect-square">
                <div className="w-full h-full bg-slate-200 animate-shimmer bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:1000px_100%] rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayData = getDayData(day);
              const today = isToday(day);
              const isFuture = isFutureDate(day)
              const OptionalHoliday = dayData
                ? isOptionalHoliday(dayData.date)
                : null;

              const backendMarkedWeekOff = !!(dayData?.isHoliday && dayData.status === "HL");
              const isOrgWeekOffDay = weekOffConfig
                ? isWeekOffDay(year, month, day, weekOffConfig)
                : backendMarkedWeekOff;

              let status = "";
              if (dayData?.isHoliday) {
                const canMark = !isFuture;
                status =
                  dayData.status ||
                  (canMark ? (OptionalHoliday ? "NM" : "HL") : "");
              } else if (dayData?.status) {
                status = dayData.status;
              } else if (isFuture || isOrgWeekOffDay) {
                status = "";
              } else {
                status = "NM";
              }
              const statusLabel = getStatusLabel(status);
              const isMandatoryHoliday =
                (dayData?.isHoliday && !OptionalHoliday) || isOrgWeekOffDay;
              const cellColor = getCellColor(status, isMandatoryHoliday);
              const dayRecord =
                dayData &&
                  (dayData.checkInTime ||
                    dayData.checkOutTime ||
                    dayData.isHoliday)
                  ? {
                    date: dayData.date,
                    checkInTime: dayData.checkInTime,
                    checkOutTime: dayData.checkOutTime,
                    totalBreakHours: 0,
                    netWorkHours: 0,
                    notes: dayData.isHoliday
                      ? dayData.holidayName
                      : dayData.notes,
                  }
                  : undefined;

              const finalBgColor = status
                ? cellColor
                : isOrgWeekOffDay
                  ? "bg-violet-50"
                  : isFuture
                    ? "bg-slate-100 text-slate-600"
                    : "bg-white";

              return (
                <AttendanceTooltip
                  key={day}
                  dayRecord={dayRecord}
                  status={status}
                >
                  <div
                    className={`aspect-square relative ${finalBgColor} ${today ? "ring-2 ring-primary-500" : ""
                      } rounded transition-all cursor-pointer hover:shadow-soft w-full h-full flex flex-col items-center justify-center p-1`}
                  >
                    <span
                      className={`text-xs sm:text-sm font-medium ${today
                        ? "text-primary-700 font-bold"
                        : isOrgWeekOffDay
                          ? "text-violet-800"
                          : "text-slate-700"
                        }`}
                    >
                      {day}
                    </span>

                    {statusLabel && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-bold mt-0.5 px-0.5 ${getStatusLabelColor(
                          status,
                          statusLabel
                        )}`}
                      >
                        {statusLabel}
                      </span>
                    )}
                  </div>
                </AttendanceTooltip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const CalendarCardSkeleton: React.FC = () => {
  const ShimmerBlock = ({ className = "" }: { className?: string }) => (
    <div
      className={`
        bg-slate-200 
        animate-shimmer 
        bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] 
        bg-[length:1000px_100%] 
        rounded 
        ${className}
      `}
    />
  );

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-soft border border-slate-200 p-3 sm:p-4 md:p-6 h-80 sm:h-[22rem] md:h-[24rem] 2xl:h-[28rem] flex flex-col">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-5 h-5 rounded" />
          <ShimmerBlock className="h-6 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <ShimmerBlock className="w-6 h-6 rounded" />
          <ShimmerBlock className="h-6 w-12 rounded" />
          <ShimmerBlock className="w-6 h-6 rounded" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-2">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {Array.from({ length: 7 }).map((_, index) => (
            <ShimmerBlock key={index} className="h-5 w-full" />
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="aspect-square">
              <ShimmerBlock className="w-full h-full rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyCalendar;
