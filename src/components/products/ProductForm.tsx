import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
  Loader,
} from '@mantine/core';
import { useState, useMemo } from 'react';
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

export function ProductForm({
  initialData = undefined,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    priceUSD: initialData?.priceUSD ?? 0,
    priceSYP: initialData?.priceSYP ?? 0,
    exchangeRate: initialData?.exchangeRate ?? DEFAULT_EXCHANGE_RATE,
    imageUrls: initialData?.imageUrls ?? [],
    category: initialData?.category ?? '',
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
        setError(err.issues[0]?.message || 'Validation error');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {error && <Alert color="red">{error}</Alert>}

        <TextInput
          label="Category"
          placeholder="e.g., Electronics, Clothing"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.currentTarget.value })}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Product Name"
          placeholder="Enter product name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
          required
          disabled={isLoading}
        />

        <Textarea
          label="Description"
          placeholder="Enter product description"
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

        <Group justify="flex-end">
          <Button
            type="submit"
            disabled={isLoading || !isFormValid}
            leftSection={isLoading ? <Loader size={16} /> : null}
          >
            {isLoading ? 'Saving...' : 'Save Product'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
