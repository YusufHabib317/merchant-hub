/**
 * Utility functions for ExchangeRateModal component
 *
 * Requirements: 1.2, 2.5
 */

import { calculateSYPPrice, validateExchangeRate } from '@/utils/exchangeRate';

/**
 * Calculate preview price for a product
 * Requirement 2.5: Display preview of new SYP prices
 */
export function getPreviewPrice(priceUSD: number, exchangeRate: number | string): number | null {
  const numRate = typeof exchangeRate === 'string' ? parseFloat(exchangeRate) : exchangeRate;
  if (!validateExchangeRate(numRate)) {
    return null;
  }
  return calculateSYPPrice(priceUSD, numRate);
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency: 'USD' | 'SYP'): string {
  if (currency === 'USD') {
    return `$${value.toFixed(2)}`;
  }
  return `${value.toLocaleString()} SYP`;
}

/**
 * Parse exchange rate value to number
 */
export function parseExchangeRate(value: number | string): number {
  return typeof value === 'string' ? parseFloat(value) : value;
}
