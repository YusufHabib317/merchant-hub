/* eslint-disable sonarjs/no-duplicate-string */
import {
  Title,
  Grid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
} from '@mantine/core';
import {
  IconShoppingCart,
  IconMessageCircle,
  IconTrendingUp,
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

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.dashboard.stats);
      return response.data.data;
    },
  });

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
                  <Text fw={700} size="xl">
                    {isLoading ? '...' : stat.value}
                  </Text>
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
