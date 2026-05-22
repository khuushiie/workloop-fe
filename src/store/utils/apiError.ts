import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface BackendErrorResponse {
  success: boolean;
  message: string | string[];
  error?: string;
  statusCode: number;
  timestamp?: string;
}

/**
 * Helper to extract error message from RTK Query error object
 */
export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string | null => {
  if (!error) return null;

  // Case 1: Server Error (FetchBaseQueryError)
  if ('data' in error) {
    const errorData = error.data as BackendErrorResponse;

    // Check if errorData exists and has a message
    if (errorData && errorData.message) {
      // Scenario A: Message is an Array (e.g., ["password too short", "email invalid"])
      if (Array.isArray(errorData.message)) {
        // Join the errors into a single string to display to the user
        return errorData.message.join(', '); 
      }
      
      // Scenario B: Message is a simple String
      if (typeof errorData.message === 'string') {
        return errorData.message;
      }
    }

    // Fallback if 'data' exists but structure is unexpected
    return 'An unexpected server error occurred';
  }

  // Case 2: Network/Client Error (SerializedError)
  if ('message' in error) {
    return error.message || 'Network error occurred';
  }

  // Case 3: Fallback
  return 'An unknown error occurred';
};

export interface ApiError {
  data?: {
    message?: string | string[];
  };
  response?: {
    data?: {
      message?: string | string[];
    };
  };
  message?: string;
}