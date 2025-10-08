import { useState, useCallback } from 'react';

interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  context?: any;
}

export const useErrorHandling = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const logError = useCallback((error: Error, context?: any) => {
    const errorInfo: ErrorInfo = {
      id: `error-${Date.now()}`,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      context
    };
    setErrors(prev => [...prev, errorInfo]);
    console.error('Error logged:', errorInfo);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  return {
    errors,
    logError,
    clearErrors,
    removeError
  };
};
