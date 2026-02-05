import {
  useState, useEffect, useCallback, useMemo,
} from 'react';

const getStorageKey = (merchantId: string) => `category-sort-order-${merchantId}`;

interface CategorySortData {
  categoryOrder: string[];
  productOrderByCategory: Record<string, string[]>;
}

interface UseCategorySortOptions {
  merchantId: string;
  products: { id: string; category?: string | null }[];
}

interface UseCategorySortReturn {
  /** Categories in custom order */
  categoryOrder: string[];
  /** Product IDs grouped by category in custom order */
  productOrderByCategory: Record<string, string[]>;
  /** Reorder categories */
  setCategoryOrder: (order: string[]) => void;
  /** Reorder products within a specific category */
  setProductOrderInCategory: (category: string, productIds: string[]) => void;
  /** Get products sorted by category order and within-category order */
  getSortedProductsByCategory: <T extends { id: string; category?: string | null }>(
    products: T[]
  ) => { category: string; products: T[] }[];
  /** Reset to default order */
  resetOrder: () => void;
}

/**
 * Hook for managing category and product order within categories
 * Persisted in localStorage per merchant
 */
export function useCategorySort({
  merchantId,
  products,
}: UseCategorySortOptions): UseCategorySortReturn {
  const [sortData, setSortData] = useState<CategorySortData>({
    categoryOrder: [],
    productOrderByCategory: {},
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Extract categories from products
  const productCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach((p) => {
      categories.add(p.category?.trim() || 'Uncategorized');
    });
    return Array.from(categories).sort();
  }, [products]);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const groups: Record<string, string[]> = {};
    products.forEach((p) => {
      const cat = p.category?.trim() || 'Uncategorized';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p.id);
    });
    return groups;
  }, [products]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!merchantId || isInitialized) return;

    try {
      const stored = localStorage.getItem(getStorageKey(merchantId));
      if (stored) {
        const parsed = JSON.parse(stored) as CategorySortData;
        // Validate and merge with current categories
        const validCategoryOrder = parsed.categoryOrder.filter((c) => productCategories.includes(c));
        const newCategories = productCategories.filter((c) => !validCategoryOrder.includes(c));
        const categoryOrder = [...validCategoryOrder, ...newCategories];

        // Validate product order within each category
        const productOrderByCategory: Record<string, string[]> = {};
        categoryOrder.forEach((cat) => {
          const currentProducts = new Set(productsByCategory[cat] || []);
          const savedOrder = parsed.productOrderByCategory[cat] || [];
          const validOrder = savedOrder.filter((id) => currentProducts.has(id));
          const newProducts = (productsByCategory[cat] || []).filter((id) => !validOrder.includes(id));
          productOrderByCategory[cat] = [...validOrder, ...newProducts];
        });

        setSortData({ categoryOrder, productOrderByCategory });
      } else {
        // Default order
        setSortData({
          categoryOrder: productCategories,
          productOrderByCategory: { ...productsByCategory },
        });
      }
    } catch {
      setSortData({
        categoryOrder: productCategories,
        productOrderByCategory: { ...productsByCategory },
      });
    }
    setIsInitialized(true);
  }, [merchantId, products, isInitialized, productCategories, productsByCategory]);

  // Save to localStorage
  const saveToStorage = useCallback(
    (data: CategorySortData) => {
      if (merchantId) {
        try {
          localStorage.setItem(getStorageKey(merchantId), JSON.stringify(data));
        } catch {
          // Ignore storage errors
        }
      }
    },
    [merchantId],
  );

  const setCategoryOrder = useCallback(
    (order: string[]) => {
      setSortData((prev) => {
        const newData = { ...prev, categoryOrder: order };
        saveToStorage(newData);
        return newData;
      });
    },
    [saveToStorage],
  );

  const setProductOrderInCategory = useCallback(
    (category: string, productIds: string[]) => {
      setSortData((prev) => {
        const newData = {
          ...prev,
          productOrderByCategory: {
            ...prev.productOrderByCategory,
            [category]: productIds,
          },
        };
        saveToStorage(newData);
        return newData;
      });
    },
    [saveToStorage],
  );

  const getSortedProductsByCategory = useCallback(
    <T extends { id: string; category?: string | null }>(items: T[]) => {
      const { categoryOrder, productOrderByCategory } = sortData;
      const grouped: Record<string, T[]> = {};

      items.forEach((item) => {
        const cat = item.category?.trim() || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
      });

      return categoryOrder
        .filter((cat) => grouped[cat]?.length > 0)
        .map((cat) => {
          const catProducts = grouped[cat];
          const order = productOrderByCategory[cat] || [];
          const orderMap = new Map(order.map((id, idx) => [id, idx]));
          const sorted = [...catProducts].sort((a, b) => {
            const aIdx = orderMap.get(a.id) ?? Number.MAX_SAFE_INTEGER;
            const bIdx = orderMap.get(b.id) ?? Number.MAX_SAFE_INTEGER;
            return aIdx - bIdx;
          });
          return { category: cat, products: sorted };
        });
    },
    [sortData],
  );

  const resetOrder = useCallback(() => {
    const defaultData = {
      categoryOrder: productCategories,
      productOrderByCategory: { ...productsByCategory },
    };
    setSortData(defaultData);
    saveToStorage(defaultData);
  }, [productCategories, productsByCategory, saveToStorage]);

  return {
    categoryOrder: sortData.categoryOrder,
    productOrderByCategory: sortData.productOrderByCategory,
    setCategoryOrder,
    setProductOrderInCategory,
    getSortedProductsByCategory,
    resetOrder,
  };
}
