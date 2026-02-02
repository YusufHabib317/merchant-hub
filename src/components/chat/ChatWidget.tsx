import { useState } from 'react';
import { ActionIcon, Box } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import { ChatWindow } from './ChatWindow';

interface ChatWidgetProps {
  merchantId: string;
  merchantName: string;
}

export function ChatWidget({ merchantId, merchantName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <ActionIcon
          size={60}
          radius="xl"
          variant="filled"
          color="blue"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <IconMessage size={28} />
        </ActionIcon>
      )}

      {/* Chat window */}
      {isOpen && (
        <Box
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 380,
            height: 600,
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <ChatWindow
            merchantId={merchantId}
            merchantName={merchantName}
            onClose={() => setIsOpen(false)}
          />
        </Box>
      )}
    </>
  );
}
