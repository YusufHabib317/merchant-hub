// Shared types for export templates
import { z } from 'zod';
import { ProductConditionEnum } from '@/schemas/product';

export interface ExportProduct {
  id: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  priceSYP?: number | null;
  imageUrls?: string[] | null;
  category?: string | null;
  condition?: z.infer<typeof ProductConditionEnum>;
}

export type CurrencyDisplay = 'usd' | 'syp' | 'both';

export interface PriceListStyleOptions {
  pageBgColor: string;
  pageBgOpacity: number; // 0..1
  bgImageDataUrl: string | null;
  bgImageOpacity: number; // 0..1

  cardBgColor: string;
  cardBgOpacity: number; // 0..1

  categoryHeaderBg: string;
  categoryHeaderText: string;
  tableHeaderBg: string;
  tableHeaderText: string;

  rowOddBg: string;
  rowEvenBg: string;
  rowText: string;

  currencyDisplay: CurrencyDisplay;
}
