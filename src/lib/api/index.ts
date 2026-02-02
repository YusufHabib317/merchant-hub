/**
 * API module exports
 * Centralized exports for API client and endpoints
 */

export { apiClient } from './client';
export { API_ENDPOINTS, buildEndpoint } from './endpoints';
export type { EndpointParams } from './endpoints';

// Error handling utilities
export { default as createApiError } from './createApiError';
export { handleApiError, withErrorHandling } from './handleApiError';
