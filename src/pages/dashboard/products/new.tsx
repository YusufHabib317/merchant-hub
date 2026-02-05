import {
  Title,
  Stack,
  Button,
  Group,
} from '@mantine/core';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ProductForm } from '@/components/products/ProductForm';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { CreateProductInput } from '@/schemas/product';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import useTranslation from 'next-translate/useTranslation';

export default function NewProductPage() {
  const { t } = useTranslation('common');
  const { toProducts } = useAppRouter();
  const createProduct = useCreateProduct();

  const handleSubmit = (data: CreateProductInput) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        toProducts();
      },
      // Error is already handled in the hook's onError callback
    });
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={1}>{t('add_new_product')}</Title>
          </Group>

          <ProductForm
            onSubmit={handleSubmit}
            isLoading={createProduct.isPending}
          />

          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={toProducts}
            >
              {t('cancel')}
            </Button>
          </Group>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
