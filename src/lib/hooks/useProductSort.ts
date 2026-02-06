import { useState, useEffect, useCallback } from 'react';

const getStorageKey = (merchantId: string) => `product-sort-order-${merchantId}`;

interface UseProductSortOptions {
  merchantId: string;
  products: { id: string }[];
}

interface UseProductSortReturn {
  /** Product IDs in the custom sort order */
  sortOrder: string[];
  /** Update the sort order with a new array of product IDs */
  setSortOrder: (order: string[]) => void;
  /** Move a product from one index to another */
  moveProduct: (fromIndex: number, toIndex: number) => void;
  /** Get products sorted according to the custom order */
  getSortedProducts: <T extends { id: string }>(products: T[]) => T[];
  /** Reset sort order to default (creation order) */
  resetSortOrder: () => void;
}

/**
 * Hook for managing product sort order in localStorage
 * The sort order is persisted per merchant
 */
export function useProductSort({
  merchantId,
  products,
}: UseProductSortOptions): UseProductSortReturn {
  const [sortOrder, setSortOrderState] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load sort order from localStorage on mount
  useEffect(() => {
    if (!merchantId || isInitialized) return;

    try {
      const stored = localStorage.getItem(getStorageKey(merchantId));
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        // Filter to only include products that exist
        const productIds = new Set(products.map((p) => p.id));
        const validOrder = parsed.filter((id) => productIds.has(id));
        // Add any new products that aren't in the sort order
        const newProducts = products.filter((p) => !validOrder.includes(p.id));
        setSortOrderState([...validOrder, ...newProducts.map((p) => p.id)]);
      } else {
        // Default: use current product order
        setSortOrderState(products.map((p) => p.id));
      }
    } catch {
      setSortOrderState(products.map((p) => p.id));
    }
    setIsInitialized(true);
  }, [merchantId, products, isInitialized]);

  // Update sort order when products change (e.g., new product added)
  useEffect(() => {
    if (!isInitialized) return;

    const productIds = new Set(products.map((p) => p.id));
    const currentOrderSet = new Set(sortOrder);

    // Add new products to the end
    const newProducts = products.filter((p) => !currentOrderSet.has(p.id));
    // Remove deleted products
    const validOrder = sortOrder.filter((id) => productIds.has(id));

    if (newProducts.length > 0 || validOrder.length !== sortOrder.length) {
      setSortOrderState([...validOrder, ...newProducts.map((p) => p.id)]);
    }
  }, [products, sortOrder, isInitialized]);

  // Save to localStorage whenever sort order changes
  const setSortOrder = useCallback(
    (newOrder: string[]) => {
      setSortOrderState(newOrder);
      if (merchantId) {
        try {
          localStorage.setItem(getStorageKey(merchantId), JSON.stringify(newOrder));
        } catch {
          // Ignore storage errors
        }
      }
    },
    [merchantId]
  );

  // Move product from one position to another
  const moveProduct = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setSortOrderState((prev) => {
        const newOrder = [...prev];
        const [movedItem] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, movedItem);

        // Save to localStorage
        if (merchantId) {
          try {
            localStorage.setItem(getStorageKey(merchantId), JSON.stringify(newOrder));
          } catch {
            // Ignore storage errors
          }
        }

        return newOrder;
      });
    },
    [merchantId]
  );

  // Get products sorted according to custom order
  const getSortedProducts = useCallback(
    <T extends { id: string }>(items: T[]): T[] => {
      if (!sortOrder.length) return items;

      const orderMap = new Map(sortOrder.map((id, index) => [id, index]));

      return [...items].sort((a, b) => {
        const aIndex = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const bIndex = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        return aIndex - bIndex;
      });
    },
    [sortOrder]
  );

  // Reset to default order (by creation date or current API order)
  const resetSortOrder = useCallback(() => {
    const defaultOrder = products.map((p) => p.id);
    setSortOrderState(defaultOrder);
    if (merchantId) {
      try {
        localStorage.setItem(getStorageKey(merchantId), JSON.stringify(defaultOrder));
      } catch {
        // Ignore storage errors
      }
    }
  }, [merchantId, products]);

  return {
    sortOrder,
    setSortOrder,
    moveProduct,
    getSortedProducts,
    resetSortOrder,
  };
}
