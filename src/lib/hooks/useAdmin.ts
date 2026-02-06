import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  AdminStats,
  AdminUsersResponse,
  AdminProductsResponse,
  AdminUsersQueryParams,
  AdminProductsQueryParams,
} from '@/types/admin';

const ADMIN_QUERY_KEY = ['admin'];

/**
 * Fetch admin dashboard statistics
 */
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: [...ADMIN_QUERY_KEY, 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.admin.stats);
      return data.data;
    },
  });
}

/**
 * Fetch admin users list with pagination and filters
 */
export function useAdminUsers(params: AdminUsersQueryParams = {}) {
  const { page = 1, limit = 20, search, role } = params;

  const queryKey = [...ADMIN_QUERY_KEY, 'users', page, limit, search, role];

  return useQuery<AdminUsersResponse>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.admin.users, {
        params: {
          page,
          limit,
          search,
          role,
        },
      });
      return data.data;
    },
  });
}

/**
 * Fetch admin products list with pagination and filters
 */
export function useAdminProducts(params: AdminProductsQueryParams = {}) {
  const { page = 1, limit = 20, search, isPublished } = params;

  const queryKey = [...ADMIN_QUERY_KEY, 'products', page, limit, search, isPublished];

  return useQuery<AdminProductsResponse>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.admin.products, {
        params: {
          page,
          limit,
          search,
          isPublished,
        },
      });
      return data.data;
    },
  });
}
