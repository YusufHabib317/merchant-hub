/* eslint-disable react/require-default-props */
import { Paper, Text, Stack } from '@mantine/core';
import { useMemo, forwardRef } from 'react';
import { ElegantTemplate } from './ElegantTemplate';
import { PriceListTemplate } from './PriceListTemplate';
import type { ExportProduct, PriceListStyleOptions } from './types';

export interface TemplatePreviewProps {
  template: string;
  products: ExportProduct[];
  merchantName: string;
  merchantAddress?: string | null;
  priceListStyle?: PriceListStyleOptions;
  onExport?: () => Promise<void>;
  watermark?: boolean;
  currencyDisplay?: 'usd' | 'syp' | 'both';
  /** Custom category order for price-list template */
  categoryOrder?: string[];
}

export const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(
  (
    {
      template,
      products,
      merchantName,
      merchantAddress,
      priceListStyle,
      watermark = false,
      currencyDisplay = 'both',
      categoryOrder,
    },
    ref
  ) => {
    const renderTemplate = useMemo(() => {
      const commonProps = {
        products,
        merchantName,
        merchantAddress,
        watermark,
        currencyDisplay,
      };

      switch (template) {
        case 'elegant':
          return <ElegantTemplate {...commonProps} />;
        case 'price-list':
          return (
            <PriceListTemplate
              {...commonProps}
              styleOptions={priceListStyle}
              categoryOrder={categoryOrder}
            />
          );
        default:
          return <ElegantTemplate {...commonProps} />;
      }
    }, [
      template,
      products,
      merchantName,
      merchantAddress,
      priceListStyle,
      watermark,
      currencyDisplay,
      categoryOrder,
    ]);

    return (
      <Stack gap="md">
        <Paper
          p="md"
          withBorder
          style={{
            overflow: 'auto',
            maxHeight: 600,
            backgroundColor: '#f8f9fa',
          }}
        >
          <div ref={ref} style={{ display: 'inline-block' }}>
            {renderTemplate}
          </div>
        </Paper>
        {watermark && (
          <Text size="xs" c="dimmed" ta="center">
            Watermark will be removed on upgrade
          </Text>
        )}
      </Stack>
    );
  }
);
