import { isAxiosError } from 'axios';

export const formatApiError = (error: unknown, fallback = 'An unexpected error occurred. Please try again.'): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    
    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }
    
    if (data?.error && typeof data.error === 'string') {
      return data.error;
    }
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.message || fallback;
    }
  }
  
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  return fallback;
};