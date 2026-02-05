import {
  Alert, Stack, Text, Button,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface NoStoreAlertProps {
  onSettingsClick: () => void;
}

export function NoStoreAlert({ onSettingsClick }: NoStoreAlertProps) {
  const { t } = useTranslation('common');
  return (
    <Alert
      icon={<IconAlertCircle size={16} />}
      title={t('no_store_found_title')}
      color="yellow"
      variant="light"
    >
      <Stack gap="md">
        <Text size="sm">
          {t('no_store_found_message')}
        </Text>
        <Button
          onClick={onSettingsClick}
          variant="filled"
          color="blue"
          size="sm"
          style={{ alignSelf: 'flex-start' }}
        >
          {t('go_to_settings')}
        </Button>
      </Stack>
    </Alert>
  );
}
