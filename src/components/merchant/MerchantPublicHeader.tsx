import {
  Box,
  Container,
  Group,
  Text,
  Anchor,
  useMantineColorScheme,
} from '@mantine/core';
import { IconBuildingStore } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { CompactLanguageSwitcher } from '@/components/layout/CompactLanguageSwitcher';

export function MerchantPublicHeader() {
  const { t } = useTranslation('common');
  const { colorScheme } = useMantineColorScheme();

  return (
    <Box
      component="header"
      style={(theme) => ({
        borderBottom: `1px solid ${colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3]}`,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      })}
    >
      <Container size="lg">
        <Group justify="space-between" h={60}>
          {/* Logo/Branding */}
          <Anchor
            href="/"
            underline="never"
            style={{ textDecoration: 'none' }}
          >
            <Group gap="xs">
              <Box
                style={(theme) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: theme.radius.md,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                })}
              >
                <IconBuildingStore size={20} stroke={2.5} />
              </Box>
              <Text
                size="lg"
                fw={700}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('app_name')}
              </Text>
            </Group>
          </Anchor>

          {/* Theme & Language Controls */}
          <Group gap="xs">
            <ThemeSwitcher />
            <CompactLanguageSwitcher />
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
