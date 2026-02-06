import { DEFAULT_EXCHANGE_RATE } from '@/lib/constants';

/**
 * Calculate SYP price from USD price using default exchange rate
 */
export function calculateSypPrice(usdPrice: number): number {
  return Math.round(usdPrice * DEFAULT_EXCHANGE_RATE);
}

/**
 * Format currency amount with proper locale and currency symbol
 */
export function formatCurrency(
  amount: number,
  currency: 'USD' | 'SYP',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount);
}
