import {
  Alert, Stack, Text, Button,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface NoStoreAlertProps {
  onSettingsClick: () => void;
}

export function NoStoreAlert({ onSettingsClick }: NoStoreAlertProps) {
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title="No Store Found"
      color="yellow"
      variant="light"
    >
      <Stack gap="md">
        <Text size="sm">
          You need to create a store before you can add products.
          Go to Settings to set up your merchant profile.
        </Text>
        <Button
          onClick={onSettingsClick}
          variant="filled"
          color="blue"
          size="sm"
          style={{ alignSelf: 'flex-start' }}
        >
          Go to Settings
        </Button>
      </Stack>
    </Alert>
  );
}
