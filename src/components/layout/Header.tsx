import {
  Group,
  Text,
  Menu,
  Avatar,
  Loader,
} from '@mantine/core';
import { IconLogout, IconSettings } from '@tabler/icons-react';
import { authClient } from '@/lib/auth-client';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import useTranslation from 'next-translate/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation('common');
  const { toLogin, toHome, toSettings } = useAppRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleLogout = async () => {
    await authClient.signOut();
    toLogin();
  };

  if (isPending) {
    return (
      <>
        <Text fw={600} style={{ cursor: 'pointer' }} onClick={toHome}>
          {t('header.merchant_hub')}
        </Text>
        <Loader size="sm" />
      </>
    );
  }

  return (
    <>
      <Text fw={600} size="lg" style={{ cursor: 'pointer' }} onClick={toHome}>
        {t('header.merchant_hub')}
      </Text>

      <Group gap="md">
        <LanguageSwitcher />
        {session && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Group gap="xs" style={{ cursor: 'pointer' }}>
                <Avatar
                  src={session.user.image}
                  alt={session.user.email}
                  radius="xl"
                  size="sm"
                />
                <div>
                  <Text size="sm" fw={500}>
                    {session.user.name || session.user.email}
                  </Text>
                </div>
              </Group>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconSettings size={14} />}
                onClick={toSettings}
              >
                {t('settings')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={handleLogout}
              >
                {t('logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </>
  );
}
