/* eslint-disable no-nested-ternary */
import {
  Box, Stack, Text, Paper, Badge, ScrollArea,
} from '@mantine/core';
import { format } from 'date-fns';
import useTranslation from 'next-translate/useTranslation';

interface ChatSession {
  id: string;
  merchantId: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  status: 'active' | 'closed';
  aiEnabled: boolean;
  merchantTookOver: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatListProps {
  sessions: ChatSession[];
  selectedSessionId?: string;
  onSelectSession: (sessionId: string) => void;
}

// eslint-disable-next-line react/require-default-props
export function ChatList({ sessions, selectedSessionId, onSelectSession }: ChatListProps) {
  const { t } = useTranslation('common');

  if (sessions.length === 0) {
    return (
      <Box p="xl" style={{ textAlign: 'center' }}>
        <Text c="dimmed">{t('chat_dashboard.no_active_conversations')}</Text>
      </Box>
    );
  }

  return (
    <ScrollArea h="100%">
      <Stack gap="xs" p="md">
        {sessions.map((session) => (
          <Paper
            key={session.id}
            p="md"
            withBorder
            style={{
              cursor: 'pointer',
              backgroundColor: selectedSessionId === session.id ? '#f0f7ff' : 'white',
              borderColor: selectedSessionId === session.id ? '#228be6' : '#e9ecef',
            }}
            onClick={() => onSelectSession(session.id)}
          >
            <Box>
              <Text fw={600} size="sm">
                {session.customerName}
              </Text>
              {session.customerEmail && (
                <Text size="xs" c="dimmed">
                  {session.customerEmail}
                </Text>
              )}
              <Box mt="xs" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {session.merchantTookOver ? (
                  <Badge size="xs" color="green">
                    {t('chat_dashboard.status_chatting')}
                  </Badge>
                ) : session.aiEnabled ? (
                  <Badge size="xs" color="blue">
                    {t('chat_dashboard.status_ai_active')}
                  </Badge>
                ) : (
                  <Badge size="xs" color="gray">
                    {t('chat_dashboard.status_waiting')}
                  </Badge>
                )}
                <Text size="xs" c="dimmed">
                  {format(new Date(session.updatedAt), 'MMM d, HH:mm')}
                </Text>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </ScrollArea>
  );
}
