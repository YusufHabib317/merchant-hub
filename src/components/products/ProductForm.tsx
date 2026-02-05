import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
  Loader,
  Switch,
  TagsInput,
  Text,
} from '@mantine/core';
import { useState, useMemo } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { z } from 'zod';
import { CreateProductSchema, CreateProductInput } from '@/schemas/product';
import { ProductPriceInput } from './ProductPriceInput';
import { MultiImageUpload } from './MultiImageUpload';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/constants';

interface ProductFormProps {
  initialData?: CreateProductInput;
  onSubmit: (data: CreateProductInput) => void | Promise<void>;
  isLoading?: boolean;
}

// eslint-disable-next-line complexity
export function ProductForm({
  initialData = undefined,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    priceUSD: initialData?.priceUSD ?? 0,
    priceSYP: initialData?.priceSYP ?? 0,
    exchangeRate: initialData?.exchangeRate ?? DEFAULT_EXCHANGE_RATE,
    imageUrls: initialData?.imageUrls ?? [],
    category: initialData?.category ?? '',
    stock: initialData?.stock ?? 0,
    isPublished: initialData?.isPublished ?? true,
    tags: initialData?.tags ?? [],
  });

  const [error, setError] = useState<string | null>(null);

  // Check if all required fields are filled
  const isFormValid = useMemo(() => (
    formData.name.trim().length > 0
    && formData.description.trim().length > 0
    && formData.priceUSD > 0
    && formData.imageUrls.length > 0
    && formData.category.trim().length > 0
  ), [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const validated = CreateProductSchema.parse(formData);
      await onSubmit(validated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || t('validation_error'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('unexpected_error'));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {error && <Alert color="red">{error}</Alert>}

        <TextInput
          label={t('category')}
          placeholder={t('category_placeholder')}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.currentTarget.value })}
          required
          disabled={isLoading}
        />

        <TextInput
          label={t('product_name')}
          placeholder={t('enter_product_name')}
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          required
          disabled={isLoading}
        />

        <Textarea
          label={t('description')}
          placeholder={t('enter_description')}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
          rows={4}
          required
          disabled={isLoading}
        />

        <ProductPriceInput
          priceUSD={formData.priceUSD}
          priceSYP={formData.priceSYP}
          exchangeRate={formData.exchangeRate}
          onPriceUSDChange={(value) => setFormData((prev) => ({ ...prev, priceUSD: value }))}
          onPriceSYPChange={(value) => setFormData((prev) => ({ ...prev, priceSYP: value }))}
          onExchangeRateChange={(value) => setFormData((prev) => ({ ...prev, exchangeRate: value }))}
        />

        <MultiImageUpload
          value={formData.imageUrls}
          onChange={(urls) => setFormData((prev) => ({ ...prev, imageUrls: urls }))}
          onError={(msg) => setError(msg)}
          disabled={isLoading}
          maxImages={3}
          required
        />

        <TextInput
          label={t('stock')}
          placeholder={t('enter_stock')}
          type="number"
          min={0}
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: parseInt(e.currentTarget.value, 10) || 0 })}
          disabled={isLoading}
        />

        <TagsInput
          label={t('tags')}
          description={t('tags_description')}
          placeholder={t('enter_tag_press_enter')}
          value={formData.tags}
          onChange={(value) => setFormData({ ...formData, tags: value })}
          disabled={isLoading}
          clearable
        />

        <Stack gap="xs">
          <Switch
            label={t('publish_product')}
            description={t('publish_product_description')}
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.currentTarget.checked })}
            disabled={isLoading}
          />
          {!formData.isPublished && (
            <Text size="sm" c="dimmed">
              {t('unpublished_product_note')}
            </Text>
          )}
        </Stack>

        <Group justify="flex-end">
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            leftSection={isLoading ? <Loader size={16} /> : null}
          >
            {isLoading ? t('saving') : t('save_product')}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
