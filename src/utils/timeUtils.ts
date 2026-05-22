export function convertUTCToIST(utcString: string) {
  const utcDate = new Date(utcString);
  const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

  const day = String(istDate.getDate()).padStart(2, "0");
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const year = istDate.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Format a date string from YYYY-MM-DD to dd/mm/yyyy
 * @param dateString - Date string in YYYY-MM-DD format (e.g., "2025-11-29")
 * @returns Formatted date string in dd/mm/yyyy format (e.g., "29/11/2025")
 */
export function formatDate(date: string) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Parse a date string (YYYY-MM-DD) as a local date, avoiding timezone issues
 * This ensures consistent behavior across different browsers and operating systems
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) {
    return new Date();
  }

  // Split the date string and parse as local date
  const [year, month, day] = dateString
    .split("-")
    .map((num) => parseInt(num, 10));

  // Month is 0-indexed in JavaScript Date
  return new Date(year, month - 1, day);
}

/**
 * Format a date string (YYYY-MM-DD) to a localized date string
 * Avoids timezone issues by parsing as local date first
 */
export function formatLocalDate(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseLocalDate(dateString);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options || defaultOptions);
}

/**
 * Format a time string (HH:MM) to a localized time string
 */
export function formatLocalTime(
  timeString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!timeString) {
    return "N/A";
  }

  // Create a date with the time on an arbitrary date to format it
  const [hours, minutes] = timeString
    .split(":")
    .map((num) => parseInt(num, 10));
  const date = new Date(2000, 0, 1, hours, minutes);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleTimeString("en-US", options || defaultOptions);
}

/**
 * Format a full ISO datetime string to a localized date string
 * Useful for timestamps like appliedDate
 */
export function formatISODate(
  isoString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!isoString) {
    return "N/A";
  }

  const date = new Date(isoString);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options || defaultOptions);
}

/**
 * Format a full ISO datetime string to a localized datetime string
 */
export function formatISODateTime(isoString: string): string {
  if (!isoString) {
    return "N/A";
  }

  const date = new Date(isoString);

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const datePart = date.toLocaleDateString("en-US", dateOptions);
  const timePart = date.toLocaleTimeString("en-US", timeOptions);

  return `${datePart} at ${timePart}`;
}
