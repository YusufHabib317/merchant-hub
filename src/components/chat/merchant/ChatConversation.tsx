/* eslint-disable consistent-return */
/* eslint-disable sonarjs/no-duplicate-string */
import { useEffect, useState, useRef } from 'react';
import {
  Box, Stack, Text, Loader, Badge, Button,
} from '@mantine/core';
import { Socket } from 'socket.io-client';
import { ChatMessage } from '../ChatMessage';
import { ChatInput } from '../ChatInput';
import { TakeoverButton } from './TakeoverButton';

interface Message {
  id: string;
  sessionId: string;
  senderId?: string;
  senderType: 'customer' | 'merchant' | 'ai';
  content: string;
  createdAt: Date;
}

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

interface ChatConversationProps {
  session: ChatSession;
  socket: Socket | null;
}

export function ChatConversation({ session, socket }: ChatConversationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasTakenOver, setHasTakenOver] = useState(session.merchantTookOver);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages for this session
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:9001'}/api/sessions/${session.id}/messages`,
        );
        const data = await response.json();
        setMessages(data);
      } catch {
        //
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [session.id]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message: Message) => {
      if (message.sessionId === session.id) {
        setMessages((prev) => [...prev, message]);
        setIsTyping(false);
      }
    };

    const handleTyping = ({ senderType }: { senderType: string }) => {
      if (senderType === 'customer') {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderType }: { senderType: string }) => {
      if (senderType === 'customer') {
        setIsTyping(false);
      }
    };

    const handleTakeover = ({ sessionId }: { sessionId: string }) => {
      if (sessionId === session.id) {
        setHasTakenOver(true);
      }
    };

    const handleReleaseTakeover = ({ sessionId }: { sessionId: string }) => {
      if (sessionId === session.id) {
        setHasTakenOver(false);
      }
    };

    socket.on('message:receive', handleMessage);
    socket.on('ai:response', handleMessage);
    socket.on('typing:start', handleTyping);
    socket.on('typing:stop', handleStopTyping);
    socket.on('merchant:takeover', handleTakeover);
    socket.on('merchant:release_takeover', handleReleaseTakeover);

    return () => {
      socket.off('message:receive', handleMessage);
      socket.off('ai:response', handleMessage);
      socket.off('typing:start', handleTyping);
      socket.off('typing:stop', handleStopTyping);
      socket.off('merchant:takeover', handleTakeover);
      socket.off('merchant:release_takeover', handleReleaseTakeover);
    };
  }, [socket, session.id]);

  const handleSendMessage = (content: string) => {
    if (!socket || !content.trim()) return;

    socket.emit('message:send', {
      sessionId: session.id,
      content: content.trim(),
      senderType: 'merchant',
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleTyping = (isTyping: boolean) => {
    if (!socket) return;

    if (isTyping) {
      socket.emit('typing:start', { sessionId: session.id });
    } else {
      socket.emit('typing:stop', { sessionId: session.id });
    }
  };

  const handleTakeover = () => {
    if (!socket) return;

    socket.emit('merchant:takeover', { sessionId: session.id });
    setHasTakenOver(true);
  };

  const handleEnableAI = () => {
    if (!socket) return;

    socket.emit('merchant:release_takeover', { sessionId: session.id });
    setHasTakenOver(false);
  };

  if (isLoading) {
    return (
      <Box style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%',
      }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <Stack gap={0} h="100%">
      {/* Header */}
      <Box p="md" style={{ borderBottom: '1px solid #e9ecef' }}>
        <Text fw={600} size="lg">
          {session.customerName}
        </Text>
        {session.customerEmail && (
          <Text size="sm" c="dimmed">
            {session.customerEmail}
          </Text>
        )}
        <Box mt="xs">
          {hasTakenOver ? (
            <Button size="xs" variant="light" color="blue" onClick={handleEnableAI}>
              Enable AI
            </Button>
          ) : (
            <TakeoverButton onClick={handleTakeover} />
          )}
        </Box>
      </Box>

      {/* Messages */}
      <Box
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          backgroundColor: '#f8f9fa',
        }}
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isTyping && (
          <Box mt="xs">
            <Badge size="sm" variant="light">
              Customer is typing...
            </Badge>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={!socket}
      />
    </Stack>
  );
}
