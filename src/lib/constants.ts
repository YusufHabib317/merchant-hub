export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    productLimit: 10,
    exportWatermark: true,
    broadcastMessages: false,
    aiChatEnabled: true,
  },
  BASIC: {
    name: 'Basic',
    productLimit: 50,
    exportWatermark: false,
    broadcastMessages: true,
    aiChatEnabled: true,
  },
  PREMIUM: {
    name: 'Premium',
    productLimit: Infinity,
    exportWatermark: false,
    broadcastMessages: true,
    aiChatEnabled: true,
  },
} as const;

// Exchange Rate
export const DEFAULT_EXCHANGE_RATE = 15000;

// HTTP Status Codes
export const httpCode = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Fallback error messages
export const FALLBACK_ERROR_MESSAGE = 'An unexpected error occurred';
export const FALLBACK_ERROR_MESSAGE_KEY = 'internalServerError';
