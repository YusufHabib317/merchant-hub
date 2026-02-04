import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ActionIcon, Box } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMessage } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { ChatWindow } from './ChatWindow';

interface ChatWidgetProps {
  merchantId: string;
  merchantName: string;
}

export function ChatWidget({ merchantId, merchantName }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();
  const isArabic = router.locale === 'ar';

  // Position based on locale: left for Arabic (RTL), right for English (LTR)
  const horizontalPosition = isArabic ? { left: 20 } : { right: 20 };

  const widgetContent = (
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
            ...horizontalPosition,
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
            ...(isMobile ? { left: 0, right: 0 } : horizontalPosition),
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

  // Render to document.body using portal to bypass any parent positioning
  return typeof document !== 'undefined' ? createPortal(widgetContent, document.body) : null;
}
