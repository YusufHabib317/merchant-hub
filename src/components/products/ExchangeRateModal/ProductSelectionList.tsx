/**
 * ProductSelectionList Component
 *
 * Displays the list of products with selection checkboxes and "Select All" toggle.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.6
 */

import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Checkbox,
  ScrollArea,
} from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import type { ProductSelection } from './types';
import { ProductSelectionItem } from './ProductSelectionItem';

interface ProductSelectionListProps {
  productSelections: ProductSelection[];
  exchangeRate: number | string;
  selectedCount: number;
  allSelected: boolean;
  someSelected: boolean;
  onProductSelect: (productId: string, selected: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  disabled: boolean;
}

export function ProductSelectionList({
  productSelections,
  exchangeRate,
  selectedCount,
  allSelected,
  someSelected,
  onProductSelect,
  onSelectAll,
  disabled,
}: ProductSelectionListProps) {
  const { t } = useTranslation('common');

  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Text fw={500}>{t('select_products') || 'Select Products'}</Text>
          {/* Requirement 2.6: Display selected count */}
          <Badge variant="light" color="blue">
            {t('selected_count', { count: selectedCount }) || `${selectedCount} selected`}
          </Badge>
        </Group>

        {/* Requirement 2.2: Select All checkbox */}
        <Checkbox
          label={t('select_all') || 'Select All'}
          checked={allSelected}
          indeterminate={someSelected}
          onChange={(e) => onSelectAll(e.currentTarget.checked)}
          disabled={disabled}
        />

        {/* Product List */}
        <ScrollArea h={300} offsetScrollbars>
          <Stack gap="xs">
            {productSelections.map((product) => (
              <ProductSelectionItem
                key={product.id}
                product={product}
                exchangeRate={exchangeRate}
                onSelect={onProductSelect}
                disabled={disabled}
              />
            ))}

            {productSelections.length === 0 && (
              <Text size="sm" c="dimmed" ta="center" py="md">
                {t('no_products') || 'No products found'}
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Stack>
    </Paper>
  );
}

export default ProductSelectionList;
