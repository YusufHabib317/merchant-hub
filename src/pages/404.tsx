import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Center,
} from '@mantine/core';
import { IconError404 } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';

export default function Custom404() {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <Container className="h-screen flex items-center justify-center" size="md" py={80}>
      <Center h="calc(100vh - 160px)">
        <div style={{ textAlign: 'center' }}>
          <Center mb="md">
            <IconError404 size={120} stroke={1.5} color="var(--mantine-color-gray-3)" />
          </Center>
          <Title order={1} mb="md">
            Page Not Found
          </Title>
          <Text c="dimmed" size="lg" mb="xl" maw={500} mx="auto">
            The page you are looking for does not exist or has been moved.
          </Text>
          <Group justify="center">
            <Button onClick={() => router.push('/')} size="md">
              {t('nav.home')}
            </Button>
            <Button onClick={() => router.back()} variant="outline" size="md">
              {t('back')}
            </Button>
          </Group>
        </div>
      </Center>
    </Container>
  );
}
