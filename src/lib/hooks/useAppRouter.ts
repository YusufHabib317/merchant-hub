import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { getRoutePath } from '@/config/routes';

/**
 * Custom hook for type-safe navigation throughout the app
 * Provides convenient methods for navigating to different routes
 */
export function useAppRouter() {
  const router = useRouter();

  const navigate = {
    // Public routes
    toHome: useCallback(() => router.push(getRoutePath.home()), [router]),

    // Auth routes
    toLogin: useCallback(() => router.push(getRoutePath.login()), [router]),
    toRegister: useCallback(() => router.push(getRoutePath.register()), [router]),
    toForgotPassword: useCallback(() => router.push(getRoutePath.forgotPassword()), [router]),
    toResetPassword: useCallback(() => router.push(getRoutePath.resetPassword()), [router]),

    // Dashboard routes
    toDashboard: useCallback(() => router.push(getRoutePath.dashboard()), [router]),
    toProducts: useCallback(() => router.push(getRoutePath.products()), [router]),
    toNewProduct: useCallback(() => router.push(getRoutePath.newProduct()), [router]),
    toEditProduct: useCallback((id: string) => router.push(getRoutePath.editProduct(id)), [router]),
    toExportProducts: useCallback(() => router.push(getRoutePath.exportProducts()), [router]),
    toQrCode: useCallback(() => router.push(getRoutePath.qrCode()), [router]),
    toChat: useCallback(() => router.push(getRoutePath.chat()), [router]),
    toSettings: useCallback(() => router.push(getRoutePath.settings()), [router]),

    // Admin routes
    toAdmin: useCallback(() => router.push(getRoutePath.adminDashboard()), [router]),
    toAdminUsers: useCallback(() => router.push(getRoutePath.adminUsers()), [router]),
    toAdminProducts: useCallback(() => router.push(getRoutePath.adminProducts()), [router]),

    // Merchant routes
    toMerchantStore: useCallback(
      (slug: string) => router.push(getRoutePath.merchantStore(slug)),
      [router]
    ),

    // Generic navigation
    to: useCallback((path: string) => router.push(path), [router]),
    back: useCallback(() => router.back(), [router]),
    replace: useCallback((path: string) => router.replace(path), [router]),
  };

  return {
    ...navigate,
    router,
    pathname: router.pathname,
    query: router.query,
    isReady: router.isReady,
  };
}

/**
 * Hook to check if a route is currently active
 */
export function useIsActiveRoute() {
  const router = useRouter();

  return useCallback(
    (path: string, exact = false): boolean => {
      if (exact) {
        return router.pathname === path;
      }
      return router.pathname.startsWith(path);
    },
    [router.pathname]
  );
}
