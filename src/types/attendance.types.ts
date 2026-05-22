/**
 * Calendar day data returned by GET /v2/attendance/calendar
 */
export interface ICalendarDayData {
  day: number;
  date: string;
  status: string;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
  isHoliday?: boolean;
  holidayName?: string;
}
