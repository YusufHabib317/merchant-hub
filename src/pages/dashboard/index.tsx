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
import useTranslation from 'next-translate/useTranslation';
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
  const { t } = useTranslation('common');

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
      title: t('dashboard_page.total_products'),
      value: stats?.totalProducts || 0,
      icon: IconShoppingCart,
      color: 'blue',
    },
    {
      title: t('dashboard_page.active_chats'),
      value: stats?.totalChats || 0,
      icon: IconMessageCircle,
      color: 'green',
    },
    {
      title: t('dashboard_page.total_views'),
      value: stats?.totalViews || 0,
      icon: IconTrendingUp,
      color: 'purple',
    },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Title order={1}>{t('dashboard_page.title')}</Title>

          {isLoading ? (
            <Skeleton height={100} radius="md" />
          ) : (
            !hasStore && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title={t('dashboard_page.set_up_store_title')}
                color="yellow"
                variant="light"
              >
                <Group justify="space-between">
                  <Text size="sm">
                    {t('dashboard_page.set_up_store_message')}
                  </Text>
                  <Link href="/dashboard/settings" style={{ textDecoration: 'none' }}>
                    <Button variant="filled" color="blue" size="sm">
                      {t('dashboard_page.go_to_settings')}
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
              {t('dashboard_page.quick_actions')}
            </Title>
            <Group>
              <Link href="/dashboard/products/new" style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                >
                  {t('dashboard_page.add_new_product')}
                </Text>
              </Link>
              <Link href="/dashboard/products/export" style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                >
                  {t('dashboard_page.export_products')}
                </Text>
              </Link>
              <Link href="/dashboard/qr-code" style={{ textDecoration: 'none' }}>
                <Text
                  size="sm"
                  fw={500}
                  style={{ cursor: 'pointer', color: 'var(--mantine-color-blue-6)' }}
                >
                  {t('dashboard_page.generate_qr_code')}
                </Text>
              </Link>
            </Group>
          </Card>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
