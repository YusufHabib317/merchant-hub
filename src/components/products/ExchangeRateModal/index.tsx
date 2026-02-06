/**
 * ExchangeRateModal Component
 *
 * A modal dialog that allows merchants to set an exchange rate and apply it
 * to selected products. Follows the ImportCSVModal patterns for consistency.
 *
 * Requirements: 1.1, 2.1, 6.4
 */

import { Modal, Stack, Group, Loader } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { notifications } from '@mantine/notifications';
import { useExchangeRate } from '@/lib/hooks/useExchangeRate';
import { useProducts } from '@/lib/hooks/useProducts';
import { validateExchangeRate } from '@/utils/exchangeRate';
import type { ExchangeRateModalProps, ProductSelection } from './types';
import { ExchangeRateInput } from './ExchangeRateInput';
import { ProductSelectionList } from './ProductSelectionList';
import { ActionButtons } from './ActionButtons';
import { parseExchangeRate } from './utils';

export type { ExchangeRateModalProps, ProductSelection };

export function ExchangeRateModal({ opened, onClose }: ExchangeRateModalProps) {
  const { t } = useTranslation('common');

  const { merchantExchangeRate, isLoadingRate, applyExchangeRate, revertPrices } =
    useExchangeRate();

  const { data: productsData, isLoading: isLoadingProducts } = useProducts(undefined, {
    limit: 1000,
  });

  const [exchangeRate, setExchangeRate] = useState<number | string>('');
  const [productSelections, setProductSelections] = useState<ProductSelection[]>([]);
  const [exchangeRateError, setExchangeRateError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setExchangeRate('');
    setProductSelections([]);
    setExchangeRateError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (merchantExchangeRate && opened) {
      setExchangeRate(merchantExchangeRate);
    }
  }, [merchantExchangeRate, opened]);

  useEffect(() => {
    if (productsData?.products && opened) {
      const selections: ProductSelection[] = productsData.products.map((product) => ({
        id: product.id,
        name: product.name,
        priceUSD: product.priceUSD,
        priceSYP: product.priceSYP ?? 0,
        originalPriceSYP:
          (product as { originalPriceSYP?: number | null }).originalPriceSYP ?? null,
        selected: false,
      }));
      setProductSelections(selections);
    }
  }, [productsData?.products, opened]);

  const selectedCount = useMemo(
    () => productSelections.filter((p) => p.selected).length,
    [productSelections]
  );

  const allSelected = useMemo(
    () => productSelections.length > 0 && productSelections.every((p) => p.selected),
    [productSelections]
  );

  const someSelected = useMemo(
    () => selectedCount > 0 && !allSelected,
    [selectedCount, allSelected]
  );

  const revertableProducts = useMemo(
    () => productSelections.filter((p) => p.selected && p.originalPriceSYP !== null),
    [productSelections]
  );

  const validateInput = useCallback(
    (value: number | string): boolean => {
      const numValue = parseExchangeRate(value);
      if (!validateExchangeRate(numValue)) {
        setExchangeRateError(
          t('exchange_rate_invalid') || 'Exchange rate must be a positive number'
        );
        return false;
      }
      setExchangeRateError(null);
      return true;
    },
    [t]
  );

  const handleExchangeRateChange = useCallback(
    (value: number | string) => {
      setExchangeRate(value);
      if (value !== '' && value !== undefined) {
        validateInput(value);
      } else {
        setExchangeRateError(null);
      }
    },
    [validateInput]
  );

  const handleProductSelect = useCallback((productId: string, selected: boolean) => {
    setProductSelections((prev) => prev.map((p) => (p.id === productId ? { ...p, selected } : p)));
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    setProductSelections((prev) => prev.map((p) => ({ ...p, selected: checked })));
  }, []);

  const handleApply = useCallback(async () => {
    const numRate = parseExchangeRate(exchangeRate);
    if (!validateInput(numRate)) return;

    const selectedProductIds = productSelections.filter((p) => p.selected).map((p) => p.id);

    if (selectedProductIds.length === 0) {
      notifications.show({
        title: t('error') || 'Error',
        message: t('no_products_selected') || 'Please select at least one product',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    try {
      const result = await applyExchangeRate.mutateAsync({
        exchangeRate: numRate,
        productIds: selectedProductIds,
      });

      notifications.show({
        title: t('success') || 'Success',
        message:
          t('exchange_rate_applied', { count: result.updatedCount }) ||
          `Exchange rate applied to ${result.updatedCount} products`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      handleClose();
    } catch {
      // Error is handled by the hook
    }
  }, [exchangeRate, validateInput, productSelections, t, applyExchangeRate, handleClose]);

  const handleRevert = useCallback(async () => {
    const revertableIds = revertableProducts.map((p) => p.id);

    if (revertableIds.length === 0) {
      notifications.show({
        title: t('error') || 'Error',
        message:
          t('no_revertable_products') || 'No selected products have original prices to revert',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
      return;
    }

    try {
      const result = await revertPrices.mutateAsync({
        productIds: revertableIds,
      });

      notifications.show({
        title: t('success') || 'Success',
        message:
          t('prices_reverted', { count: result.revertedCount }) ||
          `Reverted prices for ${result.revertedCount} products`,
        color: 'green',
        icon: <IconCheck size={16} />,
      });

      handleClose();
    } catch {
      // Error is handled by the hook
    }
  }, [revertableProducts, t, revertPrices, handleClose]);

  const isLoading = isLoadingRate || isLoadingProducts;
  const isMutating = applyExchangeRate.isPending || revertPrices.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('exchange_rate_title') || 'Apply Exchange Rate'}
      size="lg"
    >
      <Stack gap="md">
        {isLoading ? (
          <Group justify="center" py="xl">
            <Loader size="md" />
          </Group>
        ) : (
          <>
            <ExchangeRateInput
              exchangeRate={exchangeRate}
              exchangeRateError={exchangeRateError}
              onExchangeRateChange={handleExchangeRateChange}
              disabled={isMutating}
            />

            <ProductSelectionList
              productSelections={productSelections}
              exchangeRate={exchangeRate}
              selectedCount={selectedCount}
              allSelected={allSelected}
              someSelected={someSelected}
              onProductSelect={handleProductSelect}
              onSelectAll={handleSelectAll}
              disabled={isMutating}
            />

            <ActionButtons
              selectedCount={selectedCount}
              revertableCount={revertableProducts.length}
              exchangeRate={exchangeRate}
              exchangeRateError={exchangeRateError}
              isApplying={applyExchangeRate.isPending}
              isReverting={revertPrices.isPending}
              onApply={handleApply}
              onRevert={handleRevert}
              onClose={handleClose}
            />
          </>
        )}
      </Stack>
    </Modal>
  );
}

export default ExchangeRateModal;
