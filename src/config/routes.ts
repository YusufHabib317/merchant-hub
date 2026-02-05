/**
 * Centralized routing configuration for the application
 * Provides type-safe route definitions and navigation helpers
 */

// Route parameter types
export interface RouteParams {
  id?: string;
  slug?: string;
}

// Route metadata
export interface RouteMetadata {
  title?: string;
  requiresAuth?: boolean;
  requiredRoles?: string[];
  description?: string;
}

// Route definition
export interface Route {
  path: string;
  metadata?: RouteMetadata;
}

/**
 * Application routes organized by feature
 */
export const ROUTES = {
  // Public routes
  home: {
    path: '/',
    metadata: { title: 'Home' },
  },

  // Auth routes
  auth: {
    login: {
      path: '/auth/login',
      metadata: { title: 'Login' },
    },
    register: {
      path: '/auth/register',
      metadata: { title: 'Register' },
    },
    forgotPassword: {
      path: '/auth/forgot-password',
      metadata: { title: 'Forgot Password' },
    },
    resetPassword: {
      path: '/auth/reset-password',
      metadata: { title: 'Reset Password' },
    },
    verifyOtp: {
      path: '/auth/verify-otp',
      metadata: { title: 'Verify Email' },
    },
  },

  // Dashboard routes
  dashboard: {
    index: {
      path: '/dashboard',
      metadata: {
        title: 'Dashboard',
        requiresAuth: true,
      },
    },

    // Products
    products: {
      index: {
        path: '/dashboard/products',
        metadata: {
          title: 'Products',
          requiresAuth: true,
        },
      },
      new: {
        path: '/dashboard/products/new',
        metadata: {
          title: 'New Product',
          requiresAuth: true,
        },
      },
      edit: {
        path: '/dashboard/products/[id]/edit',
        metadata: {
          title: 'Edit Product',
          requiresAuth: true,
        },
      },
      export: {
        path: '/dashboard/products/export',
        metadata: {
          title: 'Export Products',
          requiresAuth: true,
        },
      },
    },

    // QR Code
    qrCode: {
      path: '/dashboard/qr-code',
      metadata: {
        title: 'QR Code',
        requiresAuth: true,
      },
    },

    // Chat
    chat: {
      path: '/dashboard/chat',
      metadata: {
        title: 'Chat',
        requiresAuth: true,
      },
    },

    // Settings
    settings: {
      path: '/dashboard/settings',
      metadata: {
        title: 'Settings',
        requiresAuth: true,
      },
    },

    // AI Context
    aiContext: {
      path: '/dashboard/ai-context',
      metadata: {
        title: 'AI Context',
        requiresAuth: true,
      },
    },

    // Profile
    profile: {
      path: '/dashboard/profile',
      metadata: {
        title: 'Profile',
        requiresAuth: true,
      },
    },
  },

  // Public merchant page
  merchant: {
    view: {
      path: '/m/[slug]',
      metadata: { title: 'Merchant Store' },
    },
  },
} as const;

/**
 * Helper function to build route paths with parameters
*/
export function buildRoute(route: Route, params?: RouteParams): string {
  let { path } = route;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`[${key}]`, value);
    });
  }

  return path;
}

/**
 * Type-safe navigation helper
 * Returns the path for a given route with optional parameters
 */
export const getRoutePath = {
  home: () => ROUTES.home.path,

  // Auth
  login: () => ROUTES.auth.login.path,
  register: () => ROUTES.auth.register.path,
  forgotPassword: () => ROUTES.auth.forgotPassword.path,
  resetPassword: () => ROUTES.auth.resetPassword.path,
  verifyOtp: () => ROUTES.auth.verifyOtp.path,

  // Dashboard
  dashboard: () => ROUTES.dashboard.index.path,
  products: () => ROUTES.dashboard.products.index.path,
  newProduct: () => ROUTES.dashboard.products.new.path,
  editProduct: (id: string) => buildRoute(ROUTES.dashboard.products.edit, { id }),
  exportProducts: () => ROUTES.dashboard.products.export.path,
  qrCode: () => ROUTES.dashboard.qrCode.path,
  chat: () => ROUTES.dashboard.chat.path,
  settings: () => ROUTES.dashboard.settings.path,
  aiContext: () => ROUTES.dashboard.aiContext.path,
  profile: () => ROUTES.dashboard.profile.path,

  // Merchant
  merchantStore: (slug: string) => buildRoute(ROUTES.merchant.view, { slug }),
} as const;
