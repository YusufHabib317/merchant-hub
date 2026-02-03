import {
  Container,
  Title,
  Text,
  Box,
  Group,
  Badge,
  Avatar,
  ActionIcon,
} from '@mantine/core';
import { IconShare, IconQrcode } from '@tabler/icons-react';
import { PublicMerchant } from './types';

interface MerchantHeaderProps {
  merchant: PublicMerchant;
  onShare: () => void;
  onShowQR: () => void;
}

export function MerchantHeader({ merchant, onShare, onShowQR }: MerchantHeaderProps) {
  return (
    <Box
      py={60}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container size="lg">
        <Group gap="xl" align="center">
          <Avatar
            src={merchant.logoUrl}
            alt={merchant.name}
            size={120}
            radius="md"
            style={{
              border: '4px solid white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}
          >
            {merchant.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Title order={1} c="white" size={42} mb="xs">
              {merchant.name}
            </Title>
            {merchant.description && (
              <Text size="lg" c="white" style={{ opacity: 0.95 }}>
                {merchant.description}
              </Text>
            )}
            <Group mt="md" gap="xs">
              <Badge size="lg" variant="light" color="white" c="violet">
                {/* eslint-disable-next-line no-underscore-dangle */}
                {merchant._count.products}
                {' '}
                Products
              </Badge>
            </Group>
          </Box>
          <Group gap="xs">
            <ActionIcon
              size="xl"
              radius="md"
              variant="white"
              onClick={onShare}
              title="Share store"
            >
              <IconShare size={20} />
            </ActionIcon>
            <ActionIcon
              size="xl"
              radius="md"
              variant="white"
              onClick={onShowQR}
              title="Show QR code"
            >
              <IconQrcode size={20} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}
