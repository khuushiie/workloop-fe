export interface WeekOffRule {
  weekday: number; // Luxon convention: 1 = Mon … 7 = Sun
  pattern: "EVERY" | "NTH";
  occurrences?: number[];
}

export interface WeekOffConfig {
  rules: WeekOffRule[];
  label?: string;
  effectiveFrom?: string;
}

export interface WeekOffConfigHistoryEntry {
  id: string;
  rules: WeekOffRule[];
  label?: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  changedBy: string;
  changeReason?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export const DEFAULT_WEEK_OFF_CONFIG: WeekOffConfig = {
  rules: [
    { weekday: 7, pattern: "EVERY" },
    { weekday: 6, pattern: "NTH", occurrences: [2] },
  ],
  label: "Week off",
};

/**
 * Return the 1-based occurrence of the given weekday in the month.
 * E.g. day = 11 → 2nd occurrence → returns 2.
 */
function nthOccurrenceInMonth(day: number): number {
  return Math.ceil(day / 7);
}

/**
 * Convert JS Date.getDay() (0 = Sun) to Luxon weekday (1 = Mon … 7 = Sun).
 */
function jsWeekdayToLuxon(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * Check whether a JS Date falls on an org-configured week-off.
 * Uses the date as-is (no timezone conversion); the caller should
 * construct the Date in the intended timezone context.
 */
export function isWeekOffDate(
  date: Date,
  config: WeekOffConfig | null | undefined,
): boolean {
  const effective =
    config?.rules?.length ? config : DEFAULT_WEEK_OFF_CONFIG;
  const weekday = jsWeekdayToLuxon(date.getDay());
  const day = date.getDate();

  for (const rule of effective.rules) {
    if (rule.weekday !== weekday) continue;
    if (rule.pattern === "EVERY") return true;
    if (rule.pattern === "NTH" && rule.occurrences?.length) {
      const nth = nthOccurrenceInMonth(day);
      if (rule.occurrences.includes(nth)) return true;
    }
  }

  return false;
}

/**
 * Convenience: Check whether a given dayjs-compatible date is a week-off.
 * Accepts year, month (1-based), day.
 */
export function isWeekOffDay(
  year: number,
  month: number,
  day: number,
  config: WeekOffConfig | null | undefined,
): boolean {
  return isWeekOffDate(new Date(year, month - 1, day), config);
}
