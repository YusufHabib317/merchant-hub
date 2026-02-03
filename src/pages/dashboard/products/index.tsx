import {
  Title,
  Button,
  Group,
  Stack,
  Text,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconPlus,
  IconFileExport,
} from '@tabler/icons-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductViewControls, ViewMode } from '@/components/products/ProductViewControls';
import { useProducts, useDeleteProduct, ProductQueryParams } from '@/lib/hooks/useProducts';
import { useMyMerchant } from '@/lib/hooks/useMerchants';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import { NoStoreAlert } from '@/components/products/NoStoreAlert';
import { ProductsContent } from '@/components/products/ProductsContent';
import { DeleteProductModal } from '@/components/products/DeleteProductModal';

export default function ProductsPage() {
  const {
    toNewProduct, toSettings, toExportProducts, toEditProduct,
  } = useAppRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<NonNullable<ProductQueryParams['sortBy']>>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Delete state
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const deleteProduct = useDeleteProduct();

  const { data, isLoading, error } = useProducts(undefined, {
    page,
    limit: 12, // 12 works well for grid (2, 3, 4 cols)
    search,
    sortBy,
    sortOrder,
  });

  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useMyMerchant();

  const products = data?.products || [];
  const pagination = data?.pagination;
  const hasMerchant = !!merchant;

  const handleDelete = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete, {
        onSuccess: () => {
          setProductToDelete(null);
        },
      });
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={1}>Products</Title>
            {hasMerchant && (
              <Group gap="xs" wrap="nowrap">
                <Button
                  variant="light"
                  leftSection={<IconFileExport size={16} />}
                  onClick={toExportProducts}
                >
                  Export Products
                </Button>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={toNewProduct}
                >
                  Add Product
                </Button>
              </Group>
            )}
          </Group>

          {!merchantLoading && (merchantError || !merchant) && (
            <NoStoreAlert onSettingsClick={toSettings} />
          )}

          {hasMerchant && (
            <ProductViewControls
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSearchChange={(val) => {
                setSearch(val);
                setPage(1); // Reset page on search
              }}
              onSortChange={setSortBy as (sort: string) => void}
              onSortOrderChange={setSortOrder}
              initialSearch={search}
              initialSort={sortBy}
              initialSortOrder={sortOrder}
            />
          )}

          {isLoading && (
            <Center py="xl">
              <Loader />
            </Center>
          )}

          {error && (
            <Text c="red">
              Failed to load products. Please try again.
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
      </DashboardLayout>
    </ProtectedRoute>
  );
}
