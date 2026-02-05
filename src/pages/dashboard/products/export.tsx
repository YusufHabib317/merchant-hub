/* eslint-disable max-lines */
import {
  Title,
  Stack,
  Text,
  Button,
  Group,
  Checkbox,
  Loader,
  Center,
  Alert,
  ColorInput,
  Slider,
  FileInput,
  Box,
  Paper,
  ScrollArea,
  Badge,
  SimpleGrid,
  ThemeIcon,
  SegmentedControl,
  Collapse,
} from '@mantine/core';
import {
  IconDownload,
  IconCheck,
  IconShare,
  IconPhoto,
  IconPalette,
  IconListCheck,
  IconEye,
  IconCurrencyDollar,
  IconGripVertical,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { useState, useRef, useEffect } from 'react';
import { useLocalStorage } from '@mantine/hooks';
import { Reorder, useDragControls } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProducts } from '@/lib/hooks/useProducts';
import { TemplateSelector } from '@/components/templates/TemplateSelector';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import type { ExportProduct, PriceListStyleOptions } from '@/components/templates/types';
import { exportToImage, downloadImage, shareImage } from '@/utils/image-export';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useProductSort } from '@/lib/hooks';
import useTranslation from 'next-translate/useTranslation';

interface SortableExportItemProps {
  product: ExportProduct;
  isSelected: boolean;
  onToggle: () => void;
}

function SortableExportItem({ product, isSelected, onToggle }: SortableExportItemProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={product.id}
      dragListener={false}
      dragControls={controls}
      style={{ listStyle: 'none' }}
    >
      <Paper
        p="sm"
        withBorder
        style={{
          cursor: 'pointer',
          borderColor: isSelected
            ? 'var(--mantine-color-blue-filled)'
            : undefined,
          backgroundColor: isSelected
            ? 'var(--mantine-color-blue-light)'
            : undefined,
        }}
        onClick={onToggle}
      >
        <Group wrap="nowrap" align="flex-start">
          <ThemeIcon
            variant="transparent"
            color="gray"
            style={{ cursor: 'grab', touchAction: 'none' }}
            onPointerDown={(e) => controls.start(e)}
            onClick={(e) => e.stopPropagation()}
          >
            <IconGripVertical size={18} />
          </ThemeIcon>
          <Checkbox
            label={product.name}
            description={`$${product.priceUSD}`}
            checked={isSelected}
            onChange={() => {}} // Handled by Paper onClick
            styles={{ body: { alignItems: 'center' }, input: { cursor: 'pointer' }, label: { cursor: 'pointer' } }}
            style={{ flex: 1, pointerEvents: 'none' }}
          />
        </Group>
      </Paper>
    </Reorder.Item>
  );
}

