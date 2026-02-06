/**
 * ProductSelectionItem Component
 *
 * Displays a single product in the selection list with checkbox,
 * price information, and preview of new calculated price.
 *
 * Requirements: 2.3, 2.4, 2.5, 5.5
 */

import {
  Paper,
  Group,
  Checkbox,
  Box,
  Text,
  Badge,
} from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import type { ProductSelection } from './types';
import { formatCurrency, getPreviewPrice } from './utils';

interface ProductSelectionItemProps {
  product: ProductSelection;
  exchangeRate: number | string;
  onSelect: (productId: string, selected: boolean) => void;
  disabled: boolean;
}

export function ProductSelectionItem({
  product,
  exchangeRate,
  onSelect,
  disabled,
}: ProductSelectionItemProps) {
  const { t } = useTranslation('common');
  const previewPrice = getPreviewPrice(product.priceUSD, exchangeRate);
  const hasOriginalPrice = product.originalPriceSYP !== null;

  return (
    <Paper
      withBorder
      p="sm"
      style={{
        backgroundColor: product.selected ? 'var(--mantine-color-blue-0)' : undefined,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
          {/* Requirement 2.3: Individual product checkbox */}
          <Checkbox
            checked={product.selected}
            onChange={(e) => onSelect(product.id, e.currentTarget.checked)}
            disabled={disabled}
          />
          <Box style={{ flex: 1, minWidth: 0 }}>
            <Group gap="xs">
              <Text size="sm" fw={500} truncate>
                {product.name}
              </Text>
              {/* Requirement 5.5: Indicate revertable products */}
              {hasOriginalPrice && (
                <Badge size="xs" variant="light" color="orange">
                  {t('revertable') || 'Revertable'}
                </Badge>
              )}
            </Group>
            {/* Requirement 2.4: Display current USD and SYP prices */}
            <Text size="xs" c="dimmed">
              {formatCurrency(product.priceUSD, 'USD')}
              {' | '}
              {formatCurrency(product.priceSYP, 'SYP')}
            </Text>
          </Box>
        </Group>

        {/* Requirement 2.5: Preview of new SYP price */}
        {product.selected && previewPrice !== null && (
          <Box ta="right">
            <Text size="xs" c="dimmed">
              {t('new_price') || 'New'}
              :
            </Text>
            <Text size="sm" fw={500} c="green">
              {formatCurrency(previewPrice, 'SYP')}
            </Text>
          </Box>
        )}
      </Group>
    </Paper>
  );
}

export default ProductSelectionItem;
