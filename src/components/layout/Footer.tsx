import { Group, Text, Container } from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';

export function Footer() {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <Container size="lg" py="md" mt="xl">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          ©
          {' '}
          {currentYear}
          {' '}
          {t('header.merchant_hub')}
        </Text>
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
