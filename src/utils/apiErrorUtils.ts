interface RTKQueryError {
  data?: {
    message?: string;
    error?: string;
    success?: boolean;
    statusCode?: number;
  };
  message?: string;
  status?: number | string;
}

/**
 * @param error - The error object from RTK Query catch block
 * @returns A user-friendly error message string
 */
export const extractApiError = (error: unknown): string => {
  if (!error) return 'Something went wrong.';
  
  const err = error as RTKQueryError;
  
  if (err?.data?.message && typeof err.data.message === 'string') {
    return err.data.message;
  }
  
  if (err?.data?.error && typeof err.data.error === 'string') {
    return err.data.error;
  }
  if (err?.message && typeof err.message === 'string') {
    return err.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Something went wrong.';
};

export default extractApiError;
