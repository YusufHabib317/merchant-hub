import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { handleApiError } from '@/lib/api/handleApiError';
import { ApiErrorResponse } from '@/types/error';
import type {
  ApplyExchangeRateRequest,
  ApplyExchangeRateResponse,
  RevertPricesRequest,
  RevertPricesResponse,
} from '@/schemas/api/exchangeRate';

/**
 * Query keys for exchange rate related queries
 */
const EXCHANGE_RATE_QUERY_KEY = ['exchange-rate'];
const MERCHANTS_QUERY_KEY = ['merchants'];
const PRODUCTS_QUERY_KEY = ['products'];

/**
 * Input types for mutations
 */
export interface ApplyExchangeRateInput {
  exchangeRate: number;
  productIds: string[];
}

export interface RevertPricesInput {
  productIds: string[];
}

/**
 * Fetch merchant's default exchange rate
 * Retrieves the exchange rate from the merchant's profile
 *
 * Requirements: 4.2 - Retrieve and display merchant's last used exchange rate
 */
function useMerchantExchangeRate() {
  return useQuery<number | undefined>({
    queryKey: [...EXCHANGE_RATE_QUERY_KEY, 'merchant'],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.me);
      return data.data?.defaultExchangeRate;
    },
    retry: false,
  });
}

/**
 * Mutation for applying exchange rate to selected products
 *
 * Requirements:
 * - 3.1: Calculate priceSYP = priceUSD × exchangeRate
 * - 4.1: Persist exchange rate value associated with merchant
 * - 5.1: Store original SYP price before update
 */
function useApplyExchangeRateMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ApplyExchangeRateResponse['data'],
    AxiosError<ApiErrorResponse>,
    ApplyExchangeRateInput
  >({
    mutationFn: async (input: ApplyExchangeRateInput) => {
      const requestBody: ApplyExchangeRateRequest = {
        exchangeRate: input.exchangeRate,
        productIds: input.productIds,
      };

      const { data } = await apiClient.post<ApplyExchangeRateResponse>(
        API_ENDPOINTS.products.applyExchangeRate,
        requestBody
      );

      return data.data;
    },
    onSuccess: () => {
      // Invalidate products query to refresh the product list
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      // Invalidate merchant query to update the stored exchange rate
      queryClient.invalidateQueries({ queryKey: MERCHANTS_QUERY_KEY });
      // Invalidate exchange rate query
      queryClient.invalidateQueries({ queryKey: EXCHANGE_RATE_QUERY_KEY });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      handleApiError(error);
    },
  });
}

/**
 * Mutation for reverting products to their original SYP prices
 *
 * Requirements:
 * - 5.3: Restore each selected product's priceSYP to its stored original value
 * - 5.4: Clear the stored original price after reversion
 */
function useRevertPricesMutation() {
  const queryClient = useQueryClient();

  return useMutation<RevertPricesResponse['data'], AxiosError<ApiErrorResponse>, RevertPricesInput>(
    {
      mutationFn: async (input: RevertPricesInput) => {
        const requestBody: RevertPricesRequest = {
          productIds: input.productIds,
        };

        const { data } = await apiClient.post<RevertPricesResponse>(
          API_ENDPOINTS.products.revertPrices,
          requestBody
        );

        return data.data;
      },
      onSuccess: () => {
        // Invalidate products query to refresh the product list
        queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      },
      onError: (error: AxiosError<ApiErrorResponse>) => {
        handleApiError(error);
      },
    }
  );
}

/**
 * Return type for the useExchangeRate hook
 */
export interface UseExchangeRateReturn {
  // Queries
  merchantExchangeRate: number | undefined;
  isLoadingRate: boolean;
  isErrorRate: boolean;

  // Mutations
  applyExchangeRate: ReturnType<typeof useApplyExchangeRateMutation>;
  revertPrices: ReturnType<typeof useRevertPricesMutation>;
}

/**
 * Custom hook for managing exchange rate operations
 *
 * Provides:
 * - Query for merchant's default exchange rate
 * - Mutation for applying exchange rate to products
 * - Mutation for reverting prices to original values
 *
 * Requirements satisfied:
 * - 4.2: Retrieve merchant's last used exchange rate
 * - 3.1: Apply exchange rate calculation
 * - 5.3: Revert prices to original values
 */
export function useExchangeRate(): UseExchangeRateReturn {
  const {
    data: merchantExchangeRate,
    isLoading: isLoadingRate,
    isError: isErrorRate,
  } = useMerchantExchangeRate();

  const applyExchangeRate = useApplyExchangeRateMutation();
  const revertPrices = useRevertPricesMutation();

  return {
    // Queries
    merchantExchangeRate,
    isLoadingRate,
    isErrorRate,

    // Mutations
    applyExchangeRate,
    revertPrices,
  };
}

export default useExchangeRate;
