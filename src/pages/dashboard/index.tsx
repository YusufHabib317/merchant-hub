/* eslint-disable sonarjs/no-duplicate-string */
import {
  Title,
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Alert,
  Button,
  Skeleton,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconMessageCircle,
  IconTrendingUp,
  IconAlertCircle,
} from '@tabler/icons-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface DashboardStats {
  totalProducts: number;
  totalChats: number;
  totalViews: number;
}

interface MerchantData {
  id: string;
  name: string | null;
  description: string | null;
  logoUrl: string | null;
  address: string | null;
  subscriptionTier: string | null;
}

export default function DashboardPage() {
  const { data: stats, isLoading: isStatsLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.dashboard.stats);
      return response.data.data;
    },
  });

  const { data: merchantData, isLoading: isMerchantLoading } = useQuery<MerchantData>({
    queryKey: ['merchant-me'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.merchants.me);
      return response.data.data;
    },
    retry: false,
  });

  const isLoading = isStatsLoading || isMerchantLoading;
  const hasStore = !!merchantData?.name;

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: IconShoppingCart,
      color: 'blue',
    },
    {
      title: 'Active Chats',
      value: stats?.totalChats || 0,
      icon: IconMessageCircle,
      color: 'green',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: IconTrendingUp,
      color: 'purple',
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Title order={1}>Dashboard</Title>

          {isLoading ? (
            <Skeleton height={100} radius="md" />
          ) : (
            !hasStore && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Set Up Your Store"
                color="yellow"
                variant="light"
              >
                <Group justify="space-between">
                  <Text size="sm">
                    You need to create a store before you can add products and manage your business.
                  </Text>
                  <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                    <Button variant="filled" color="blue" size="sm">
                      Go to Settings
                    </Button>
                  </Link>
                </Group>
              </Alert>
            )
          )}

          <Grid>
            {statCards.map((stat) => (
              <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 4 }}>
                <Card withBorder padding="lg" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500} c="dimmed">
                      {stat.title}
                    </Text>
                    <ThemeIcon
                      color={stat.color}
                      variant="light"
                      size="lg"
                      radius="md"
                    >
                      <stat.icon size={18} />
                    </ThemeIcon>
                  </Group>
                  {isLoading ? (
                    <Skeleton height={30} width={100} radius="sm" />
                  ) : (
                    <Text fw={700} size="xl">
                      {stat.value}
                    </Text>
                  )}
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          <Card withBorder padding="lg" radius="md">
            <Title order={3} mb="md">
              Quick Actions
            </Title>
            <Group>
              <Link href="/dashboard/products/new" style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                >
                  Add New Product
                </Text>
              </Link>
              <Link href="/dashboard/products/export" style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                >
                  Export Products
                </Text>
              </Link>
              <Link href="/dashboard/qr-code" style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                >
                  Generate QR Code
                </Text>
              </Link>
            </Group>
          </Card>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
