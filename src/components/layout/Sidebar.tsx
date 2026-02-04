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
import useTranslation from 'next-translate/useTranslation';

const navItems = [
  {
    labelKey: 'nav.dashboard', icon: IconHome, path: getRoutePath.dashboard(), exact: true,
  },
  {
    labelKey: 'nav.products', icon: IconShoppingCart, path: getRoutePath.products(),
  },
  {
    labelKey: 'nav.qr_code', icon: IconQrcode, path: getRoutePath.qrCode(),
  },
  {
    labelKey: 'nav.chat', icon: IconMessageCircle, path: getRoutePath.chat(),
  },
  {
    labelKey: 'nav.ai_context', icon: IconBrain, path: getRoutePath.aiContext(),
  },
  {
    labelKey: 'nav.settings', icon: IconSettings, path: getRoutePath.settings(),
  },
];

export function Sidebar() {
  const { t } = useTranslation('common');
  const { to } = useAppRouter();
  const isActive = useIsActiveRoute();

  return (
    <Stack gap={0} p="md">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          label={t(item.labelKey)}
          leftSection={<item.icon size={16} />}
          active={isActive(item.path, item.exact)}
          onClick={() => to(item.path)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </Stack>
  );
}
