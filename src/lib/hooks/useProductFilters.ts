import { useState, useMemo, useCallback } from 'react';
import { ProductFilterValues, ProductFilterOptions, DEFAULT_FILTER_VALUES } from '@/types/filters';
import { Product } from '@/schemas/product';

interface UseProductFiltersOptions {
  products?: Product[];
  initialValues?: Partial<ProductFilterValues>;
}

export function useProductFilters(options: UseProductFiltersOptions = {}) {
  const { products = [], initialValues = {} } = options;

  const [filterValues, setFilterValues] = useState<ProductFilterValues>({
    ...DEFAULT_FILTER_VALUES,
    ...initialValues,
  });

  const [isOpen, setIsOpen] = useState(false);

  // Extract unique categories and tags from products
  const filterOptions = useMemo<ProductFilterOptions>(() => {
    const categories = new Set<string>();
    const tags = new Set<string>();

    products.forEach((p) => {
      if (p.category) categories.add(p.category);
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((tag) => tags.add(tag));
      }
    });

    return {
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort(),
    };
  }, [products]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    const filters = [
      filterValues.condition !== 'ALL',
      (filterValues.categories?.length ?? 0) > 0,
      filterValues.stock !== 'ALL',
      filterValues.published !== 'ALL',
      (filterValues.tags?.length ?? 0) > 0,
      filterValues.minPrice !== '',
      filterValues.maxPrice !== '',
    ];
    return filters.filter(Boolean).length;
  }, [filterValues]);

  // Update filter values
  const updateFilters = useCallback((newValues: Partial<ProductFilterValues>) => {
    setFilterValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterValues(DEFAULT_FILTER_VALUES);
  }, []);

  // Toggle filter panel
  const toggleFilters = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    filterValues,
    filterOptions,
    activeFilterCount,
    isOpen,
    updateFilters,
    clearFilters,
    toggleFilters,
    setFilterValues,
  };
}
