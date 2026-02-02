import { Button } from '@mantine/core';
import { IconUserCheck } from '@tabler/icons-react';

interface TakeoverButtonProps {
  onClick: () => void;
}

export function TakeoverButton({ onClick }: TakeoverButtonProps) {
  return (
    <Button
      leftSection={<IconUserCheck size={16} />}
      variant="light"
      color="green"
      size="sm"
      onClick={onClick}
    >
      Take Over Chat
    </Button>
  );
}
