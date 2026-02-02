import {
  Title,
  Stack,
  Card,
  Text,
  Button,
  Group,
  Checkbox,
  Grid,
  Loader,
  Center,
  Alert,
} from '@mantine/core';
import { IconDownload, IconCheck, IconShare } from '@tabler/icons-react';
import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProducts } from '@/lib/hooks/useProducts';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { ExportProduct } from '@/components/templates/ClassicTemplate';
import { exportToImage, downloadImage, shareImage } from '@/utils/image-export';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export default function ExportProductsPage() {
  const { data: session } = authClient.useSession();
  const { data, isLoading } = useProducts(undefined, 1, 100);
  const products = (data?.products || []) as ExportProduct[];

  const { data: merchantData } = useQuery({
    queryKey: ['merchant'],
    queryFn: async () => {
      const { data: response } = await apiClient.get(API_ENDPOINTS.merchants.me);
      return response.data;
    },
    enabled: !!session?.user?.id,
  });

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [template, setTemplate] = useState<string>('classic');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => (prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId]));
  };

  const selectAll = () => {
    setSelectedProducts(products.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedProducts([]);
  };

  const handleExport = async () => {
    if (!previewRef.current || selectedProducts.length === 0) return;

    setIsExporting(true);
    setError(null);
    try {
      const dataUrl = await exportToImage(previewRef.current);
      downloadImage(dataUrl, `products-${template}-${Date.now()}.png`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch {
      setError('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!previewRef.current || selectedProducts.length === 0) return;

    setIsExporting(true);
    setError(null);
    try {
      const dataUrl = await exportToImage(previewRef.current);
      await shareImage(dataUrl, merchantData?.name || 'My Store');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch {
      setError('Failed to share. Downloading instead.');
      const dataUrl = await exportToImage(previewRef.current);
      downloadImage(dataUrl, `products-${template}-${Date.now()}.png`);
    } finally {
      setIsExporting(false);
    }
  };

  const selectedProductsData = products.filter((p) => selectedProducts.includes(p.id));
  const hasWatermark = merchantData?.subscriptionTier === 'FREE';

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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Title order={1}>Export Products</Title>

          <Text c="dimmed">
            Select products and export them as an image for sharing on social media or printing.
          </Text>

          {exportSuccess && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Success">
              Products exported successfully!
            </Alert>
          )}

          {error && (
            <Alert icon={<IconDownload size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder padding="lg" radius="md" h="100%">
                <Stack gap="md">
                  <Title order={3}>Select Products</Title>

                  <Group>
                    <Button variant="light" size="xs" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="light" size="xs" onClick={deselectAll}>
                      Deselect All
                    </Button>
                  </Group>

                  {products.length === 0 ? (
                    <Text c="dimmed" ta="center" py="md">
                      No products available. Create some products first.
                    </Text>
                  ) : (
                    <Stack gap="xs" mah={400} style={{ overflowY: 'auto' }}>
                      {products.map((product) => (
                        <Checkbox
                          key={product.id}
                          label={`${product.name}`}
                          description={`$${product.priceUSD}`}
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                        />
                      ))}
                    </Stack>
                  )}

                  <Text size="sm" c="dimmed">
                    {selectedProducts.length}
                    {' '}
                    of
                    {products.length}
                    {' '}
                    products selected
                  </Text>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder padding="lg" radius="md" h="100%">
                <Stack gap="md">
                  <Title order={3}>Template</Title>

                  <TemplateSelector value={template} onChange={setTemplate} />

                  <Group grow>
                    <Button
                      leftSection={<IconDownload size={16} />}
                      onClick={handleExport}
                      loading={isExporting}
                      disabled={selectedProducts.length === 0}
                    >
                      Download
                    </Button>
                    <Button
                      variant="light"
                      leftSection={<IconShare size={16} />}
                      onClick={handleShare}
                      loading={isExporting}
                      disabled={selectedProducts.length === 0}
                    >
                      Share
                    </Button>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              {selectedProducts.length > 0 ? (
                <TemplatePreview
                  template={template}
                  products={selectedProductsData}
                  merchantName={merchantData?.name || 'My Store'}
                  watermark={hasWatermark}
                  ref={previewRef}
                />
              ) : (
                <Card withBorder padding="lg" radius="md" h="100%">
                  <Center h={300}>
                    <Text c="dimmed">Select products to see preview</Text>
                  </Center>
                </Card>
              )}
            </Grid.Col>
          </Grid>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
