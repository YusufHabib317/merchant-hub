import {
  Container,
  Box,
  Text,
  Center,
  Loader,
  Pagination,
} from '@mantine/core';
import { ProductList } from '@/components/products/ProductList';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductViewControls, ViewMode } from '@/components/products/ProductViewControls';
import { Product } from '@/schemas/product';

interface MerchantProductsProps {
  isLoading: boolean;
  products: Product[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  search: string;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  pagination?: { totalPages: number };
  page: number;
}

export function MerchantProducts({
  isLoading,
  products,
  viewMode,
  setViewMode,
  search,
  setSearch,
  setPage,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  pagination = undefined,
  page,
}: MerchantProductsProps) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <Center py="xl">
          <Loader />
        </Center>
      );
    }

    if (products.length === 0) {
      return (
        <Box ta="center" py={60}>
          <Text size="xl" c="dimmed">
            No products found
          </Text>
        </Box>
      );
    }

    return (
      <>
        {viewMode === 'grid' ? (
          <ProductList products={products} />
        ) : (
          <ProductTable products={products} />
        )}

        {pagination && pagination.totalPages > 1 && (
          <Center mt="xl">
            <Pagination
              total={pagination.totalPages}
              value={page}
              onChange={setPage}
            />
          </Center>
        )}
      </>
    );
  };

  return (
    <Container size="lg" py={60}>
      <ProductViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onSortChange={setSortBy}
        onSortOrderChange={setSortOrder}
        initialSearch={search}
        initialSort={sortBy}
        initialSortOrder={sortOrder}
      />

      {renderContent()}
    </Container>
  );
}
