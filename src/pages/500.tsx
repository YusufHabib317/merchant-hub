import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Center,
} from '@mantine/core';
import { IconServerOff } from '@tabler/icons-react';
import { useRouter } from 'next/router';

export default function Custom500() {
  const router = useRouter();

  return (
    <Container className="h-screen flex items-center justify-center" size="md" py={80}>
      <Center h="calc(100vh - 160px)">
        <div style={{ textAlign: 'center' }}>
          <Center mb="md">
            <IconServerOff size={120} stroke={1.5} color="var(--mantine-color-gray-3)" />
          </Center>
          <Title order={1} mb="md">
            Server Error
          </Title>
          <Text c="dimmed" size="lg" mb="xl" maw={500} mx="auto">
            Our servers are currently experiencing issues. We are working to resolve the problem.
            Please try again later.
          </Text>
          <Group justify="center">
            <Button onClick={() => router.reload()} size="md">
              Refresh Page
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" size="md">
              Go to Home
            </Button>
          </Group>
        </div>
      </Center>
    </Container>
  );
}
