/* eslint-disable max-lines */
import {
  Container,
  Title,
  Text,
  Box,
  Card,
  Image,
  Group,
  Badge,
  Stack,
  Grid,
  Avatar,
  ActionIcon,
  Loader,
  Center,
  Alert,
  Modal,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import {
  IconShare,
  IconQrcode,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { QRCodeGenerator } from '@/components/qr/QRCodeGenerator';
import { useProductSort } from '@/lib/hooks';

interface Product {
  id: string;
  name: string;
  description: string | null;
  priceUSD: number;
  priceSYP: number | null;
  imageUrls: string[];
  category: string | null;
}

interface Merchant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  address: string | null;
  products: Product[];
  _count: {
    products: number;
  };
}

export default function MerchantPublicPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [showQR, setShowQR] = useState(false);

  const { data, isLoading, error } = useQuery<Merchant>({
    queryKey: ['merchant', slug],
    queryFn: async () => {
      const { data: response } = await apiClient.get(API_ENDPOINTS.merchants.getBySlug(slug as string));
      return response.data;
    },
    enabled: !!slug && typeof slug === 'string',
  });

  // Apply custom sort order to products
  const { getSortedProducts } = useProductSort({
    merchantId: data?.id || '',
    products: data?.products || [],
  });

  const sortedProducts = data ? getSortedProducts(data.products) : [];

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: data?.name || 'Check out this store',
          text: data?.description || 'View products from this merchant',
          url,
        });
      } catch {
        // User cancelled or share failed - silently ignore
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url);
      // eslint-disable-next-line no-alert
      window.alert('Link copied to clipboard!');
    }
  };

  if (isLoading || !slug) {
    return (
      <Container size="lg" py="xl">
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Store Not Found" color="red">
          The store you&apos;re looking for doesn&apos;t exist or has been removed.
        </Alert>
      </Container>
    );
  }

  return (
    <Box>
      {/* Merchant Header */}
      <Box
        py={60}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Container size="lg">
          <Group gap="xl" align="center">
            <Avatar
              src={data.logoUrl}
              alt={data.name}
              size={120}
              radius="md"
              style={{
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              {data.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box style={{ flex: 1 }}>
              <Title order={1} c="white" size={42} mb="xs">
                {data.name}
              </Title>
              {data.description && (
                <Text size="lg" c="white" style={{ opacity: 0.95 }}>
                  {data.description}
                </Text>
              )}
              <Group mt="md" gap="xs">
                <Badge size="lg" variant="light" color="white" c="violet">
                  {/* eslint-disable-next-line no-underscore-dangle */}
                  {data._count.products}
                  {' '}
                  Products
                </Badge>
              </Group>
            </Box>
            <Group gap="xs">
              <ActionIcon
                size="xl"
                radius="md"
                variant="white"
                onClick={handleShare}
                title="Share store"
              >
                <IconShare size={20} />
              </ActionIcon>
              <ActionIcon
                size="xl"
                radius="md"
                variant="white"
                onClick={() => setShowQR(!showQR)}
                title="Show QR code"
              >
                <IconQrcode size={20} />
              </ActionIcon>
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Products Section */}
      <Container size="lg" py={60}>
        {sortedProducts.length === 0 ? (
          <Box ta="center" py={60}>
            <Text size="xl" c="dimmed">
              No products available yet
            </Text>
          </Box>
        ) : (
          <>
            <Title order={2} mb="xl">
              Products
            </Title>
            <Grid gutter="lg">
              {sortedProducts.map((product) => (
                <Grid.Col key={product.id} span={{ base: 12, sm: 6, md: 4 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
                    <Card.Section>
                      {!product.imageUrls || product.imageUrls.length === 0 ? (
                        <Box
                          h={200}
                          bg="gray.1"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text c="dimmed">No image</Text>
                        </Box>
                      ) : null}

                      {product.imageUrls && product.imageUrls.length === 1 ? (
                        <Image
                          src={product.imageUrls[0]}
                          alt={product.name}
                          height={200}
                          fit="cover"
                        />
                      ) : null}

                      {product.imageUrls && product.imageUrls.length > 1 ? (
                        <Carousel
                          withIndicators
                          height={200}
                          emblaOptions={{ loop: true }}
                          styles={{
                            indicator: {
                              width: 8,
                              height: 8,
                              transition: 'width 250ms ease',
                              '&[data-active]': {
                                width: 24,
                              },
                            },
                          }}
                        >
                          {product.imageUrls.map((imageUrl) => (
                            <Carousel.Slide key={imageUrl}>
                              <Image
                                src={imageUrl}
                                alt={product.name}
                                height={200}
                                fit="cover"
                              />
                            </Carousel.Slide>
                          ))}
                        </Carousel>
                      ) : null}
                    </Card.Section>

                    <Stack gap="xs" mt="md">
                      <Group justify="space-between" align="flex-start">
                        <Text fw={600} size="lg" lineClamp={2} style={{ flex: 1 }}>
                          {product.name}
                        </Text>
                        {product.category && (
                          <Badge size="sm" variant="light">
                            {product.category}
                          </Badge>
                        )}
                      </Group>

                      {product.description && (
                        <Text size="sm" c="dimmed" lineClamp={2}>
                          {product.description}
                        </Text>
                      )}

                      <Box mt="auto">
                        <Text fw={700} size="xl" c="blue">
                          {formatCurrency(product.priceUSD, 'USD')}
                        </Text>
                        {product.priceSYP && (
                          <Text size="sm" c="dimmed">
                            {formatCurrency(product.priceSYP, 'SYP')}
                          </Text>
                        )}
                      </Box>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </>
        )}
      </Container>

      {/* Floating Chat Widget */}
      <ChatWidget merchantId={data.id} merchantName={data.name} />

      {/* QR Code Modal */}
      <Modal
        opened={showQR}
        onClose={() => setShowQR(false)}
        title="Store QR Code"
        centered
        size="auto"
      >
        <Stack align="center" gap="lg" p="md">
          <Text size="sm" c="dimmed" ta="center">
            Scan this QR code to visit the store
          </Text>
          <Box
            p="lg"
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            <QRCodeGenerator
              value={typeof window !== 'undefined' ? window.location.href : ''}
              size={300}
              margin={2}
            />
          </Box>
          <Text size="xs" c="dimmed" ta="center" maw={300}>
            {typeof window !== 'undefined' ? window.location.href : ''}
          </Text>
        </Stack>
      </Modal>
    </Box>
  );
}
