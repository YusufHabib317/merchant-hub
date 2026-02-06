/**
 * ActionButtons Component
 *
 * Action buttons for applying exchange rate and reverting prices.
 *
 * Requirements: 3.4, 3.6, 5.2
 */

import { Group, Button } from '@mantine/core';
import { IconCheck, IconRefresh } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface ActionButtonsProps {
  selectedCount: number;
  revertableCount: number;
  exchangeRate: number | string;
  exchangeRateError: string | null;
  isApplying: boolean;
  isReverting: boolean;
  onApply: () => void;
  onRevert: () => void;
  onClose: () => void;
}

export function ActionButtons({
  selectedCount,
  revertableCount,
  exchangeRate,
  exchangeRateError,
  isApplying,
  isReverting,
  onApply,
  onRevert,
  onClose,
}: ActionButtonsProps) {
  const { t } = useTranslation('common');
  const isMutating = isApplying || isReverting;

  return (
    <Group justify="space-between" mt="md">
      {/* Requirement 5.2: Revert button for products with original prices */}
      <Button
        variant="subtle"
        color="orange"
        leftSection={<IconRefresh size={16} />}
        onClick={onRevert}
        loading={isReverting}
        disabled={revertableCount === 0 || isApplying}
      >
        {t('revert_prices') || 'Revert Prices'}
        {revertableCount > 0 && ` (${revertableCount})`}
      </Button>

      <Group>
        <Button variant="subtle" onClick={onClose} disabled={isMutating}>
          {t('cancel') || 'Cancel'}
        </Button>
        {/* Requirement 3.6: Apply button with loading state */}
        <Button
          onClick={onApply}
          loading={isApplying}
          disabled={selectedCount === 0 || !exchangeRate || !!exchangeRateError || isReverting}
          leftSection={<IconCheck size={16} />}
        >
          {t('apply_exchange_rate') || 'Apply Rate'}
        </Button>
      </Group>
    </Group>
  );
}

export default ActionButtons;
