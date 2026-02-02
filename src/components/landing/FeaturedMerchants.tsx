import {
  Container, Title, Text, Box, Card, Image, Group, Badge, Stack,
} from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

interface FeaturedMerchant {
  name: string;
  slug: string;
  description: string;
  category: string;
  productCount: number;
  imageUrl?: string;
}

// Mock data - in production, this would come from API
const featuredMerchants: FeaturedMerchant[] = [
  {
    name: 'Tech Haven',
    slug: 'tech-haven',
    description: 'Latest electronics and gadgets',
    category: 'Electronics',
    productCount: 45,
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
  },
  {
    name: 'Fashion Forward',
    slug: 'fashion-forward',
    description: 'Trendy clothing and accessories',
    category: 'Fashion',
    productCount: 120,
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
  },
  {
    name: 'Home Essentials',
    slug: 'home-essentials',
    description: 'Quality home decor and furniture',
    category: 'Home & Living',
    productCount: 78,
    imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
  },
];

export function FeaturedMerchants() {
  const { toMerchantStore } = useAppRouter();

  return (
    <Box py={80} bg="white">
      <Container size="lg">
        <Box ta="center" mb={60}>
          <Group justify="center" mb="md">
            <IconStar size={32} style={{ color: '#ffd43b' }} />
          </Group>
          <Title order={2} size={42} fw={800} mb="md">
            Featured Merchants
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Discover successful stores built with MerchantHub
          </Text>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {featuredMerchants.map((merchant, index) => (
            <motion.div
              key={merchant.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              style={{ cursor: 'pointer' }}
              onClick={() => toMerchantStore(merchant.slug)}
            >
              <Card shadow="md" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
                <Stack gap="md">
                  {merchant.imageUrl && (
                    <Image
                      src={merchant.imageUrl}
                      alt={merchant.name}
                      height={200}
                      radius="md"
                      fit="cover"
                    />
                  )}
                  <Box>
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="lg">
                        {merchant.name}
                      </Text>
                      <Badge variant="light" color="violet">
                        {merchant.category}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed" mb="xs">
                      {merchant.description}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {merchant.productCount}
                      {' '}
                      products
                    </Text>
                  </Box>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
