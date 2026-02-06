/**
 * ExchangeRateInput Component
 *
 * Input section for entering the exchange rate with validation and preview.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */

import {
  Paper,
  Stack,
  Text,
  NumberInput,
  Alert,
} from '@mantine/core';
import { IconCurrencyDollar } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { parseExchangeRate } from './utils';

interface ExchangeRateInputProps {
  exchangeRate: number | string;
  exchangeRateError: string | null;
  onExchangeRateChange: (value: number | string) => void;
  disabled: boolean;
}

export function ExchangeRateInput({
  exchangeRate,
  exchangeRateError,
  onExchangeRateChange,
  disabled,
}: ExchangeRateInputProps) {
  const { t } = useTranslation('common');

  // Format exchange rate for preview display
  const formattedRate = typeof exchangeRate === 'number'
    ? exchangeRate.toLocaleString()
    : parseExchangeRate(String(exchangeRate) || '0').toLocaleString();

  return (
    <Paper withBorder p="md">
      <Stack gap="sm">
        <Text fw={500}>{t('exchange_rate_label') || 'Exchange Rate'}</Text>
        <Text size="sm" c="dimmed">
          {t('exchange_rate_description') || 'Enter the exchange rate (1 USD = X SYP)'}
        </Text>

        <NumberInput
          value={exchangeRate}
          onChange={onExchangeRateChange}
          placeholder={t('exchange_rate_placeholder') || 'e.g., 14500'}
          min={1}
          thousandSeparator=","
          leftSection={<IconCurrencyDollar size={16} />}
          error={exchangeRateError}
          disabled={disabled}
        />

        {/* Requirement 1.5: Display conversion preview */}
        {exchangeRate && !exchangeRateError && (
          <Alert color="blue" variant="light">
            <Text size="sm">
              {t('conversion_preview') || 'Preview'}
              {': $1.00 = '}
              {formattedRate}
              {' SYP'}
            </Text>
          </Alert>
        )}
      </Stack>
    </Paper>
  );
}

export default ExchangeRateInput;
