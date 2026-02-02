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
  },

  // Merchants
  merchants: {
    list: '/merchants',
    create: '/merchants',
    me: '/merchants/me',
    getBySlug: (slug: string) => `/merchants/by-slug/${slug}`,
    update: (id: string) => `/merchants/by-id/${id}`,
    qrCode: (id: string) => `/merchants/${id}/qr-code`,
    products: (id: string) => `/merchants/${id}/products`,
  },

  // Export
  export: {
    products: '/export/products',
  },
} as const;

/**
 * Helper function to build endpoint paths with parameters
 */
export function buildEndpoint(endpoint: string | ((param: string) => string), param?: string): string {
  if (typeof endpoint === 'function' && param) {
    return endpoint(param);
  }
  return endpoint as string;
}
