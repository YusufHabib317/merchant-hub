import { Center, Pagination, Text } from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import { ProductList } from './ProductList';
import { ProductTable } from './ProductTable';
import { ViewMode } from './ProductViewControls';
import { Product } from '@/schemas/product';

interface ProductsContentProps {
  isLoading: boolean;
  products: Product[];
  viewMode: ViewMode;
  pagination?: { totalPages: number };
  page: number;
  setPage: (page: number) => void;
  toEditProduct: (id: string) => void;
  setProductToDelete: (id: string) => void;
}

export function ProductsContent({
  isLoading,
  products,
  viewMode,
  pagination = undefined,
  page,
  setPage,
  toEditProduct,
  setProductToDelete,
}: ProductsContentProps) {
  const { t } = useTranslation('common');

  if (!isLoading && products.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        {t('no_products_found')}
      </Text>
    );
  }

  if (!isLoading && products.length > 0) {
    return (
      <>
        {viewMode === 'grid' ? (
          <ProductList
            products={products}
            showActions
            onEdit={toEditProduct}
            onDelete={setProductToDelete}
          />
        ) : (
          <ProductTable
            products={products}
            showActions
            onEdit={(p) => toEditProduct(p.id)}
            onDelete={(p) => setProductToDelete(p.id)}
          />
        )}

        {pagination && pagination.totalPages > 1 && (
          <Center mt="xl">
            <Pagination total={pagination.totalPages} value={page} onChange={setPage} />
          </Center>
        )}
      </>
    );
  }

  return null;
}
