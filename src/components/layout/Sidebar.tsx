import { NavLink, Stack } from '@mantine/core';
import Link from 'next/link';
import {
  IconHome,
  IconShoppingCart,
  IconQrcode,
  IconSettings,
  IconMessageCircle,
  IconBrain,
  IconUserCircle,
} from '@tabler/icons-react';
import { useIsActiveRoute } from '@/lib/hooks/useAppRouter';
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
    labelKey: 'nav.profile', icon: IconUserCircle, path: getRoutePath.profile(),
  },
  {
    labelKey: 'nav.settings', icon: IconSettings, path: getRoutePath.settings(),
  },
];

export function Sidebar() {
  const { t } = useTranslation('common');
  const isActive = useIsActiveRoute();

  return (
    <Stack gap={0} p="md">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          component={Link}
          href={item.path}
          label={t(item.labelKey)}
          leftSection={<item.icon size={16} />}
          active={isActive(item.path, item.exact)}
        />
      ))}
    </Stack>
  );
}
