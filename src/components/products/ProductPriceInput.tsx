import {
  Group,
  NumberInput,
  Text,
  Stack,
} from '@mantine/core';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/constants';

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
        label="Exchange Rate (1 USD = X SYP)"
        placeholder="15000"
        value={exchangeRate}
        onChange={handleExchangeRateChange}
        min={1}
        step={100}
        required
        description="Set your custom exchange rate for this product"
      />
      <Group grow>
        <NumberInput
          label="Price (USD)"
          placeholder="0"
          value={priceUSD}
          onChange={handleUSDChange}
          min={0}
          step={1}
          decimalScale={2}
          required
        />
        <NumberInput
          label="Price (SYP)"
          placeholder="0"
          value={priceSYP}
          onChange={handleSYPChange}
          min={0}
          step={1}
          required
        />
      </Group>
      <Text size="sm" c="dimmed">
        Current rate: 1 USD =
        {' '}
        {exchangeRate.toLocaleString()}
        {' '}
        SYP
      </Text>
    </Stack>
  );
}
