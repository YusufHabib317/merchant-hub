/**
 * Types for ExchangeRateModal component
 *
 * Requirements: 2.1, 2.4, 2.5, 6.2, 6.4
 */

/**
 * Props for the ExchangeRateModal component
 *
 * Requirements: 6.2, 6.4
 */
export interface ExchangeRateModalProps {
  opened: boolean;
  onClose: () => void;
}

/**
 * Internal state for product selection with calculated prices
 *
 * Requirements: 2.1, 2.4, 2.5
 */
export interface ProductSelection {
  id: string;
  name: string;
  priceUSD: number;
  priceSYP: number;
  originalPriceSYP: number | null;
  selected: boolean;
}
