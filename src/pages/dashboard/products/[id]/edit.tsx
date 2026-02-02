import {
  Title,
  Stack,
  Button,
  Group,
  Loader,
  Center,
  Text,
} from '@mantine/core';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductForm } from '@/components/products/ProductForm';
import { useProduct, useUpdateProduct } from '@/lib/hooks/useProducts';
import { CreateProductInput } from '@/schemas/product';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

export default function EditProductPage() {
  const { toProducts, query } = useAppRouter();
  const { id } = query;
  const { data: product, isLoading, error } = useProduct(id as string);
  const updateProduct = useUpdateProduct();

  const handleSubmit = (data: CreateProductInput) => {
    updateProduct.mutate({ id: id as string, data }, {
      onSuccess: () => {
        toProducts();
      },
      // Error is already handled in the hook's onError callback
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Center py="xl">
            <Loader />
          </Center>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !product) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Text c="red">Failed to load product</Text>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={1}>Edit Product</Title>
          </Group>

          <ProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={updateProduct.isPending}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={toProducts}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
