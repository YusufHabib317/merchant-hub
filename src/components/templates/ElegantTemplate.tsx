import {
  Paper, Text, Stack, Group, Image, Box,
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

interface ElegantTemplateProps {
  products: ExportProduct[];
  merchantName: string;
  watermark?: boolean | null;
}

export function ElegantTemplate({
  products,
  merchantName,
  watermark = false,
}: ElegantTemplateProps) {
  return (
    <Paper
      p="xl"
      style={{
        width: '100%',
        minHeight: 400,
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
      }}
    >
      <Stack gap="lg" align="center">
        <Text
          fw={300}
          size="1.75rem"
          ta="center"
          style={{
            textTransform: 'uppercase',
            letterSpacing: 8,
            color: '#2c3e50',
          }}
        >
          {merchantName}
        </Text>

        <Text size="sm" c="dimmed" style={{ letterSpacing: 4, textTransform: 'uppercase' }}>
          Collection
        </Text>

        <Box style={{ width: '60px', height: '2px', backgroundColor: '#2c3e50' }} />

        <Stack gap="md" style={{ width: '100%', maxWidth: 500 }}>
          {products.map((product) => (
            <Paper
              key={product.id}
              p="lg"
              shadow="sm"
              style={{
                backgroundColor: 'white',
                borderRadius: 8,
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              }}
            >
              <Group gap="md" wrap="nowrap" align="flex-start">
                {product.imageUrls && product.imageUrls.length > 0 && (
                  <Image
                    src={product.imageUrls[0]}
                    alt={product.name}
                    w={90}
                    h={90}
                    radius="sm"
                    fit="cover"
                    style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                )}
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" align="flex-start">
                    <Box>
                      <Text
                        fw={500}
                        size="lg"
                        style={{ color: '#2c3e50', fontFamily: 'Georgia, serif' }}
                      >
                        {product.name}
                      </Text>
                      {product.category && (
                        <Text size="xs" c="dimmed" mt={4} style={{ letterSpacing: 1 }}>
                          {product.category.toUpperCase()}
                        </Text>
                      )}
                      {product.description && (
                        <Text size="sm" mt="xs" c="dimmed" lineClamp={2} style={{ fontStyle: 'italic' }}>
                          {product.description}
                        </Text>
                      )}
                    </Box>
                    <Box ta="right">
                      <Text
                        fw={600}
                        size="xl"
                        style={{ color: '#2c3e50', fontFamily: 'Georgia, serif' }}
                      >
                        {formatCurrency(product.priceUSD, 'USD')}
                      </Text>
                      {product.priceSYP && (
                        <Text size="xs" c="dimmed">
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
          <Text size="xs" c="dimmed" ta="center" mt="md" style={{ letterSpacing: 2 }}>
            MERCHANTHUB
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
