import { Box, Group, Text, Badge, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

interface ChatHeaderProps {
  merchantName: string;
  isOnline: boolean;
  merchantTookOver: boolean;
  onClose: () => void;
}

export function ChatHeader({ merchantName, isOnline, merchantTookOver, onClose }: ChatHeaderProps) {
  return (
    <Box
      style={{
        padding: '16px',
        backgroundColor: '#228be6',
        color: 'white',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
      }}
    >
      <Group justify="space-between">
        <Box>
          <Text fw={600} size="lg">
            {merchantName}
          </Text>
          <Group gap="xs" mt={4}>
            <Badge
              size="xs"
              variant="light"
              color={isOnline ? 'green' : 'gray'}
              style={{ color: 'white' }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {merchantTookOver ? (
              <Badge size="xs" variant="light" style={{ color: 'white' }}>
                Merchant
              </Badge>
            ) : (
              <Badge size="xs" variant="light" style={{ color: 'white' }}>
                AI Assistant
              </Badge>
            )}
          </Group>
        </Box>
        <ActionIcon variant="subtle" color="white" onClick={onClose} size="lg">
          <IconX size={20} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
