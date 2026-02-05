import {
  Group,
  NumberInput,
  Text,
  Stack,
} from '@mantine/core';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/constants';
import useTranslation from 'next-translate/useTranslation';

interface ProductPriceInputProps {
  priceUSD: number;
  priceSYP: number;
  exchangeRate: number;
  onPriceUSDChange: (value: number) => void;
  onPriceSYPChange: (value: number) => void;
  onExchangeRateChange: (value: number) => void;
}

export function ProductPriceInput({
  priceUSD,
  priceSYP,
  exchangeRate,
  onPriceUSDChange,
  onPriceSYPChange,
  onExchangeRateChange,
}: ProductPriceInputProps) {
  const { t } = useTranslation('common');

  const handleUSDChange = (value: number | string) => {
    const numValue = value === '' || value === null || value === undefined ? 0 : Number(value);
    if (Number.isNaN(numValue)) return;

    onPriceUSDChange(numValue);
    onPriceSYPChange(Math.round(numValue * exchangeRate));
  };

  const handleSYPChange = (value: number | string) => {
    const numValue = value === '' || value === null || value === undefined ? 0 : Number(value);
    if (Number.isNaN(numValue)) return;

    onPriceSYPChange(numValue);
    onPriceUSDChange(Math.round((numValue / exchangeRate) * 100) / 100);
  };

  const handleExchangeRateChange = (value: number | string) => {
    const numValue = value === '' || value === null || value === undefined ? DEFAULT_EXCHANGE_RATE : Number(value);
    if (Number.isNaN(numValue) || numValue <= 0) return;

    onExchangeRateChange(numValue);
    // Recalculate SYP based on new exchange rate
    onPriceSYPChange(Math.round(priceUSD * numValue));
  };

  return (
    <Stack gap="md">
      <NumberInput
        label={t('exchange_rate_label')}
        placeholder="15000"
        value={exchangeRate}
        onChange={handleExchangeRateChange}
        min={1}
        step={100}
        required
        description={t('exchange_rate_description')}
      />
      <Group grow>
        <NumberInput
          label={t('price_usd')}
          placeholder="0"
          value={priceUSD}
          onChange={handleUSDChange}
          min={0}
          step={1}
          decimalScale={2}
          required
        />
        <NumberInput
          label={t('price_syp')}
          placeholder="0"
          value={priceSYP}
          onChange={handleSYPChange}
          min={0}
          step={1}
          required
        />
      </Group>
      <Text size="sm" c="dimmed">
        {t('current_rate_text')}
        {' '}
        {exchangeRate.toLocaleString()}
        {' '}
        {t('syp')}
      </Text>
    </Stack>
  );
}
