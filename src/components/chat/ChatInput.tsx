/* eslint-disable no-undef */
import { useState, KeyboardEvent } from 'react';
import { Box, TextInput, ActionIcon } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface ChatInputProps {
  onSend: (message: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

// eslint-disable-next-line react/require-default-props
export function ChatInput({ onSend, onTyping, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const { t } = useTranslation('common');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
      onTyping(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);

    // Handle typing indicator
    if (!disabled) {
      onTyping(true);

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        onTyping(false);
      }, 1000);

      setTypingTimeout(timeout);
    }
  };

  return (
    <Box
      style={{
        padding: '16px',
        borderTop: '1px solid #e9ecef',
        backgroundColor: 'white',
      }}
    >
      <Box style={{ display: 'flex', gap: '8px' }}>
        <TextInput
          placeholder={disabled ? t('chat_widget.connecting') : t('chat_widget.type_message')}
          value={message}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          style={{ flex: 1 }}
          styles={{
            input: {
              borderRadius: 20,
            },
          }}
        />
        <ActionIcon
          size={36}
          radius="xl"
          variant="filled"
          color="blue"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
        >
          <IconSend size={18} />
        </ActionIcon>
      </Box>
    </Box>
  );
}
