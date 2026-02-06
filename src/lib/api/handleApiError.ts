import { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { httpCode, FALLBACK_ERROR_MESSAGE } from '@/lib/constants';
import { ApiErrorResponse } from '@/types/error';

// Cache to prevent duplicate notifications
const errorCache: Record<string, number> = {};
const ERROR_CACHE_DURATION = 30 * 1000; // 30 seconds

interface HandleApiErrorOptions {
  /** If true, this is a query request (GET) vs mutation */
  isQueryRequest?: boolean;
  /** If true, don't show notification */
  withoutNotification?: boolean;
}

// Helper to show error notification
const showErrorNotification = (title: string, message: string): void => {
  notifications.show({
    title,
    message,
    color: 'red',
  });
};

// Helper to handle unauthorized errors
const handleUnauthorized = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

// Helper to handle forbidden errors
const handleForbidden = (withoutNotification: boolean): void => {
  if (!withoutNotification) {
    showErrorNotification('Access Denied', 'You do not have permission to perform this action');
  }
};

// Helper to show notification based on cache and request type
const showNotificationIfNeeded = (
  errorKey: string,
  errorMessage: string,
  isQueryRequest: boolean
): void => {
  const canShowNotification = Date.now() - (errorCache[errorKey] ?? 0) > ERROR_CACHE_DURATION;

  if (typeof window !== 'undefined' && canShowNotification) {
    if (isQueryRequest) {
      errorCache[errorKey] = Date.now();
    }
    showErrorNotification('Error', errorMessage);
  } else if (!isQueryRequest) {
    showErrorNotification('Error', errorMessage);
  }
};

/**
 * Handles API errors on the client side.
 * Shows appropriate notifications and handles special cases like unauthorized.
 *
 * @param error - The Axios error from the API call
 * @param options - Configuration options for error handling
 */
export const handleApiError = (
  error: AxiosError<ApiErrorResponse>,
  options: HandleApiErrorOptions = {}
): void => {
  const { isQueryRequest = false, withoutNotification = false } = options;

  // Handle 401 - Unauthorized: redirect to login
  if (error.response?.status === httpCode.UNAUTHORIZED) {
    handleUnauthorized();
    return;
  }

  // Handle 403 - Forbidden
  if (error.response?.status === httpCode.FORBIDDEN) {
    handleForbidden(withoutNotification);
    return;
  }

  // Show error notification if not disabled
  if (error.response && !withoutNotification) {
    const { data } = error.response;
    const errorMessage = data?.message?.fallback || error.message || FALLBACK_ERROR_MESSAGE;
    const errorKey = data?.message?.key || 'unknown';

    showNotificationIfNeeded(errorKey, errorMessage, isQueryRequest);
  }
};

/**
 * Wrapper function to use with React Query mutations.
 * Catches the error, handles it, and re-throws for React Query to process.
 *
 * @example
 * const createProduct = async (input) => {
 *   return apiClient.post('/products', input)
 *     .then(res => res.data)
 *     .catch(withErrorHandling);
 * };
 */
export const withErrorHandling = (error: unknown): never => {
  if (error instanceof AxiosError) {
    handleApiError(error as AxiosError<ApiErrorResponse>);
  } else {
    showErrorNotification('Error', FALLBACK_ERROR_MESSAGE);
  }
  throw error;
};

export default handleApiError;
