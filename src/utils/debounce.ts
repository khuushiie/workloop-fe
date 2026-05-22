import React from 'react';

/**
 * Debounce timing constants for search inputs across the application
 */
export const DEBOUNCE_DELAYS = {
  // Search inputs that trigger server-side API calls
  SEARCH: 500,
  
  // Filter changes that trigger server-side API calls
  FILTER: 300,
  
  // Auto-save or form validation
  AUTO_SAVE: 1000,
  
  // Real-time validation
  VALIDATION: 200,
} as const;

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
