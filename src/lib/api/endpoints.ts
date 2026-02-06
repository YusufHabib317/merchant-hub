/**
 * Centralized API endpoint configuration
 * Provides type-safe API endpoint definitions
 */

// Endpoint parameter types
export interface EndpointParams {
  id?: string;
  slug?: string;
  merchantId?: string;
}

/**
 * API endpoints organized by resource
 */
export const API_ENDPOINTS = {
  // Auth
  auth: {
    requestPasswordChangeOTP: '/auth/password-change/request-otp',
    verifyPasswordChangeOTP: '/auth/password-change/verify-otp',
    requestPasswordResetOTP: '/auth/password-reset/request-otp',
    verifyPasswordResetOTP: '/auth/password-reset/verify-otp',
  },

  // Dashboard
  dashboard: {
    stats: '/dashboard/stats',
  },

  // Products
  products: {
    list: '/products',
    create: '/products',
    getById: (id: string) => `/products/${id}`,
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
    applyExchangeRate: '/products/exchange-rate',
    revertPrices: '/products/revert-prices',
  },

  // Merchants
  merchants: {
    list: '/merchants',
    create: '/merchants',
    me: '/merchants/me',
    getBySlug: (slug: string) => `/merchants/by-slug/${slug}`,
    update: (id: string) => `/merchants/${id}`,
    qrCode: (id: string) => `/merchants/${id}/qr-code`,
    products: (id: string) => `/merchants/${id}/products`,
    categories: (id: string) => `/merchants/${id}/categories`,
  },

  // Export
  export: {
    products: '/export/products',
  },

  // Admin
  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    products: '/admin/products',
  },
} as const;

/**
 * Helper function to build endpoint paths with parameters
 */
export function buildEndpoint(
  endpoint: string | ((param: string) => string),
  param?: string
): string {
  if (typeof endpoint === 'function' && param) {
    return endpoint(param);
  }
  return endpoint as string;
}