export default function ExportProductsPage() {
  const { data: session } = authClient.useSession();
  const { data, isLoading } = useProducts(undefined, { page: 1, limit: 1000 });
  const rawProducts = (data?.products || []) as ExportProduct[];
  const { t } = useTranslation('common');

  const { data: merchantData } = useQuery({
    queryKey: ['merchant'],
    queryFn: async () => {
      const { data: response } = await apiClient.get(API_ENDPOINTS.merchants.me);
      return response.data;
    },
    enabled: !!session?.user?.id,
  });

  // Apply custom sort order to products
  const { getSortedProducts, setSortOrder } = useProductSort({
    merchantId: merchantData?.id || '',
    products: rawProducts,
  });

  const products = getSortedProducts(rawProducts);

  const [selectedProducts, setSelectedProducts] = useLocalStorage<string[]>({
    key: 'export-selected-products',
    defaultValue: [],
  });
  const [template, setTemplate] = useLocalStorage<string>({
    key: 'export-template',
    defaultValue: 'elegant',
  });
  const [currencyDisplay, setCurrencyDisplay] = useLocalStorage<'usd' | 'syp' | 'both'>({
    key: 'export-currency-display',
    defaultValue: 'both',
  });
  const [bgImageFile, setBgImageFile] = useState<File | null>(null);
  const [priceListStyle, setPriceListStyle] = useState<PriceListStyleOptions>({
    pageBgColor: '#ffffff',
    pageBgOpacity: 1,
    bgImageDataUrl: null,
    bgImageOpacity: 0.2,

    cardBgColor: '#ffffff',
    cardBgOpacity: 0.95,

    categoryHeaderBg: '#333333',
    categoryHeaderText: '#ffffff',
    tableHeaderBg: '#f1f3f5',
    tableHeaderText: '#000000',

    rowOddBg: '#ffffff',
    rowEvenBg: '#f8f9fa',
    rowText: '#000000',

    currencyDisplay: 'both',
  });

  useEffect(() => {
    const saved = localStorage.getItem('export-price-list-style');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPriceListStyle((prev) => ({
          ...prev,
          ...parsed,
          bgImageDataUrl: null, // Always start without image to avoid storage limits
        }));
      } catch {
        //
      }
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bgImageDataUrl, ...styleToSave } = priceListStyle;
    localStorage.setItem('export-price-list-style', JSON.stringify(styleToSave));
  }, [priceListStyle]);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleBgImageChange = (file: File | null) => {
    setBgImageFile(file);
    if (!file) {
      setPriceListStyle((prev) => ({ ...prev, bgImageDataUrl: null }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      setPriceListStyle((prev) => ({ ...prev, bgImageDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

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
    if (selectedProducts.length === 0) {
      setError(t('export_products.no_products'));
      return;
    }
    if (!previewRef.current) return;

    setIsExporting(true);
    setError(null);
    try {
      const dataUrl = await exportToImage(previewRef.current, { cacheBust: false });
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
    if (selectedProducts.length === 0) {
      setError(t('export_products.no_products'));
      return;
    }
    if (!previewRef.current) return;

    setIsExporting(true);
    setError(null);
    try {
      const dataUrl = await exportToImage(previewRef.current, { cacheBust: false });
      await shareImage(dataUrl, merchantData?.name || 'My Store');
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch {
      setError('Failed to share. Downloading instead.');
      const dataUrl = await exportToImage(previewRef.current, { cacheBust: false });
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
        <Stack gap="xl">
          {/* Header Section */}
          <Box>
            <Group justify="space-between" align="flex-start" wrap="wrap">
              <Box>
                <Title order={1} mb="xs">Export Products</Title>
                <Text c="dimmed" maw={600}>
                  Create beautiful product catalogs for social media, print materials, or digital sharing.
                  Select products, choose a template, and customize the appearance.
                </Text>
              </Box>
              <Group>
                <Button
                  size="md"
                  leftSection={<IconDownload size={18} />}
                  onClick={handleExport}
                  loading={isExporting}
                  disabled={selectedProducts.length === 0}
                >
                  Download Image
                </Button>
                <Button
                  size="md"
                  variant="light"
                  leftSection={<IconShare size={18} />}
                  onClick={handleShare}
                  loading={isExporting}
                  disabled={selectedProducts.length === 0}
                >
                  Share
                </Button>
              </Group>
            </Group>
          </Box>

          {/* Alerts */}
          {exportSuccess && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Success" withCloseButton>
              Products exported successfully!
            </Alert>
          )}

          {error && (
            <Alert icon={<IconDownload size={16} />} color="red" title="Error" withCloseButton>
              {error}
            </Alert>
          )}

          {/* Main Content */}
          <Stack gap="md">
            {/* Product Selection and Template - Side by Side on Desktop */}
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              {/* Product Selection */}
              <Paper withBorder radius="md" p="md">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="sm" variant="light" color="blue">
                    <IconListCheck size={14} />
                  </ThemeIcon>
                  <Text fw={600}>Select Products</Text>
                  <Badge size="sm" variant="light" color={selectedProducts.length > 0 ? 'green' : 'gray'}>
                    {selectedProducts.length}
                    {' '}
                    selected
                  </Badge>
                </Group>

                <Stack gap="md">
                  <Group gap="xs">
                    <Button variant="light" size="xs" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="subtle" size="xs" onClick={deselectAll}>
                      Clear
                    </Button>
                  </Group>

                  {products.length === 0 ? (
                    <Paper p="xl" ta="center" bg="var(--mantine-color-gray-light)">
                      <Text c="dimmed">
                        No products available. Create some products first.
                      </Text>
                    </Paper>
                  ) : (
                    <ScrollArea.Autosize mah={280} offsetScrollbars>
                      <Reorder.Group
                        axis="y"
                        values={products.map((p) => p.id)}
                        onReorder={setSortOrder}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                      >
                        {products.map((product) => (
                          <SortableExportItem
                            key={product.id}
                            product={product}
                            isSelected={selectedProducts.includes(product.id)}
                            onToggle={() => toggleProduct(product.id)}
                          />
                        ))}
                      </Reorder.Group>
                    </ScrollArea.Autosize>
                  )}
                </Stack>
              </Paper>

              {/* Template Selection */}
              <Paper withBorder radius="md" p="md">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="sm" variant="light" color="violet">
                    <IconPhoto size={14} />
                  </ThemeIcon>
                  <Text fw={600}>Template Style</Text>
                </Group>
                <TemplateSelector value={template} onChange={setTemplate} />
              </Paper>
            </SimpleGrid>

            {/* Customization - Full Width */}
            {template === 'elegant' && (
              <Paper withBorder radius="md" p="md">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="sm" variant="light" color="orange">
                    <IconPalette size={14} />
                  </ThemeIcon>
                  <Text fw={600}>Customize Template</Text>
                </Group>

                {/* Currency Display Selector */}
                <Box>
                  <Group gap="xs" mb="xs">
                    <ThemeIcon size="xs" variant="light" color="blue">
                      <IconCurrencyDollar size={12} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Currency Display</Text>
                  </Group>
                  <SegmentedControl
                    value={currencyDisplay}
                    onChange={(value) => setCurrencyDisplay(value as 'usd' | 'syp' | 'both')}
                    data={[
                      { label: 'USD Only', value: 'usd' },
                      { label: 'SYP Only', value: 'syp' },
                      { label: 'Both Currencies', value: 'both' },
                    ]}
                    fullWidth
                  />
                </Box>
              </Paper>
            )}

            {template === 'price-list' && (
              <Paper withBorder radius="md" p="md">
                <Group
                  gap="xs"
                  mb="md"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsCustomizeOpen((o) => !o)}
                  justify="space-between"
                >
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="orange">
                      <IconPalette size={14} />
                    </ThemeIcon>
                    <Text fw={600}>Customize Price List</Text>
                  </Group>
                  {isCustomizeOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                </Group>

                <Collapse in={isCustomizeOpen}>
                  {/* Currency Display Selector */}
                  <Box mb="lg">
                    <Group gap="xs" mb="xs">
                      <ThemeIcon size="xs" variant="light" color="blue">
                        <IconCurrencyDollar size={12} />
                      </ThemeIcon>
                      <Text size="sm" fw={500}>Currency Display</Text>
                    </Group>
                    <SegmentedControl
                      value={currencyDisplay}
                      onChange={(value) => setCurrencyDisplay(value as 'usd' | 'syp' | 'both')}
                      data={[
                        { label: 'USD Only', value: 'usd' },
                        { label: 'SYP Only', value: 'syp' },
                        { label: 'Both Currencies', value: 'both' },
                      ]}
                      fullWidth
                    />
                  </Box>

                  <Text size="sm" fw={500} mb="md" c="dimmed">Color Customization</Text>

                  <SimpleGrid
                    cols={{
                      base: 1, sm: 2, md: 3, lg: 4,
                    }}
                    spacing="lg"
                  >
                    {/* Page Background */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Page Background</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Color"
                          value={priceListStyle.pageBgColor}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, pageBgColor: value }))}
                          format="hex"
                        />
                        <Box>
                          <Text size="xs" mb={4}>Opacity</Text>
                          <Slider
                            size="sm"
                            min={0}
                            max={100}
                            value={Math.round(priceListStyle.pageBgOpacity * 100)}
                            onChange={(v) => setPriceListStyle((prev) => ({ ...prev, pageBgOpacity: v / 100 }))}
                          />
                        </Box>
                      </Stack>
                    </Box>

                    {/* Background Image */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Background Image</Text>
                      <Stack gap="xs">
                        <FileInput
                          size="sm"
                          placeholder="Choose image"
                          accept="image/*"
                          value={bgImageFile}
                          onChange={handleBgImageChange}
                          clearable
                        />
                        <Box>
                          <Text size="xs" mb={4}>Image Opacity</Text>
                          <Slider
                            size="sm"
                            min={0}
                            max={100}
                            disabled={!priceListStyle.bgImageDataUrl}
                            value={Math.round(priceListStyle.bgImageOpacity * 100)}
                            onChange={(v) => setPriceListStyle((prev) => ({ ...prev, bgImageOpacity: v / 100 }))}
                          />
                        </Box>
                      </Stack>
                    </Box>

                    {/* Category Block */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Category Block</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Background"
                          value={priceListStyle.cardBgColor}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, cardBgColor: value }))}
                          format="hex"
                        />
                        <Box>
                          <Text size="xs" mb={4}>Opacity</Text>
                          <Slider
                            size="sm"
                            min={0}
                            max={100}
                            value={Math.round(priceListStyle.cardBgOpacity * 100)}
                            onChange={(v) => setPriceListStyle((prev) => ({ ...prev, cardBgOpacity: v / 100 }))}
                          />
                        </Box>
                      </Stack>
                    </Box>

                    {/* Category Header Background */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Category Header</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Background"
                          value={priceListStyle.categoryHeaderBg}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, categoryHeaderBg: value }))}
                          format="hex"
                        />
                        <ColorInput
                          size="sm"
                          label="Text"
                          value={priceListStyle.categoryHeaderText}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, categoryHeaderText: value }))}
                          format="hex"
                        />
                      </Stack>
                    </Box>

                    {/* Table Header */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Table Header</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Background"
                          value={priceListStyle.tableHeaderBg}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, tableHeaderBg: value }))}
                          format="hex"
                        />
                        <ColorInput
                          size="sm"
                          label="Text"
                          value={priceListStyle.tableHeaderText}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, tableHeaderText: value }))}
                          format="hex"
                        />
                      </Stack>
                    </Box>

                    {/* Row Odd */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Odd Rows</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Background"
                          value={priceListStyle.rowOddBg}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, rowOddBg: value }))}
                          format="hex"
                        />
                      </Stack>
                    </Box>

                    {/* Row Even */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Even Rows</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Background"
                          value={priceListStyle.rowEvenBg}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, rowEvenBg: value }))}
                          format="hex"
                        />
                      </Stack>
                    </Box>

                    {/* Row Text */}
                    <Box>
                      <Text size="sm" fw={500} mb="xs">Row Text</Text>
                      <Stack gap="xs">
                        <ColorInput
                          size="sm"
                          label="Color"
                          value={priceListStyle.rowText}
                          onChange={(value) => setPriceListStyle((prev) => ({ ...prev, rowText: value }))}
                          format="hex"
                        />
                      </Stack>
                    </Box>
                  </SimpleGrid>
                </Collapse>
              </Paper>
            )}

            {/* Preview - Full Width */}
            <Paper
              withBorder
              radius="md"
              p="md"
              bg="var(--mantine-color-gray-light)"
            >
              <Group gap="xs" mb="md">
                <ThemeIcon size="sm" variant="light" color="teal">
                  <IconEye size={14} />
                </ThemeIcon>
                <Text size="sm" fw={600}>Preview</Text>
              </Group>

              {selectedProducts.length > 0 ? (
                <Box
                  style={{
                    overflow: 'auto',
                    maxHeight: '70vh',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <TemplatePreview
                    template={template}
                    products={selectedProductsData}
                    merchantName={merchantData?.name || 'My Store'}
                    merchantAddress={merchantData?.address}
                    priceListStyle={priceListStyle}
                    watermark={hasWatermark}
                    currencyDisplay={currencyDisplay}
                    ref={previewRef}
                  />
                </Box>
              ) : (
                <Center h={400}>
                  <Stack align="center" gap="sm">
                    <ThemeIcon size={60} variant="light" color="gray" radius="xl">
                      <IconPhoto size={30} />
                    </ThemeIcon>
                    <Text c="dimmed" ta="center">
                      Select products to see a preview
                    </Text>
                  </Stack>
                </Center>
              )}
            </Paper>
          </Stack>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
