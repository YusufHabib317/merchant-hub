import { Title, Grid, Card, Text, Group, ThemeIcon, Stack, Skeleton } from '@mantine/core';
import { IconUsers, IconBuildingStore, IconShoppingCart, IconMessageCircle } from '@tabler/icons-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminStats } from '@/lib/hooks/useAdmin';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: IconUsers,
      color: 'blue',
    },
    {
      title: 'Total Merchants',
      value: stats?.totalMerchants || 0,
      icon: IconBuildingStore,
      color: 'green',
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: IconShoppingCart,
      color: 'purple',
    },
    {
      title: 'Chat Sessions',
      value: stats?.totalChatSessions || 0,
      icon: IconMessageCircle,
      color: 'orange',
    },
  ];

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminLayout>
        <Stack gap="lg">
          <Title order={1}>Admin Dashboard</Title>

          <Grid>
            {statCards.map((stat) => (
              <Grid.Col key={stat.title} span={{ base: 12, sm: 6, md: 3 }}>
                <Card withBorder padding="lg" radius="md">
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={500} c="dimmed">
                      {stat.title}
                    </Text>
                    <ThemeIcon color={stat.color} variant="light" size="lg" radius="md">
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
        </Stack>
      </AdminLayout>
    </ProtectedRoute>
  );
}
