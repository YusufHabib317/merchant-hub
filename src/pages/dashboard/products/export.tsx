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
  MultiSelect,
  NumberInput,
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
  IconFilter,
  IconTag,
  IconPackage,
  IconCash,
} from '@tabler/icons-react';
import {
  useState, useRef, useEffect, useMemo,
} from 'react';
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

// Filter helper functions
const matchesCondition = (p: ExportProduct, conditionFilter: string) => conditionFilter === 'ALL' || p.condition === conditionFilter;

const matchesCategory = (p: ExportProduct, categoryFilter: string[]) => categoryFilter.length === 0 || categoryFilter.includes(p.category || '');

const matchesStock = (p: ExportProduct, stockFilter: string) => {
  if (stockFilter === 'IN_STOCK') return p.stock !== undefined && p.stock > 0;
  if (stockFilter === 'OUT_OF_STOCK') return !p.stock || p.stock <= 0;
  return true;
};

const matchesPublished = (p: ExportProduct, publishedFilter: string) => {
  if (publishedFilter === 'PUBLISHED') return p.isPublished === true;
  if (publishedFilter === 'UNPUBLISHED') return p.isPublished === false;
  return true;
};

const matchesTags = (p: ExportProduct, tagFilter: string[]) => {
  if (tagFilter.length === 0) return true;
  const productTags = p.tags || [];
  return tagFilter.some((tag) => productTags.includes(tag));
};

const matchesPrice = (p: ExportProduct, minPrice: number | string, maxPrice: number | string) => {
  const price = p.priceUSD;
  const minValid = minPrice === '' || (typeof minPrice === 'number' && price >= minPrice);
  const maxValid = maxPrice === '' || (typeof maxPrice === 'number' && price <= maxPrice);
  return minValid && maxValid;
};

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

