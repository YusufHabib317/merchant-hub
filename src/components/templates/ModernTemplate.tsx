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

interface ModernTemplateProps {
  products: ExportProduct[];
  merchantName: string;
  watermark?: boolean;
}

// eslint-disable-next-line react/require-default-props
export function ModernTemplate({ products, merchantName, watermark }: ModernTemplateProps) {
  return (
    <Paper
      p="xl"
      style={{
        width: '100%', minHeight: 400, backgroundColor: '#1a1a2e', color: '#ffffff',
      }}
    >
      <Stack gap="lg">
        <Text
          fw={800}
          size="2rem"
          ta="center"
          style={{
            borderBottom: '3px solid #e94560',
            paddingBottom: 16,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}
        >
          {merchantName}
        </Text>

        <Text size="lg" c="dimmed" ta="center" style={{ color: '#a0a0a0' }}>
          Premium Products Collection
        </Text>

        <Stack gap="md">
          {products.map((product) => (
            <Paper
              key={product.id}
              p="lg"
              style={{
                backgroundColor: '#16213e',
                borderLeft: '4px solid #e94560',
              }}
            >
              <Group gap="md" wrap="nowrap" align="flex-start">
                {product.imageUrls && product.imageUrls.length > 0 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    crossOrigin="anonymous"
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  />
                )}
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text fw={700} size="lg" style={{ color: '#ffffff' }}>
                        {product.name}
                      </Text>
                      {product.category && (
                        <Badge size="sm" mt={4} style={{ backgroundColor: '#e94560' }}>
                          {product.category}
                        </Badge>
                      )}
                      {product.description && (
                        <Text size="sm" mt="xs" style={{ color: '#a0a0a0' }} lineClamp={2}>
                          {product.description}
                        </Text>
                      )}
                    </Box>
                    <Box ta="right">
                      <Text fw={800} size="xl" style={{ color: '#e94560' }}>
                        {formatCurrency(product.priceUSD, 'USD')}
                      </Text>
                      {product.priceSYP && (
                        <Text size="xs" style={{ color: '#a0a0a0' }}>
                          {formatCurrency(product.priceSYP, 'SYP')}
                        </Text>
                      )}
                    </Box>
                  </Group>
                </Box>
              </Group>
            </Paper>
          ))}
        </Stack>

        {watermark && (
          <Text size="xs" ta="center" style={{ color: '#666' }}>
            Powered by MerchantHub
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
