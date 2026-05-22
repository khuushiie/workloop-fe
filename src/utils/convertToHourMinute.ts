export function convertToHourMinute(decimalHours: number): string {
  if (!Number.isFinite(decimalHours) || decimalHours < 0) {
    return "0.00";
  }

  const totalMinutes = Math.round(decimalHours * 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}.${minutes.toString().padStart(2, "0")}`;
}

/**
 * Converts decimal minutes (e.g., 90.5 = 90 min 30 sec) to "hours.minutes" display format.
 * Use when backend sends totalBreakHours in minutes instead of hours.
 */
export function convertMinutesToHourMinute(decimalMinutes: number): string {
  if (!Number.isFinite(decimalMinutes) || decimalMinutes < 0) {
    return "0.00";
  }

  const totalMinutes = Math.round(decimalMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}.${minutes.toString().padStart(2, "0")}`;
}

export function formatBreakHoursForDisplay(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0.00";
  return value >= 24 ? convertMinutesToHourMinute(value) : convertToHourMinute(value);
}
