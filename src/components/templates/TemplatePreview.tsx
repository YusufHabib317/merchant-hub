/* eslint-disable react/require-default-props */
import { Paper, Text, Stack } from '@mantine/core';
import { useMemo, forwardRef } from 'react';
import { ExportProduct, ClassicTemplate } from './ClassicTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ElegantTemplate } from './ElegantTemplate';
import { SocialTemplate } from './SocialTemplate';
import { CatalogTemplate } from './CatalogTemplate';
import { PriceListTemplate } from './PriceListTemplate';

export interface TemplatePreviewProps {
  template: string;
  products: ExportProduct[];
  merchantName: string;
  onExport?: () => Promise<void>;
  watermark?: boolean;
}

export const TemplatePreview = forwardRef<HTMLDivElement, TemplatePreviewProps>(
  ({
    template, products, merchantName, watermark = false,
  }, ref) => {
    const renderTemplate = useMemo(() => {
      const templateProps = { products, merchantName, watermark };

      switch (template) {
        case 'modern':
          return <ModernTemplate {...templateProps} />;
        case 'elegant':
          return <ElegantTemplate {...templateProps} />;
        case 'social':
          return <SocialTemplate {...templateProps} />;
        case 'catalog':
          return <CatalogTemplate {...templateProps} />;
        case 'price-list':
          return <PriceListTemplate {...templateProps} />;
        case 'classic':
        default:
          return <ClassicTemplate {...templateProps} />;
      }
    }, [template, products, merchantName, watermark]);

    return (
      <Stack gap="md">
        <Text fw={600} size="sm">
          Preview
        </Text>
        <Paper
          ref={ref}
          p="md"
          withBorder
          style={{
            overflow: 'auto',
            maxHeight: 600,
            backgroundColor: '#f8f9fa',
          }}
        >
          {renderTemplate}
        </Paper>
        {watermark && (
          <Text size="xs" c="dimmed" ta="center">
            Watermark will be removed on upgrade
          </Text>
        )}
      </Stack>
    );
  },
);
