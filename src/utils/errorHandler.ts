/** Shape of an error object with optional response data */
interface ErrorLike {
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
      error?: string;
      errorMessage?: string;
      field?: string;
      code?: string;
      timestamp?: string;
    };
  };
  config?: {
    url?: string;
    method?: string;
  };
}

export interface UserFriendlyError {
  message: string;
  field?: string;
  code?: string;
  statusCode: number;
  timestamp?: string;
}

/** Safely cast an unknown error to ErrorLike */
function toErrorLike(error: unknown): ErrorLike {
  if (error && typeof error === "object") return error as ErrorLike;
  return { message: String(error) };
}

export class ErrorHandler {
  /**
   * Extract user-friendly error message from API response
   */
  static extractErrorMessage(error: unknown): string {
    const err = toErrorLike(error);
    // Handle different error response formats
    if (err.response?.data) {
      const data = err.response.data;
      
      // Check for user-friendly error format
      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
      
      // Check for array of messages
      if (Array.isArray(data.message)) {
        return data.message.join(' ');
      }
      
      // Check for error field
      if (data.error) {
        return data.error;
      }
      
      // Check for errorMessage field
      if (data.errorMessage) {
        return data.errorMessage;
      }
    }
    
    // Handle direct error message
    if (err.message) {
      return err.message;
    }
    
    // Default fallback
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Extract detailed error information
   */
  static extractErrorDetails(error: unknown): UserFriendlyError {
    const err = toErrorLike(error);
    const message = this.extractErrorMessage(error);
    const statusCode = err.response?.status || 500;
    
    return {
      message,
      statusCode,
      field: err.response?.data?.field,
      code: err.response?.data?.code,
      timestamp: err.response?.data?.timestamp || new Date().toISOString()
    };
  }

  /**
   * Format error message for display
   */
  static formatErrorMessage(error: unknown): string {
    const errorDetails = this.extractErrorDetails(error);
    return errorDetails.message;
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    const err = toErrorLike(error);
    return err.response?.status === 400 || 
           err.response?.status === 409 ||
           err.response?.data?.code?.includes('VALIDATION') ||
           err.response?.data?.code?.includes('EXISTS') ||
           false;
  }

  /**
   * Check if error is a duplicate error
   */
  static isDuplicateError(error: unknown): boolean {
    const err = toErrorLike(error);
    const msg = err.response?.data?.message;
    return err.response?.data?.code?.includes('EXISTS') ||
           (typeof msg === 'string' && msg.includes('already exists')) ||
           false;
  }

  /**
   * Check if error is a not found error
   */
  static isNotFoundError(error: unknown): boolean {
    const err = toErrorLike(error);
    return err.response?.status === 404 ||
           err.response?.data?.code?.includes('NOT_FOUND') ||
           false;
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    const err = toErrorLike(error);
    return err.response?.status === 401 ||
           err.response?.status === 403 ||
           err.response?.data?.code?.includes('AUTH') ||
           false;
  }

  /**
   * Get error type for styling
   */
  static getErrorType(error: unknown): 'error' | 'warning' | 'info' {
    if (this.isAuthError(error)) {
      return 'error';
    }
    
    if (this.isValidationError(error) || this.isDuplicateError(error)) {
      return 'warning';
    }
    
    return 'error';
  }

  /**
   * Get error icon based on error type
   */
  static getErrorIcon(error: unknown): string {
    if (this.isAuthError(error)) {
      return '🔒';
    }
    
    if (this.isValidationError(error) || this.isDuplicateError(error)) {
      return '⚠️';
    }
    
    if (this.isNotFoundError(error)) {
      return '🔍';
    }
    
    return '❌';
  }

  /**
   * Get user-friendly error message with context
   */
  static getUserFriendlyMessage(error: unknown, context?: string): string {
    const baseMessage = this.extractErrorMessage(error);
    
    if (context) {
      return `${context}: ${baseMessage}`;
    }
    
    return baseMessage;
  }

  /**
   * Log error for debugging
   */
  static logError(error: unknown, context?: string): void {
    const err = toErrorLike(error);
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: err.config?.url,
      method: err.config?.method,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Hook for handling errors in React components
 */
export const useErrorHandler = () => {
  const handleError = (error: unknown, context?: string): string => {
    ErrorHandler.logError(error, context);
    return ErrorHandler.getUserFriendlyMessage(error, context);
  };

  const getErrorDetails = (error: unknown): UserFriendlyError => {
    return ErrorHandler.extractErrorDetails(error);
  };

  const isValidationError = (error: unknown): boolean => {
    return ErrorHandler.isValidationError(error);
  };

  const isDuplicateError = (error: unknown): boolean => {
    return ErrorHandler.isDuplicateError(error);
  };

  const getErrorType = (error: unknown): 'error' | 'warning' | 'info' => {
    return ErrorHandler.getErrorType(error);
  };

  return {
    handleError,
    getErrorDetails,
    isValidationError,
    isDuplicateError,
    getErrorType
  };
};
