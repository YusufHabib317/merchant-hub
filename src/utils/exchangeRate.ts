/**
 * Exchange Rate Utility Functions
 *
 * Provides functions for calculating SYP prices from USD prices using
 * a currency exchange rate, and validating exchange rate inputs.
 */

/**
 * Calculate SYP price from USD price using a given exchange rate.
 *
 * Uses Math.round() to ensure whole number SYP prices, which is the
 * standard practice for this currency.
 *
 * @param priceUSD - The price in USD
 * @param exchangeRate - The exchange rate (1 USD = X SYP)
 * @returns The calculated SYP price as a whole number
 *
 * @example
 * calculateSYPPrice(10, 14500) // returns 145000
 * calculateSYPPrice(1.99, 14500) // returns 28855
 */
export function calculateSYPPrice(priceUSD: number, exchangeRate: number): number {
  return Math.round(priceUSD * exchangeRate);
}

/**
 * Validate that a value is a valid exchange rate.
 *
 * A valid exchange rate must be:
 * - A number (not NaN, not Infinity)
 * - Positive (greater than zero)
 *
 * @param value - The value to validate (can be any type)
 * @returns true if the value is a valid exchange rate, false otherwise
 *
 * @example
 * validateExchangeRate(14500) // returns true
 * validateExchangeRate(0) // returns false
 * validateExchangeRate(-100) // returns false
 * validateExchangeRate('14500') // returns false
 * validateExchangeRate(null) // returns false
 */
export function validateExchangeRate(value: unknown): boolean {
  // Must be a number type
  if (typeof value !== 'number') {
    return false;
  }

  // Must not be NaN or Infinity
  if (!Number.isFinite(value)) {
    return false;
  }

  // Must be positive (greater than zero)
  return value > 0;
}
