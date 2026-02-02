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

/**
 * Fetch all products with pagination
 */
export function useProducts(merchantId?: string, page = 1, limit = 20) {
  return useQuery<ProductsResponse>({
    queryKey: [...PRODUCTS_QUERY_KEY, merchantId, page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.products.list, {
        params: { merchantId, page, limit },
      });
      return data.data;
    },
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
