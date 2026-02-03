import { useState } from 'react';
import { ActionIcon, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMessage } from '@tabler/icons-react';
import { ChatWindow } from './ChatWindow';

interface ChatWidgetProps {
  merchantId: string;
  merchantName: string;
}

export function ChatWidget({ merchantId, merchantName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

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
            bottom: isMobile ? 0 : 20,
            right: isMobile ? 0 : 20,
            width: isMobile ? '100%' : 380,
            height: isMobile ? '100%' : 600,
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            borderRadius: isMobile ? 5 : 12,
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
