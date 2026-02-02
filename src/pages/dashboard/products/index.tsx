import {
  Title,
  Button,
  Group,
  Stack,
  Text,
  Loader,
  Center,
  Pagination,
  Alert,
} from '@mantine/core';
import { IconPlus, IconAlertCircle, IconFileExport } from '@tabler/icons-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductList } from '@/components/products/ProductList';
import { useProducts } from '@/lib/hooks/useProducts';
import { useMyMerchant } from '@/lib/hooks/useMerchants';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

const ITEMS_PER_PAGE = 20;

export default function ProductsPage() {
  const { toNewProduct, toSettings, toExportProducts } = useAppRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, error } = useProducts(undefined, currentPage, ITEMS_PER_PAGE);
  const { data: merchant, isLoading: merchantLoading, error: merchantError } = useMyMerchant();

  const products = data?.products || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const hasMerchant = !!merchant;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={1}>Products</Title>
            {hasMerchant && (
              <Group>
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
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="No Store Found"
              color="yellow"
              variant="light"
            >
              <Stack gap="md">
                <Text size="sm">
                  You need to create a store before you can add products.
                  Go to Settings to set up your merchant profile.
                </Text>
                <Button
                  onClick={toSettings}
                  variant="filled"
                  color="blue"
                  size="sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  Go to Settings
                </Button>
              </Stack>
            </Alert>
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

          {!isLoading && products.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              No products yet
            </Text>
          )}

          {products.length > 0 && (
            <>
              <ProductList products={products} />
              <Center mt="lg">
                <Pagination
                  value={currentPage}
                  onChange={setCurrentPage}
                  total={totalPages}
                />
              </Center>
            </>
          )}
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
