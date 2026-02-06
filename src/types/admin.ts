import { Role } from '@prisma/client';

/**
 * Admin dashboard statistics
 */
export interface AdminStats {
  totalUsers: number;
  totalMerchants: number;
  totalProducts: number;
  totalChatSessions: number;
}

/**
 * User item for admin users list
 */
export interface AdminUserItem {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * Product item for admin products list
 */
export interface AdminProductItem {
  id: string;
  name: string;
  priceUSD: number;
  isPublished: boolean;
  merchantName: string;
  createdAt: Date;
}

/**
 * Paginated users response
 */
export interface AdminUsersResponse {
  users: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Paginated products response
 */
export interface AdminProductsResponse {
  products: AdminProductItem[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Base query parameters for admin endpoints
 */
export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Query parameters for admin users endpoint
 */
export interface AdminUsersQueryParams extends AdminQueryParams {
  role?: Role;
}

/**
 * Query parameters for admin products endpoint
 */
export interface AdminProductsQueryParams extends AdminQueryParams {
  isPublished?: boolean;
}
