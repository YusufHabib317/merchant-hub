import { Group, Text, Container } from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <Container size="lg" py="md" mt="xl">
      <Group justify="space-between">
        <Group gap="md">
          <Text size="sm" c="dimmed">
            ©
            {' '}
            {currentYear}
            {' '}
            {t('header.merchant_hub')}
          </Text>
          <LanguageSwitcher />
        </Group>
        <Group gap="lg">
          <Text size="sm" c="dimmed" component="a" href="#" style={{ textDecoration: 'none' }}>
            {t('privacy')}
          </Text>
          <Text size="sm" c="dimmed" component="a" href="#" style={{ textDecoration: 'none' }}>
            {t('terms')}
          </Text>
        </Group>
      </Group>
    </Container>
  );
}
