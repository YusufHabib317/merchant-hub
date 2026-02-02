import { Group, Text, Container } from '@mantine/core';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Container size="lg" py="md" mt="xl">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          ©
          {' '}
          {currentYear}
          {' '}
          MerchantHub. All rights reserved.
        </Text>
        <Group gap="lg">
          <Text size="sm" c="dimmed" component="a" href="#" style={{ textDecoration: 'none' }}>
            Privacy Policy
          </Text>
          <Text size="sm" c="dimmed" component="a" href="#" style={{ textDecoration: 'none' }}>
            Terms of Service
          </Text>
        </Group>
      </Group>
    </Container>
  );
}
