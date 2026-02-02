import { AxiosError } from 'axios';
import { z } from 'zod';
import { httpCode, FALLBACK_ERROR_MESSAGE, FALLBACK_ERROR_MESSAGE_KEY } from '@/lib/constants';
import { ApiErrorResponse, BackendErrorBody, ErrorKeys } from '@/types/error';

type CreateApiErrorArgs = {
  error: unknown;
};

// Helper to handle Axios errors
const handleAxiosError = (error: AxiosError<BackendErrorBody>, isDebug: boolean): ApiErrorResponse => {
  const { response } = error;
  return {
    code: response?.data?.error?.status || response?.status || httpCode.BAD_REQUEST,
    message: {
      fallback: response?.data?.error?.message || error.message || FALLBACK_ERROR_MESSAGE,
      key: response?.data?.error?.details?.key || response?.data?.error?.name || FALLBACK_ERROR_MESSAGE_KEY,
      params: response?.data?.error?.details?.params ?? {},
    },
    errors: isDebug ? [error as Error] : [],
  };
};

// Helper to handle Zod validation errors
const handleZodError = (error: z.ZodError, isDebug: boolean): ApiErrorResponse => {
  const firstIssue = error.issues[0];
  return {
    code: httpCode.BAD_REQUEST,
    message: {
      fallback: `Validation error: ${firstIssue?.message || 'Invalid input'}`,
      key: ErrorKeys.VALIDATION_ERROR,
      params: {
        field: firstIssue?.path?.join('.') || 'unknown',
        issues: error.issues.map((issue) => issue.message),
      },
    },
    errors: isDebug ? [error as Error] : [],
  };
};

// Helper to handle specific error messages
const getErrorByMessage = (message: string): { code: number; key: string; fallback: string } | null => {
  const errorMap: Record<string, { code: number; key: string; fallback: string }> = {
    unauthorized: { code: httpCode.UNAUTHORIZED, key: ErrorKeys.UNAUTHORIZED, fallback: 'Authentication required' },
    forbidden: { code: httpCode.FORBIDDEN, key: ErrorKeys.FORBIDDEN, fallback: 'Access denied' },
    notFound: { code: httpCode.NOT_FOUND, key: ErrorKeys.NOT_FOUND, fallback: 'Resource not found' },
    'Not found': { code: httpCode.NOT_FOUND, key: ErrorKeys.NOT_FOUND, fallback: 'Resource not found' },
  };
  return errorMap[message] || null;
};

// Helper to handle standard Error objects
const handleStandardError = (error: Error, isDebug: boolean): ApiErrorResponse => {
  const specificError = getErrorByMessage(error.message);
  if (specificError) {
    return {
      code: specificError.code,
      message: {
        fallback: specificError.fallback,
        key: specificError.key,
      },
      errors: isDebug ? [error] : [],
    };
  }

  return {
    code: httpCode.INTERNAL_SERVER_ERROR,
    message: {
      fallback: isDebug ? error.message : FALLBACK_ERROR_MESSAGE,
      key: FALLBACK_ERROR_MESSAGE_KEY,
    },
    errors: isDebug ? [error] : [],
  };
};

/**
 * Creates a standardized API error response from various error types.
 * Use this in API route handlers to return consistent error responses.
 */
const createApiError = ({ error }: CreateApiErrorArgs): ApiErrorResponse => {
  const isDebug = process.env.NODE_ENV === 'development';

  if (error instanceof AxiosError) {
    return handleAxiosError(error as AxiosError<BackendErrorBody>, isDebug);
  }

  if (error instanceof z.ZodError) {
    return handleZodError(error, isDebug);
  }

  if (error instanceof Error) {
    return handleStandardError(error, isDebug);
  }

  // Fallback for unknown error types
  return {
    code: httpCode.INTERNAL_SERVER_ERROR,
    message: {
      fallback: FALLBACK_ERROR_MESSAGE,
      key: FALLBACK_ERROR_MESSAGE_KEY,
    },
    errors: isDebug && error ? [new Error(String(error))] : [],
  };
};

export default createApiError;
