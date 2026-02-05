import {
  Title,
  Button,
  Group,
  Stack,
  Text,
  Loader,
  Center,
  Menu,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus,
  IconFileImport,
  IconDownload,
  IconPhoto,
  IconChevronDown,
} from '@tabler/icons-react';
import {
  useState, useEffect, useCallback, useRef,
} from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useLocalStorage } from '@mantine/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductViewControls, ViewMode } from '@/components/products/ProductViewControls';
import { useProducts, useDeleteProduct, ProductQueryParams } from '@/lib/hooks/useProducts';
import { useMyMerchant } from '@/lib/hooks/useMerchants';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import { NoStoreAlert } from '@/components/products/NoStoreAlert';
import { ProductsContent } from '@/components/products/ProductsContent';
import { DeleteProductModal } from '@/components/products/DeleteProductModal';
import { ImportCSVModal } from '@/components/products/ImportCSVModal';
import { apiClient } from '@/lib/api/client';
import { downloadCSV } from '@/utils/csv';
import { ProductFilters } from '@/components/products/ProductFilters';
import { useProductFilters } from '@/lib/hooks/useProductFilters';

export default function ProductsPage() {
  const { t } = useTranslation('common');
  const {
    toNewProduct, toSettings, toExportProducts, toEditProduct, router,
  } = useAppRouter();

  // Next router object identity can change when the query changes.
  // Keep a ref so callbacks (like setPage) can stay stable.
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>({
    key: 'products-view-mode',
    defaultValue: 'grid',
  });

  const [page, setPageState] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlPage = parseInt(urlParams.get('page') || '1', 10);
      return Number.isNaN(urlPage) || urlPage < 1 ? 1 : urlPage;
    }
    return 1;
  });

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);

    const r = routerRef.current;

    // eslint-disable-next-line no-void
    void r.replace(
      {
        pathname: r.pathname,
        query: {
          ...r.query,
          page: String(newPage),
        },
      },
      undefined,
      { shallow: true, scroll: false },
    );
  }, []);

  const [search, setSearch] = useState('');

  // Memoize search handler so ProductViewControls' effect doesn't re-run every render.
  // (Otherwise it keeps calling onSearchChange() and we keep resetting to page 1.)
  const handleSearchChange = useCallback((val: string) => {
    setSearch((prev) => {
      // Only reset pagination if the search value actually changed.
      // This avoids forcing the user back to page 1 on initial mount.
      if (prev === val) return prev;
      setPage(1);
      return val;
    });
  }, [setPage]);
  const [sortBy, setSortBy] = useLocalStorage<NonNullable<ProductQueryParams['sortBy']>>({
    key: 'products-sort-by',
    defaultValue: 'createdAt',
  });
  const [sortOrder, setSortOrder] = useLocalStorage<'asc' | 'desc'>({
    key: 'products-sort-order',
    defaultValue: 'desc',
  });

  // Delete state
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const deleteProduct = useDeleteProduct();

  // Import modal state
  const [importModalOpened, setImportModalOpened] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Fetch all products for filter options (categories and tags)
  const { data: allProductsData } = useProducts(undefined, { page: 1, limit: 1000 });
  const allProducts = allProductsData?.products || [];

  // Filter state - using the reusable hook with all products for options
  const {
    filterValues,
    filterOptions,
    isOpen: filtersOpen,
    updateFilters,
    clearFilters,
    toggleFilters,
  } = useProductFilters({ products: allProducts });

  const { data, isLoading, error } = useProducts(undefined, {
    page,
    limit: 12, // 12 works well for grid (2, 3, 4 cols)
    search,
    sortBy,
    sortOrder,
    // Server-side filters
    condition: filterValues.condition,
    categories: filterValues.categories,
    stock: filterValues.stock,
    published: filterValues.published,
    tags: filterValues.tags,
    minPrice: filterValues.minPrice,
    maxPrice: filterValues.maxPrice,
  });

  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useMyMerchant();

  const products = data?.products || [];
  const pagination = data?.pagination;
  const hasMerchant = !!merchant;

  // Auto-adjust page if current page exceeds total pages (e.g., after deleting products)
  useEffect(() => {
    if (
      pagination
      && pagination.totalPages > 0
      && page > pagination.totalPages
    ) {
      setPage(pagination.totalPages);
    }
  }, [pagination, page, setPage]);

  const handleExportClick = () => {
    if (!pagination?.total) {
      notifications.show({
        title: t('warning'),
        message: t('no_products_to_export'),
        color: 'yellow',
      });
      return;
    }
    toExportProducts();
  };

  const handleDelete = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete, {
        onSuccess: () => {
          setProductToDelete(null);
        },
      });
    }
  };

  const handleExportCSV = async () => {
    if (!pagination?.total) {
      notifications.show({
        title: t('warning'),
        message: t('no_products_to_export'),
        color: 'yellow',
      });
      return;
    }

    setIsExportingCSV(true);
    try {
      const response = await apiClient.get('/products/export-csv', {
        responseType: 'text',
      });
      downloadCSV(response.data, `products-${Date.now()}.csv`);
      notifications.show({
        title: t('success'),
        message: t('csv_exported_successfully'),
        color: 'green',
      });
    } catch {
      notifications.show({
        title: t('error'),
        message: t('csv_export_failed'),
        color: 'red',
      });
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={1}>{t('products')}</Title>
            {hasMerchant && (
              <Group gap="xs" wrap="nowrap">
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <Button
                      variant="light"
                      rightSection={<IconChevronDown size={14} />}
                    >
                      {t('import_export')}
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{t('export')}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconPhoto size={16} />}
                      onClick={handleExportClick}
                    >
                      {t('export_as_image')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconDownload size={16} />}
                      onClick={handleExportCSV}
                      disabled={isExportingCSV}
                    >
                      {t('export_as_csv')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Label>{t('import')}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconFileImport size={16} />}
                      onClick={() => setImportModalOpened(true)}
                    >
                      {t('import_from_csv')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={toNewProduct}
                >
                  {t('add_product')}
                </Button>
              </Group>
            )}
          </Group>

          {!merchantLoading && (merchantError || !merchant) && (
            <NoStoreAlert onSettingsClick={toSettings} />
          )}

          {hasMerchant && (
            <>
              <ProductViewControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSearchChange={handleSearchChange}
                onSortChange={setSortBy as (sort: string) => void}
                onSortOrderChange={setSortOrder}
                initialSearch={search}
                initialSort={sortBy}
                initialSortOrder={sortOrder}
              />

              {/* Server-side Filters */}
              <ProductFilters
                values={filterValues}
                options={filterOptions}
                onChange={(newValues) => {
                  updateFilters(newValues);
                  setPage(1); // Reset page on filter change
                }}
                onClear={() => {
                  clearFilters();
                  setPage(1);
                }}
                isOpen={filtersOpen}
                onToggle={toggleFilters}
                showToggle
              />
            </>
          )}

          {isLoading && (
            <Center py="xl">
              <Loader />
            </Center>
          )}

          {error && (
            <Text c="red">
              {t('error_loading_products')}
            </Text>
          )}

          <ProductsContent
            isLoading={isLoading}
            products={products}
            viewMode={viewMode}
            pagination={pagination}
            page={page}
            setPage={setPage}
            toEditProduct={toEditProduct}
            setProductToDelete={setProductToDelete}
          />
        </Stack>

        <DeleteProductModal
          opened={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={handleDelete}
          loading={deleteProduct.isPending}
        />

        <ImportCSVModal
          opened={importModalOpened}
          onClose={() => setImportModalOpened(false)}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
