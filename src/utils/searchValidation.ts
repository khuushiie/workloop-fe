import { SearchValidationOptions } from '../components/common/GenericSearch';

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,
  ALPHANUMERIC_WITH_SPACES: /^[A-Za-z0-9\s]+$/,
  LETTERS_ONLY: /^[A-Za-z]+$/,
  LETTERS_WITH_SPACES: /^[A-Za-z\s]+$/,
  NUMBERS_ONLY: /^\d+$/,
  NO_SPECIAL_CHARS: /^[A-Za-z0-9\s]+$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  USERNAME: /^[A-Za-z0-9_.-]+$/,
  PRODUCT_CODE: /^[A-Z0-9-]+$/,
  EMPLOYEE_ID: /^[A-Z]{2,3}\d{3,6}$/,
  IP_ADDRESS: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
};

// Predefined validation configurations
export const SEARCH_VALIDATIONS = {
  // Basic text search - allows everything
  BASIC: (): SearchValidationOptions => ({
    allowSpecialChars: true,
    allowNumbers: true,
    allowSpaces: true,
    minLength: 0,
    maxLength: 100,
  }),

  // Name search - letters and spaces only
  NAME: (minLength = 2, maxLength = 50): SearchValidationOptions => ({
    allowSpecialChars: false,
    allowNumbers: false,
    allowSpaces: true,
    customPattern: VALIDATION_PATTERNS.LETTERS_WITH_SPACES,
    customErrorMessage: 'Name can only contain letters and spaces',
    minLength,
    maxLength,
  }),

  // Email search
  EMAIL: (): SearchValidationOptions => ({
    customPattern: VALIDATION_PATTERNS.EMAIL,
    customErrorMessage: 'Please enter a valid email address',
    minLength: 5,
    maxLength: 100,
  }),

  // Phone number search
  PHONE: (): SearchValidationOptions => ({
    customPattern: VALIDATION_PATTERNS.PHONE,
    customErrorMessage: 'Please enter a valid phone number',
    minLength: 10,
    maxLength: 15,
  }),

  // Username search
  USERNAME: (minLength = 3, maxLength = 30): SearchValidationOptions => ({
    customPattern: VALIDATION_PATTERNS.USERNAME,
    customErrorMessage: 'Username can only contain letters, numbers, dots, hyphens, and underscores',
    minLength,
    maxLength,
  }),

  // Product code search
  PRODUCT_CODE: (minLength = 2, maxLength = 20): SearchValidationOptions => ({
    allowSpecialChars: false,
    allowSpaces: false,
    customPattern: VALIDATION_PATTERNS.ALPHANUMERIC,
    customErrorMessage: 'Product code can only contain letters and numbers',
    minLength,
    maxLength,
  }),

  // Employee ID search
  EMPLOYEE_ID: (): SearchValidationOptions => ({
    customPattern: VALIDATION_PATTERNS.EMPLOYEE_ID,
    customErrorMessage: 'Employee ID format: 2-3 letters followed by 3-6 digits (e.g., EMP123456)',
    minLength: 5,
    maxLength: 9,
  }),

  // Strict alphanumeric (no special chars or spaces)
  ALPHANUMERIC_STRICT: (minLength = 1, maxLength = 50): SearchValidationOptions => ({
    allowSpecialChars: false,
    allowSpaces: false,
    customPattern: VALIDATION_PATTERNS.ALPHANUMERIC,
    customErrorMessage: 'Only letters and numbers are allowed',
    minLength,
    maxLength,
  }),

  // Alphanumeric with spaces
  ALPHANUMERIC_WITH_SPACES: (minLength = 1, maxLength = 100): SearchValidationOptions => ({
    allowSpecialChars: false,
    customPattern: VALIDATION_PATTERNS.ALPHANUMERIC_WITH_SPACES,
    customErrorMessage: 'Only letters, numbers, and spaces are allowed',
    minLength,
    maxLength,
  }),

  // Numbers only
  NUMBERS_ONLY: (minLength = 1, maxLength = 20): SearchValidationOptions => ({
    allowSpecialChars: false,
    allowSpaces: false,
    customPattern: VALIDATION_PATTERNS.NUMBERS_ONLY,
    customErrorMessage: 'Only numbers are allowed',
    minLength,
    maxLength,
  }),

  // URL search
  URL: (): SearchValidationOptions => ({
    customPattern: VALIDATION_PATTERNS.URL,
    customErrorMessage: 'Please enter a valid URL',
    minLength: 4,
    maxLength: 200,
  }),

  // IP Address search
  IP_ADDRESS: (): SearchValidationOptions => ({
    customPattern: VALIDATION_PATTERNS.IP_ADDRESS,
    customErrorMessage: 'Please enter a valid IP address (e.g., 192.168.1.1)',
    minLength: 7,
    maxLength: 15,
  }),

  // Department code (3-4 uppercase letters)
  DEPARTMENT_CODE: (): SearchValidationOptions => ({
    customPattern: /^[A-Z]{3,4}$/,
    customErrorMessage: 'Department code must be 3-4 uppercase letters',
    minLength: 3,
    maxLength: 4,
  }),

  // Custom validation builder
  CUSTOM: (pattern: RegExp, message: string, minLength = 0, maxLength = 100): SearchValidationOptions => ({
    customPattern: pattern,
    customErrorMessage: message,
    minLength,
    maxLength,
  }),
};

// Utility function to combine multiple validations
export const combineValidations = (...validations: SearchValidationOptions[]): SearchValidationOptions => {
  return validations.reduce((combined, validation) => ({
    ...combined,
    ...validation,
    // For minLength and maxLength, take the most restrictive values
    minLength: Math.max(combined.minLength || 0, validation.minLength || 0),
    maxLength: Math.min(combined.maxLength || 100, validation.maxLength || 100),
  }), {} as SearchValidationOptions);
};

// Validation helper functions
export const validateSearchInput = (
  input: string, 
  validation: SearchValidationOptions
): { isValid: boolean; error?: string } => {
  const {
    allowSpecialChars = true,
    minLength = 0,
    maxLength = 100,
    allowNumbers = true,
    allowSpaces = true,
    customPattern,
    customErrorMessage,
  } = validation;

  // Empty input is always valid (allows clearing)
  if (!input.trim()) {
    return { isValid: true };
  }

  // Length validation
  if (input.length < minLength) {
    return { isValid: false, error: `Minimum ${minLength} characters required` };
  }

  if (input.length > maxLength) {
    return { isValid: false, error: `Maximum ${maxLength} characters allowed` };
  }

  // Custom pattern validation (highest priority)
  if (customPattern && !customPattern.test(input)) {
    return { isValid: false, error: customErrorMessage || 'Invalid format' };
  }

  // Special characters validation
  if (!allowSpecialChars && /[!@#$%^&*(),.?":{}|<>]/.test(input)) {
    return { isValid: false, error: 'Special characters are not allowed' };
  }

  // Numbers validation
  if (!allowNumbers && /\d/.test(input)) {
    return { isValid: false, error: 'Numbers are not allowed' };
  }

  // Spaces validation
  if (!allowSpaces && input.includes(' ')) {
    return { isValid: false, error: 'Spaces are not allowed' };
  }

  return { isValid: true };
};
