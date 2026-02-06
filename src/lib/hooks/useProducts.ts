import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { handleApiError } from '@/lib/api/handleApiError';
import { CreateProductInput, UpdateProductInput, Product } from '@/schemas/product';
import { ApiErrorResponse } from '@/types/error';

const PRODUCTS_QUERY_KEY = ['products'];

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'name' | 'priceUSD';
  sortOrder?: 'asc' | 'desc';
  // Filter parameters
  condition?: string;
  categories?: string[];
  stock?: string;
  published?: string;
  tags?: string[];
  minPrice?: number | string;
  maxPrice?: number | string;
}

/**
 * Fetch all products with pagination (Dashboard)
 */
export function useProducts(merchantId?: string, params: ProductQueryParams = {}) {
  const {
    page = 1,
    limit = 20,
    search,
    sortBy,
    sortOrder,
    condition,
    categories,
    stock,
    published,
    tags,
    minPrice,
    maxPrice,
  } = params;

  // Convert arrays to comma-separated strings for API
  const categoriesParam = categories && categories.length > 0 ? categories.join(',') : undefined;
  const tagsParam = tags && tags.length > 0 ? tags.join(',') : undefined;

  const queryKey = [
    ...PRODUCTS_QUERY_KEY,
    merchantId,
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    condition,
    categoriesParam,
    stock,
    published,
    tagsParam,
    minPrice,
    maxPrice,
  ];

  return useQuery<ProductsResponse>({
    queryKey,
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.products.list, {
        params: {
          merchantId,
          page,
          limit,
          search,
          sortBy,
          sortOrder,
          condition,
          categories: categoriesParam,
          stock,
          published,
          tags: tagsParam,
          minPrice,
          maxPrice,
        },
      });
      return data.data;
    },
  });
}

/**
 * Fetch merchant products (Public)
 */
export function useMerchantPublicProducts(merchantId: string, params: ProductQueryParams = {}) {
  const { page = 1, limit = 20, search, sortBy, sortOrder } = params;
  return useQuery<ProductsResponse>({
    queryKey: ['public-products', merchantId, page, limit, search, sortBy, sortOrder],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.products(merchantId), {
        params: {
          page,
          limit,
          search,
          sortBy,
          sortOrder,
        },
      });
      return data.data;
    },
    enabled: !!merchantId,
  });
}

/**
 * Fetch single product by ID
 */
export function useProduct(productId: string) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, productId],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.products.getById(productId));
      return data.data;
    },
    enabled: !!productId,
  });
}

/**
 * Create new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProductInput) => {
      try {
        const { data } = await apiClient.post(API_ENDPOINTS.products.create, input);
        return data.data;
      } catch (error) {
        // Handle error and show notification
        handleApiError(error as AxiosError<ApiErrorResponse>);
        // Throw error so React Query knows the mutation failed
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

/**
 * Update existing product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductInput }) => {
      const response = await apiClient.put(API_ENDPOINTS.products.update(id), data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error);
    },
  });
}

/**
 * Delete product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await apiClient.delete(API_ENDPOINTS.products.delete(productId));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error);
    },
  });
}
