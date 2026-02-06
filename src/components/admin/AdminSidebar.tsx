import { NavLink, Stack } from '@mantine/core';
import Link from 'next/link';
import { IconHome, IconUsers, IconShoppingCart } from '@tabler/icons-react';
import { useIsActiveRoute } from '@/lib/hooks/useAppRouter';
import { getRoutePath } from '@/config/routes';

const navItems = [
  {
    label: 'Overview',
    icon: IconHome,
    path: getRoutePath.adminDashboard(),
    exact: true,
  },
  {
    label: 'Users',
    icon: IconUsers,
    path: getRoutePath.adminUsers(),
  },
  {
    label: 'Products',
    icon: IconShoppingCart,
    path: getRoutePath.adminProducts(),
  },
];

export function AdminSidebar() {
  const isActive = useIsActiveRoute();

  return (
    <Stack gap={0} p="md">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          component={Link}
          href={item.path}
          label={item.label}
          leftSection={<item.icon size={16} />}
          active={isActive(item.path, item.exact)}
        />
      ))}
    </Stack>
  );
}
