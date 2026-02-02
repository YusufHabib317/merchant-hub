/* eslint-disable no-nested-ternary */
import { Box, Text, Paper } from '@mantine/core';
import { format } from 'date-fns';

interface Message {
  id: string;
  sessionId: string;
  senderId?: string;
  senderType: 'customer' | 'merchant' | 'ai';
  content: string;
  createdAt: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isCustomer = message.senderType === 'customer';
  const isAI = message.senderType === 'ai';

  return (
    <Box
      mb="md"
      style={{
        display: 'flex',
        justifyContent: isCustomer ? 'flex-end' : 'flex-start',
      }}
    >
      <Paper
        p="sm"
        style={{
          maxWidth: '75%',
          backgroundColor: isCustomer ? '#228be6' : isAI ? '#e7f5ff' : '#f1f3f5',
          color: isCustomer ? 'white' : 'black',
          borderRadius: 12,
          borderTopRightRadius: isCustomer ? 4 : 12,
          borderTopLeftRadius: isCustomer ? 12 : 4,
        }}
      >
        {!isCustomer && (
          <Text size="xs" fw={600} mb={4} c={isAI ? 'blue' : 'dark'}>
            {isAI ? 'AI Assistant' : 'Merchant'}
          </Text>
        )}
        <Text size="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </Text>
        <Text
          size="xs"
          mt={4}
          c={isCustomer ? 'white' : 'dimmed'}
          style={{ opacity: 0.7 }}
        >
          {format(new Date(message.createdAt), 'HH:mm')}
        </Text>
      </Paper>
    </Box>
  );
}
