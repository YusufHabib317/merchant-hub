import { Button } from '@mantine/core';
import { IconUserCheck } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface TakeoverButtonProps {
  onClick: () => void;
}

export function TakeoverButton({ onClick }: TakeoverButtonProps) {
  const { t } = useTranslation('common');

  return (
    <Button
      leftSection={<IconUserCheck size={16} />}
      variant="light"
      color="green"
      size="sm"
      onClick={onClick}
    >
      {t('chat_dashboard.take_over')}
    </Button>
  );
}