/* eslint-disable complexity -- Main page component with extensive JSX rendering */
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
  const [conditionFilter, setConditionFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [stockFilter, setStockFilter] = useState<string>('ALL');
  const [publishedFilter, setPublishedFilter] = useState<string>('ALL');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number | string>('');
  const [maxPrice, setMaxPrice] = useState<number | string>('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Extract unique categories and tags from products
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    products.forEach((p) => {
      if (p.category) categories.add(p.category);
    });
    return Array.from(categories).sort();
  }, [products]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    products.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [products]);

  const filteredProducts = useMemo(() => products.filter((p) => matchesCondition(p, conditionFilter)
    && matchesCategory(p, categoryFilter)
    && matchesStock(p, stockFilter)
    && matchesPublished(p, publishedFilter)
    && matchesTags(p, tagFilter)
    && matchesPrice(p, minPrice, maxPrice)), [products, conditionFilter, categoryFilter, stockFilter, publishedFilter, tagFilter, minPrice, maxPrice]);

  const activeFilterCount = useMemo(() => {
    const filters = [
      conditionFilter !== 'ALL',
      categoryFilter.length > 0,
      stockFilter !== 'ALL',
      publishedFilter !== 'ALL',
      tagFilter.length > 0,
      minPrice !== '',
      maxPrice !== '',
    ];
    return filters.filter(Boolean).length;
  }, [conditionFilter, categoryFilter, stockFilter, publishedFilter, tagFilter, minPrice, maxPrice]);

  const clearAllFilters = () => {
    setConditionFilter('ALL');
    setCategoryFilter([]);
    setStockFilter('ALL');
    setPublishedFilter('ALL');
    setTagFilter([]);
    setMinPrice('');
    setMaxPrice('');
  };

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
    const newSelected = new Set(selectedProducts);
    filteredProducts.forEach((p) => newSelected.add(p.id));
    setSelectedProducts(Array.from(newSelected));
  };

  const deselectAll = () => {
    const toRemove = new Set(filteredProducts.map((p) => p.id));
    setSelectedProducts(selectedProducts.filter((id) => !toRemove.has(id)));
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
                  {/* Filter Section */}
                  <Paper withBorder p="sm" radius="sm" bg="var(--mantine-color-gray-0)">
                    <Group
                      gap="xs"
                      mb="xs"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setIsFiltersOpen((o) => !o)}
                      justify="space-between"
                    >
                      <Group gap="xs">
                        <ThemeIcon size="xs" variant="light" color="blue">
                          <IconFilter size={12} />
                        </ThemeIcon>
                        <Text size="sm" fw={500}>{t('filter')}</Text>
                        {activeFilterCount > 0 && (
                          <Badge size="xs" variant="filled" color="blue">
                            {activeFilterCount}
                          </Badge>
                        )}
                      </Group>
                      {isFiltersOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                    </Group>

                    <Collapse in={isFiltersOpen}>
                      <Stack gap="sm">
                        {/* Condition Filter */}
                        <Box>
                          <Text size="xs" fw={500} mb={4}>Condition</Text>
                          <SegmentedControl
                            value={conditionFilter}
                            onChange={setConditionFilter}
                            data={[
                              { label: t('all'), value: 'ALL' },
                              { label: t('condition_new'), value: 'NEW' },
                              { label: t('condition_used'), value: 'USED' },
                              { label: t('condition_refurbished'), value: 'REFURBISHED' },
                            ]}
                            fullWidth
                            size="xs"
                          />
                        </Box>

                        {/* Category Filter */}
                        {availableCategories.length > 0 && (
                          <Box>
                            <Group gap={4} mb={4}>
                              <IconTag size={12} />
                              <Text size="xs" fw={500}>Category</Text>
                            </Group>
                            <MultiSelect
                              size="xs"
                              placeholder="All categories"
                              data={availableCategories}
                              value={categoryFilter}
                              onChange={setCategoryFilter}
                              clearable
                              searchable
                            />
                          </Box>
                        )}

                        {/* Stock Filter */}
                        <Box>
                          <Group gap={4} mb={4}>
                            <IconPackage size={12} />
                            <Text size="xs" fw={500}>Stock</Text>
                          </Group>
                          <SegmentedControl
                            value={stockFilter}
                            onChange={setStockFilter}
                            data={[
                              { label: 'All', value: 'ALL' },
                              { label: 'In Stock', value: 'IN_STOCK' },
                              { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
                            ]}
                            fullWidth
                            size="xs"
                          />
                        </Box>

                        {/* Published Filter */}
                        <Box>
                          <Text size="xs" fw={500} mb={4}>Status</Text>
                          <SegmentedControl
                            value={publishedFilter}
                            onChange={setPublishedFilter}
                            data={[
                              { label: 'All', value: 'ALL' },
                              { label: 'Published', value: 'PUBLISHED' },
                              { label: 'Unpublished', value: 'UNPUBLISHED' },
                            ]}
                            fullWidth
                            size="xs"
                          />
                        </Box>

                        {/* Tags Filter */}
                        {availableTags.length > 0 && (
                          <Box>
                            <Group gap={4} mb={4}>
                              <IconTag size={12} />
                              <Text size="xs" fw={500}>Tags</Text>
                            </Group>
                            <MultiSelect
                              size="xs"
                              placeholder="All tags"
                              data={availableTags}
                              value={tagFilter}
                              onChange={setTagFilter}
                              clearable
                              searchable
                            />
                          </Box>
                        )}

                        {/* Price Range Filter */}
                        <Box>
                          <Group gap={4} mb={4}>
                            <IconCash size={12} />
                            <Text size="xs" fw={500}>Price Range (USD)</Text>
                          </Group>
                          <Group gap="xs">
                            <NumberInput
                              size="xs"
                              placeholder="Min"
                              value={minPrice}
                              onChange={setMinPrice}
                              min={0}
                              style={{ flex: 1 }}
                            />
                            <Text size="xs" c="dimmed">-</Text>
                            <NumberInput
                              size="xs"
                              placeholder="Max"
                              value={maxPrice}
                              onChange={setMaxPrice}
                              min={0}
                              style={{ flex: 1 }}
                            />
                          </Group>
                        </Box>

                        {/* Clear Filters Button */}
                        {activeFilterCount > 0 && (
                          <Button
                            variant="subtle"
                            size="xs"
                            onClick={clearAllFilters}
                            fullWidth
                          >
                            Clear All Filters
                          </Button>
                        )}
                      </Stack>
                    </Collapse>
                  </Paper>

                  <Group gap="xs">
                    <Button variant="light" size="xs" onClick={selectAll}>
                      Select All
                    </Button>
                    <Button variant="subtle" size="xs" onClick={deselectAll}>
                      Clear
                    </Button>
                  </Group>

                  {filteredProducts.length === 0 ? (
                    <Paper p="xl" ta="center" bg="var(--mantine-color-gray-light)">
                      <Text c="dimmed">
                        {products.length === 0
                          ? 'No products available. Create some products first.'
                          : 'No products match the selected filter.'}
                      </Text>
                    </Paper>
                  ) : (
                    <ScrollArea.Autosize mah={280} offsetScrollbars>
                      <Reorder.Group
                        axis="y"
                        values={filteredProducts.map((p) => p.id)}
                        onReorder={(newOrder) => {
                          // When reordering filtered list, we need to be careful.
                          // Reorder.Group might return only the filtered items in new order.
                          // We should probably disable reordering when filtered, or handle it carefully.
                          // For now, let's just update the sort order for these items.
                          setSortOrder(newOrder);
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                      >
                        {filteredProducts.map((product) => (
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
