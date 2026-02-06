import { z } from 'zod';
import { validateExchangeRate } from '@/utils/exchangeRate';

/**
 * Exchange Rate API Schemas
 *
 * Centralized Zod validation schemas for exchange rate API endpoints.
 * These schemas validate request/response data for applying exchange rates
 * and reverting prices.
 */

// ============================================================================
// Apply Exchange Rate Schemas
// ============================================================================

/**
 * Schema for applying exchange rate to products
 * Validates: Requirements 1.2, 3.1
 */
export const ApplyExchangeRateRequestSchema = z.object({
  exchangeRate: z
    .number()
    .positive('Exchange rate must be positive')
    .min(1, 'Exchange rate must be at least 1')
    .refine((val) => validateExchangeRate(val), {
      message: 'Exchange rate must be a valid positive number',
    }),
  productIds: z.array(z.string().cuid()).min(1, 'At least one product must be selected'),
});

/**
 * Schema for the product data returned after applying exchange rate
 */
export const ExchangeRateProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceUSD: z.number(),
  priceSYP: z.number(),
  exchangeRate: z.number(),
  originalPriceSYP: z.number().nullable(),
});

/**
 * Schema for the apply exchange rate response
 */
export const ApplyExchangeRateResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    updatedCount: z.number(),
    products: z.array(ExchangeRateProductSchema),
  }),
});

// ============================================================================
// Revert Prices Schemas
// ============================================================================

/**
 * Schema for reverting product prices
 * Validates: Requirements 5.3, 5.4
 */
export const RevertPricesRequestSchema = z.object({
  productIds: z.array(z.string().cuid()).min(1, 'At least one product must be selected'),
});

/**
 * Schema for the product data returned after reverting prices
 */
export const RevertedProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceUSD: z.number(),
  priceSYP: z.number(),
  exchangeRate: z.number().nullable(),
  originalPriceSYP: z.number().nullable(),
});

/**
 * Schema for the revert prices response
 */
export const RevertPricesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    revertedCount: z.number(),
    products: z.array(RevertedProductSchema),
  }),
});

// ============================================================================
// Type Exports
// ============================================================================

export type ApplyExchangeRateRequest = z.infer<typeof ApplyExchangeRateRequestSchema>;
export type ApplyExchangeRateResponse = z.infer<typeof ApplyExchangeRateResponseSchema>;
export type ExchangeRateProduct = z.infer<typeof ExchangeRateProductSchema>;

export type RevertPricesRequest = z.infer<typeof RevertPricesRequestSchema>;
export type RevertPricesResponse = z.infer<typeof RevertPricesResponseSchema>;
export type RevertedProduct = z.infer<typeof RevertedProductSchema>;
