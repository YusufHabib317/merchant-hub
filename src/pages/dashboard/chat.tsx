/* eslint-disable consistent-return */
import { useEffect, useState } from 'react';
import {
  Title, Grid, Paper, Text, Box, Stack,
} from '@mantine/core';
import { io, Socket } from 'socket.io-client';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { ChatList } from '@/components/chat/merchant/ChatList';
import { ChatConversation } from '@/components/chat/merchant/ChatConversation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

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

const CHAT_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:4000';

function ChatDashboardPage() {
  const { data: session } = authClient.useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  // Get merchant ID
  useEffect(() => {
    const fetchMerchant = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.merchants.me);
        setMerchantId(response.data.data.id);
      } catch {
        //
      }
    };

    if (session) {
      fetchMerchant();
    }
  }, [session]);

  // Initialize socket connection
  useEffect(() => {
    if (!merchantId) return;

    const newSocket = io(CHAT_SERVER_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('merchant:join', { merchantId });
    });

    return () => {
      newSocket.close();
    };
  }, [merchantId]);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      if (!merchantId) return;

      try {
        const response = await fetch(
          `${CHAT_SERVER_URL}/api/merchants/${merchantId}/sessions`,
        );
        const data = await response.json();
        setSessions(data);
      } catch {
        //
      }
    };

    loadSessions();

    // Refresh sessions every 30 seconds
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, [merchantId]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <Stack gap="lg">
      <Title order={1}>Chat Management</Title>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder h={600}>
            <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
              <Text fw={600}>Active Conversations</Text>
            </Box>
            <ChatList
              sessions={sessions}
              selectedSessionId={selectedSessionId || undefined}
              onSelectSession={setSelectedSessionId}
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder h={600}>
            {selectedSession ? (
              <ChatConversation session={selectedSession} socket={socket} />
            ) : (
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                }}
              >
                <Text c="dimmed">Select a conversation to view</Text>
              </Box>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ChatDashboardPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
