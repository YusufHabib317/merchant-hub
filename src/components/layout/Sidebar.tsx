import { NavLink, Stack } from '@mantine/core';
import {
  IconHome,
  IconShoppingCart,
  IconQrcode,
  IconSettings,
  IconMessageCircle,
  IconBrain,
} from '@tabler/icons-react';
import { useAppRouter, useIsActiveRoute } from '@/lib/hooks/useAppRouter';
import { getRoutePath } from '@/config/routes';

const navItems = [
  {
    label: 'Dashboard', icon: IconHome, path: getRoutePath.dashboard(), exact: true,
  },
  {
    label: 'Products', icon: IconShoppingCart, path: getRoutePath.products(),
  },
  {
    label: 'QR Code', icon: IconQrcode, path: getRoutePath.qrCode(),
  },
  {
    label: 'Chat', icon: IconMessageCircle, path: getRoutePath.chat(),
  },
  {
    label: 'AI Context', icon: IconBrain, path: getRoutePath.aiContext(),
  },
  {
    label: 'Settings', icon: IconSettings, path: getRoutePath.settings(),
  },
];

export function Sidebar() {
  const { to } = useAppRouter();
  const isActive = useIsActiveRoute();

  return (
    <Stack gap={0} p="md">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          label={item.label}
          leftSection={<item.icon size={16} />}
          active={isActive(item.path, item.exact)}
          onClick={() => to(item.path)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </Stack>
  );
}
