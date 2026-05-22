import { useMemo } from 'react';
import moment from 'moment-timezone';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Hook for consistent timezone handling across the application
 * All conversions use IST (Asia/Kolkata) timezone
 * 
 * Usage:
 * const { formatDate, formatTime, formatDateTime, toUTC, toIST } = useTimezone();
 */
export function useTimezone() {
  const timezone = IST_TIMEZONE;

  const utils = useMemo(() => ({
    /**
     * Format UTC timestamp as IST date
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Formatted date like "21 Nov 2025"
     */
    formatDate: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).format('DD MMM YYYY');
      } catch {
        return 'Invalid Date';
      }
    },

    /**
     * Format UTC timestamp as IST time (12-hour format)
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Formatted time like "10:30 AM"
     */
    formatTime: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).format('hh:mm A');
      } catch {
        return 'Invalid Time';
      }
    },

    /**
     * Format UTC timestamp as IST time (24-hour format)
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Formatted time like "10:30"
     */
    formatTime24: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).format('HH:mm');
      } catch {
        return 'Invalid Time';
      }
    },

    /**
     * Format UTC timestamp as IST date and time
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Formatted datetime like "21 Nov 2025, 10:30 AM"
     */
    formatDateTime: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).format('DD MMM YYYY, hh:mm A');
      } catch {
        return 'Invalid DateTime';
      }
    },

    /**
     * Format UTC timestamp as IST date and time (24-hour)
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Formatted datetime like "21 Nov 2025, 10:30"
     */
    formatDateTime24: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).format('DD MMM YYYY, HH:mm');
      } catch {
        return 'Invalid DateTime';
      }
    },

    /**
     * Format UTC timestamp with custom format in IST
     * @param utcTimestamp - ISO string
     * @param format - moment format string (e.g., "DD/MM/YYYY", "YYYY-MM-DD HH:mm:ss")
     * @returns Formatted string
     */
    formatCustom: (utcTimestamp: string | null | undefined, format: string): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).format(format);
      } catch {
        return 'Invalid DateTime';
      }
    },

    /**
     * Format as relative time in IST (e.g., "2 hours ago", "in 3 days")
     * @param utcTimestamp - ISO string
     * @returns Relative time string
     */
    formatRelative: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return 'N/A';
      try {
        return moment(utcTimestamp).tz(timezone).fromNow();
      } catch {
        return 'Invalid DateTime';
      }
    },

    /**
     * Convert IST date and time to UTC ISO string (for API requests)
     * @param date - Date string like "2025-11-21"
     * @param time - Time string like "10:30" (HH:mm format)
     * @returns UTC ISO string like "2025-11-21T05:00:00.000Z"
     */
    toUTC: (date: string, time: string): string => {
      try {
        return moment.tz(
          `${date} ${time}:00`,
          'YYYY-MM-DD HH:mm:ss',
          timezone
        ).utc().toISOString();
      } catch {
        throw new Error('Invalid date or time format');
      }
    },

    /**
     * Convert IST date (midnight) to UTC ISO string
     * @param date - Date string like "2025-11-21"
     * @returns UTC ISO string like "2025-11-20T18:30:00.000Z"
     */
    dateToUTC: (date: string): string => {
      try {
        return moment.utc(date, "YYYY-MM-DD")
          .startOf("day")     // ensures 00:00:00.000
          .toISOString();
      } catch {
        throw new Error("Invalid date format");
      }
    },


    /**
     * Extract IST date from UTC timestamp (for editing)
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Date string like "2025-11-21"
     */
    extractDate: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return '';
      try {
        return moment(utcTimestamp).tz(timezone).format('YYYY-MM-DD');
      } catch {
        return '';
      }
    },

    /**
     * Extract IST time from UTC timestamp (for editing)
     * @param utcTimestamp - ISO string like "2025-11-21T05:00:00.000Z"
     * @returns Time string like "10:30" (HH:mm format)
     */
    extractTime: (utcTimestamp: string | null | undefined): string => {
      if (!utcTimestamp) return '';
      try {
        return moment(utcTimestamp).tz(timezone).format('HH:mm');
      } catch {
        return '';
      }
    },

    /**
     * Get start of month in IST as UTC ISO string
     * @param yearMonth - String like "2025-11" (YYYY-MM)
     * @returns UTC ISO string
     */
    getMonthStartUTC: (yearMonth: string): string => {
      try {
        return moment.tz(`${yearMonth}-01 00:00:00`, timezone)
          .utc()
          .toISOString();
      } catch {
        throw new Error('Invalid month format');
      }
    },

    /**
     * Get end of month in IST as UTC ISO string
     * @param yearMonth - String like "2025-11" (YYYY-MM)
     * @returns UTC ISO string
     */
    getMonthEndUTC: (yearMonth: string): string => {
      try {
        return moment.tz(yearMonth, 'YYYY-MM', timezone)
          .endOf('month')
          .utc()
          .toISOString();
      } catch {
        throw new Error('Invalid month format');
      }
    },

    /**
     * Get start of year in IST as UTC ISO string
     * @param year - String like "2025"
     * @returns UTC ISO string
     */
    getYearStartUTC: (year: string): string => {
      try {
        return moment.tz(`${year}-01-01 00:00:00`, timezone)
          .utc()
          .toISOString();
      } catch {
        throw new Error('Invalid year format');
      }
    },

    /**
     * Get end of year in IST as UTC ISO string
     * @param year - String like "2025"
     * @returns UTC ISO string
     */
    getYearEndUTC: (year: string): string => {
      try {
        return moment.tz(`${year}-12-31 23:59:59`, timezone)
          .utc()
          .toISOString();
      } catch {
        throw new Error('Invalid year format');
      }
    },

    /**
     * Get start of day in IST as UTC ISO string
     * @param date - Date string like "2025-11-21"
     * @returns UTC ISO string
     */
    getStartOfDayUTC: (date: string): string => {
      try {
        return moment.tz(`${date} 00:00:00`, timezone)
          .utc()
          .toISOString();
      } catch {
        throw new Error('Invalid date format');
      }
    },

    /**
     * Get end of day in IST as UTC ISO string
     * @param date - Date string like "2025-11-21"
     * @returns UTC ISO string
     */
    getEndOfDayUTC: (date: string): string => {
      try {
        return moment.tz(`${date} 23:59:59`, timezone)
          .utc()
          .toISOString();
      } catch {
        throw new Error('Invalid date format');
      }
    },

    /**
     * Get current time in IST as UTC ISO string
     * @returns UTC ISO string
     */
    nowUTC: (): string => {
      return moment().tz(timezone).utc().toISOString();
    },

    /**
     * Get current date in IST (YYYY-MM-DD format)
     * @returns Date string like "2025-11-21"
     */
    todayIST: (): string => {
      return moment().tz(timezone).format('YYYY-MM-DD');
    },

    /**
     * Get current time in IST (HH:mm format)
     * @returns Time string like "10:30"
     */
    currentTimeIST: (): string => {
      return moment().tz(timezone).format('HH:mm');
    },

    /**
     * Check if a UTC timestamp is in the past (IST)
     * @param utcTimestamp - ISO string
     * @returns boolean
     */
    isPast: (utcTimestamp: string): boolean => {
      try {
        return moment(utcTimestamp).tz(timezone).isBefore(moment().tz(timezone));
      } catch {
        return false;
      }
    },

    /**
     * Check if a UTC timestamp is in the future (IST)
     * @param utcTimestamp - ISO string
     * @returns boolean
     */
    isFuture: (utcTimestamp: string): boolean => {
      try {
        return moment(utcTimestamp).tz(timezone).isAfter(moment().tz(timezone));
      } catch {
        return false;
      }
    },

    /**
     * Check if a UTC timestamp is today (IST)
     * @param utcTimestamp - ISO string
     * @returns boolean
     */
    isToday: (utcTimestamp: string): boolean => {
      try {
        return moment(utcTimestamp).tz(timezone).isSame(moment().tz(timezone), 'day');
      } catch {
        return false;
      }
    },

    /**
     * Calculate difference between two UTC timestamps in specified unit
     * @param start - ISO string
     * @param end - ISO string
     * @param unit - 'days' | 'hours' | 'minutes' | 'seconds'
     * @returns Number
     */
    diff: (
      start: string,
      end: string,
      unit: 'days' | 'hours' | 'minutes' | 'seconds' = 'hours'
    ): number => {
      try {
        return moment(end).diff(moment(start), unit);
      } catch {
        return 0;
      }
    },

  }), [timezone]);

  return utils;
}

export default useTimezone;

