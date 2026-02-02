/* eslint-disable react/require-default-props */
import {
  Paper, Text, Stack, Group, Box, Badge,
} from '@mantine/core';
import { formatCurrency } from '@/utils/currency';

export interface ExportProduct {
  id: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  priceSYP?: number | null;
  imageUrls?: string[] | null;
  category?: string | null;
}

interface ClassicTemplateProps {
  products: ExportProduct[];
  merchantName: string;
  watermark?: boolean;
}

export function ClassicTemplate({ products, merchantName, watermark }: ClassicTemplateProps) {
  return (
    <Paper p="xl" bg="white" style={{ width: '100%', minHeight: 400 }}>
      <Stack gap="md">
        <Text fw={700} size="xl" ta="center" style={{ borderBottom: '2px solid #e9ecef', paddingBottom: 12 }}>
          {merchantName}
          {' '}
          - Product Catalog
        </Text>

        <Stack gap="sm">
          {products.map((product) => (
            <Paper key={product.id} p="md" withBorder bg="#f8f9fa">
              <Group gap="md" wrap="nowrap">
                {product.imageUrls && product.imageUrls.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    crossOrigin="anonymous"
                    style={{
                      width: '70px',
                      height: '70px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="md" lineClamp={1}>
                    {product.name}
                  </Text>
                  {product.category && (
                    <Badge size="xs" variant="light" mt={4}>
                      {product.category}
                    </Badge>
                  )}
                  {product.description && (
                    <Text size="xs" c="dimmed" lineClamp={1} mt={4}>
                      {product.description}
                    </Text>
                  )}
                  <Group gap="xs" mt="xs">
                    <Text fw={700} size="md" c="blue">
                      {formatCurrency(product.priceUSD, 'USD')}
                    </Text>
                    {product.priceSYP && (
                      <Text size="xs" c="dimmed">
                        {formatCurrency(product.priceSYP, 'SYP')}
                      </Text>
                    )}
                  </Group>
                </Box>
              </Group>
            </Paper>
          ))}
        </Stack>

        {watermark && (
          <Text size="xs" c="dimmed" ta="center" mt="md">
            Created with MerchantHub
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
