/**
 * Product Filter Types
 * Shared types for product filtering across the application
 */

export interface ProductFilterValues {
  condition?: string;
  categories?: string[];
  stock?: string;
  published?: string;
  tags?: string[];
  minPrice?: number | string;
  maxPrice?: number | string;
}

export interface ProductFilterOptions {
  categories: string[];
  tags: string[];
}

export interface ProductFiltersProps {
  values: ProductFilterValues;
  options: ProductFilterOptions;
  onChange: (values: ProductFilterValues) => void;
  onClear: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  showToggle?: boolean;
}

export const DEFAULT_FILTER_VALUES: ProductFilterValues = {
  condition: 'ALL',
  categories: [],
  stock: 'ALL',
  published: 'ALL',
  tags: [],
  minPrice: '',
  maxPrice: '',
};
