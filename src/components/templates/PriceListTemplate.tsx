/* eslint-disable complexity */
/* eslint-disable react/require-default-props */
import {
  Paper, Text, Stack, Box, Table,
} from '@mantine/core';
import { formatCurrency } from '@/utils/currency';
import type { ExportProduct, PriceListStyleOptions } from './types';

function hexToRgba(hex: string, alpha: number) {
  const raw = hex.replace('#', '').trim();
  const normalized = raw.length === 3
    ? raw.split('').map((c) => `${c}${c}`).join('')
    : raw;
  if (normalized.length !== 6) return hex;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface PriceListTemplateProps {
  products: ExportProduct[];
  merchantName: string;
  merchantAddress?: string | null;
  watermark?: boolean;
  styleOptions?: PriceListStyleOptions;
  currencyDisplay?: 'usd' | 'syp' | 'both';
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export function PriceListTemplate({
  products,
  merchantName,
  merchantAddress,
  watermark,
  styleOptions,
  currencyDisplay: propCurrencyDisplay,
}: PriceListTemplateProps) {
  const pageBgColor = styleOptions?.pageBgColor ?? '#ffffff';
  const pageBgOpacity = styleOptions?.pageBgOpacity ?? 1;
  const bgImageDataUrl = styleOptions?.bgImageDataUrl ?? null;
  const bgImageOpacity = styleOptions?.bgImageOpacity ?? 0.2;

  const cardBgColor = styleOptions?.cardBgColor ?? '#ffffff';
  const cardBgOpacity = styleOptions?.cardBgOpacity ?? 0.95;

  const categoryHeaderBg = styleOptions?.categoryHeaderBg ?? '#333333';
  const categoryHeaderText = styleOptions?.categoryHeaderText ?? '#ffffff';
  const tableHeaderBg = styleOptions?.tableHeaderBg ?? '#f1f3f5';
  const tableHeaderText = styleOptions?.tableHeaderText ?? '#000000';

  const rowOddBg = styleOptions?.rowOddBg ?? '#ffffff';
  const rowEvenBg = styleOptions?.rowEvenBg ?? '#f8f9fa';
  const rowText = styleOptions?.rowText ?? '#000000';

  const currencyDisplay = propCurrencyDisplay ?? styleOptions?.currencyDisplay ?? 'both';

  const groups = products.reduce<Record<string, ExportProduct[]>>((acc, product) => {
    const key = product.category?.trim() || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {});

  const categories = Object.keys(groups).sort((a, b) => a.localeCompare(b));

  const showUSD = currencyDisplay === 'usd' || currencyDisplay === 'both';
  const showSYP = currencyDisplay === 'syp' || currencyDisplay === 'both';

  return (
    <Paper
      p="xl"
      style={{
        width: 900,
        maxWidth: '100%',
        minHeight: 400,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Color layer (bottom) */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: hexToRgba(pageBgColor, pageBgOpacity),
          pointerEvents: 'none',
        }}
      />
      {/* Image layer (on top of color) */}
      {bgImageDataUrl && (
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImageDataUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: bgImageOpacity,
            pointerEvents: 'none',
          }}
        />
      )}

      <Stack gap="lg" style={{ position: 'relative' }}>
        <Box ta="center">
          <Text fw={700} size="xl">
            {merchantName}
          </Text>
          {merchantAddress && (
            <Text size="sm" c="dimmed">
              {merchantAddress}
            </Text>
          )}
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 16,
            alignItems: 'start',
          }}
        >
          {categories.map((category) => (
            <Box
              key={category}
              style={{
                border: '2px solid #333',
                borderRadius: 6,
                overflow: 'hidden',
                backgroundColor: hexToRgba(cardBgColor, cardBgOpacity),
              }}
            >
              <Box style={{ backgroundColor: categoryHeaderBg, padding: '10px 14px', textAlign: 'center' }}>
                <Text fw={700} size="sm" style={{ color: categoryHeaderText }}>
                  {category}
                </Text>
              </Box>

              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr style={{ backgroundColor: tableHeaderBg }}>
                    <Table.Th style={{ padding: '10px 14px', color: tableHeaderText }}>Product</Table.Th>
                    {showUSD && (
                      <Table.Th style={{ textAlign: 'right', padding: '10px 14px', color: tableHeaderText }}>
                        {currencyDisplay === 'usd' ? 'Price' : 'USD'}
                      </Table.Th>
                    )}
                    {showSYP && (
                      <Table.Th style={{ textAlign: 'right', padding: '10px 14px', color: tableHeaderText }}>
                        {currencyDisplay === 'syp' ? 'Price' : 'SYP'}
                      </Table.Th>
                    )}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {groups[category].map((product, index) => (
                    <Table.Tr
                      key={product.id}
                      style={{ backgroundColor: index % 2 === 0 ? rowOddBg : rowEvenBg }}
                    >
                      <Table.Td style={{ padding: '10px 14px' }}>
                        <Text fw={500} style={{ color: rowText }}>{product.name}</Text>
                      </Table.Td>
                      {showUSD && (
                        <Table.Td style={{
                          padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: rowText,
                        }}
                        >
                          {formatCurrency(product.priceUSD, 'USD')}
                        </Table.Td>
                      )}
                      {showSYP && (
                        <Table.Td style={{
                          padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: rowText,
                        }}
                        >
                          {product.priceSYP ? formatCurrency(product.priceSYP, 'SYP') : '-'}
                        </Table.Td>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          ))}
        </Box>
        {watermark && (
          <Text size="xs" c="dimmed" ta="center">
            Price list generated by MerchantHub
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
