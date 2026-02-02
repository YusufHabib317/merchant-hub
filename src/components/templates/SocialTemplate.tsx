import {
  Paper, Text, Stack, Group, Box,
} from '@mantine/core';

export interface ExportProduct {
  id: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  priceSYP?: number | null;
  imageUrls?: string[] | null;
  category?: string | null;
}

interface SocialTemplateProps {
  products: ExportProduct[];
  merchantName: string;
  watermark?: boolean | null;
}

export function SocialTemplate({
  products,
  merchantName,
  watermark = false,
}: SocialTemplateProps) {
  const featuredProducts = products.slice(0, 4);

  return (
    <Paper
      p="lg"
      style={{
        width: '100%',
        minHeight: 500,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Stack gap="md">
        <Paper p="lg" radius="lg" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <Text fw={800} size="1.5rem" ta="center" style={{ color: '#333' }}>
            {merchantName}
          </Text>
          <Text size="sm" ta="center" c="dimmed" mt={4}>
            Tap to shop now! 🛒
          </Text>
        </Paper>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          {featuredProducts.map((product) => (
            <Paper
              key={product.id}
              p="xs"
              radius="md"
              style={{ backgroundColor: 'white' }}
            >
              <Stack gap={4}>
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    crossOrigin="anonymous"
                    style={{
                      width: '100%',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      width: '100%',
                      height: 100,
                      backgroundColor: '#f0f0f0',
                      borderRadius: 4,
                    }}
                  />
                )}
                <Text size="xs" fw={600} lineClamp={1} style={{ color: '#333' }}>
                  {product.name}
                </Text>
                <Text size="sm" fw={700} style={{ color: '#667eea' }}>
                  $
                  {product.priceUSD.toFixed(2)}
                </Text>
              </Stack>
            </Paper>
          ))}
        </Box>

        <Paper p="sm" radius="md" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <Group justify="center" gap="xs">
            <Text size="xs" c="dimmed">
              🔗 Link in bio
            </Text>
            <Text size="xs" c="dimmed">
              •
            </Text>
            <Text size="xs" c="dimmed">
              DM to order
            </Text>
          </Group>
        </Paper>

        {watermark && (
          <Text size="xs" ta="center" c="white" opacity={0.7}>
            Created with MerchantHub
          </Text>
        )}
      </Stack>
    </Paper>
  );
}
