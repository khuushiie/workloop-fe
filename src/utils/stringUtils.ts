/**
 * Checks if a value is valid (not null, undefined, or an empty string).
 * @param value - The value to check (string, number, or null/undefined)
 * @param fallback - The string to return if the value is invalid (default: "-")
 * @returns The original string value if valid, otherwise the fallback
 */
export const formatDisplayValue = (
  value: string | number | null | undefined,
  fallback: string = "-"
): string => {
  if (value === null || value === undefined) return fallback;
  
  const stringValue = String(value).trim();
  return stringValue !== "" ? stringValue : fallback;
};
