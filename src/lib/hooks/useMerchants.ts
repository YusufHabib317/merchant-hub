import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { handleApiError } from '@/lib/api/handleApiError';
import { UpdateMerchantInput } from '@/schemas/merchant';
import { ApiErrorResponse } from '@/types/error';

const MERCHANTS_QUERY_KEY = ['merchants'];

/**
 * Fetch current user's merchant profile
 */
export function useMyMerchant() {
  return useQuery({
    queryKey: [...MERCHANTS_QUERY_KEY, 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.me);
      return data.data;
    },
    retry: false, // Don't retry if merchant doesn't exist
  });
}

/**
 * Fetch all merchants with pagination
 */
export function useMerchants(page = 1, limit = 20) {
  return useQuery({
    queryKey: [...MERCHANTS_QUERY_KEY, page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.list, {
        params: { page, limit },
      });
      return data;
    },
  });
}

/**
 * Fetch merchant by slug (public endpoint)
 */
export function useMerchant(slug: string) {
  return useQuery({
    queryKey: [...MERCHANTS_QUERY_KEY, slug],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.getBySlug(slug));
      return data;
    },
    enabled: !!slug,
  });
}

/**
 * Fetch merchant products
 */
export function useMerchantProducts(merchantId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...MERCHANTS_QUERY_KEY, merchantId, 'products', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.products(merchantId), {
        params: { page, limit },
      });
      return data;
    },
    enabled: !!merchantId,
  });
}

/**
 * Update merchant profile
 */
export function useUpdateMerchant(merchantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateMerchantInput) => {
      const { data } = await apiClient.put(API_ENDPOINTS.merchants.update(merchantId), input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MERCHANTS_QUERY_KEY });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error);
    },
  });
}

/**
 * Get merchant QR code
 */
export function useMerchantQRCode(merchantId: string) {
  return useQuery({
    queryKey: [...MERCHANTS_QUERY_KEY, merchantId, 'qr-code'],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.qrCode(merchantId));
      return data;
    },
    enabled: !!merchantId,
  });
}
