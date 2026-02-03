import { useEffect, useState, useRef } from 'react';
import {
  Box, Stack, Text, Loader, Badge,
} from '@mantine/core';
import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { CustomerInfoModal } from './CustomerInfoModal';

interface Message {
  id: string;
  sessionId: string;
  senderId?: string;
  senderType: 'customer' | 'merchant' | 'ai';
  content: string;
  createdAt: Date;
}

interface ChatWindowProps {
  merchantId: string;
  merchantName: string;
  onClose: () => void;
}

const CHAT_SERVER_URL = process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:9001';

const getCustomerData = (merchantId: string) => {
  if (typeof window === 'undefined') return null;
  const key = `chat_customer_${merchantId}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

const saveCustomerData = (merchantId: string, customerId: string, name: string, email: string, customerToken?: string) => {
  if (typeof window === 'undefined') return;
  const key = `chat_customer_${merchantId}`;
  localStorage.setItem(key, JSON.stringify({
    customerId, name, email, customerToken,
  }));
};

const generateCustomerId = () => `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export function ChatWindow({ merchantId, merchantName, onClose }: ChatWindowProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [merchantOnline, setMerchantOnline] = useState(false);
  const [merchantTookOver, setMerchantTookOver] = useState(false);
  const [showCustomerInfoModal, setShowCustomerInfoModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{
    customerId: string;
    name: string;
    email: string;
    customerToken?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedData = getCustomerData(merchantId);
    if (savedData) {
      setCustomerInfo(savedData);
    } else {
      setShowCustomerInfoModal(true);
    }
  }, [merchantId]);

  const handleCustomerInfoSubmit = (name: string, email: string) => {
    const customerId = generateCustomerId();
    const info = { customerId, name, email };
    setCustomerInfo(info);
    saveCustomerData(merchantId, customerId, name, email);
    setShowCustomerInfoModal(false);
  };

  const customerInfoRef = useRef(customerInfo);
  useEffect(() => {
    customerInfoRef.current = customerInfo;
  }, [customerInfo]);

  useEffect(() => {
    if (!customerInfo) return;

    const newSocket = io(CHAT_SERVER_URL);
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);

      const currentInfo = customerInfoRef.current;
      if (currentInfo) {
        newSocket.emit('customer:join', {
          merchantId,
          customerName: currentInfo.name,
          customerEmail: currentInfo.email,
          customerId: currentInfo.customerId,
          customerToken: currentInfo.customerToken,
        });
      }
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('session:created', (session: { id: string; customerToken?: string }) => {
      setSessionId(session.id);
      if (session.customerToken) {
        saveCustomerData(
          merchantId,
          customerInfo.customerId,
          customerInfo.name,
          customerInfo.email,
          session.customerToken,
        );
        setCustomerInfo((prev) => (prev ? { ...prev, customerToken: session.customerToken } : null));
      }
    });

    newSocket.on('session:history', (history) => {
      setMessages(history);
    });

    newSocket.on('message:receive', (message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    });

    newSocket.on('ai:response', (message) => {
      setMessages((prev) => [...prev, message]);
      setIsTyping(false);
    });

    newSocket.on('merchant:online', () => {
      setMerchantOnline(true);
    });

    newSocket.on('merchant:offline', () => {
      setMerchantOnline(false);
    });

    newSocket.on('merchant:takeover', () => {
      setMerchantTookOver(true);
    });

    newSocket.on('typing:start', ({ senderType }) => {
      if (senderType === 'merchant') {
        setIsTyping(true);
      }
    });

    newSocket.on('typing:stop', ({ senderType }) => {
      if (senderType === 'merchant') {
        setIsTyping(false);
      }
    });

    return () => {
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId, customerInfo?.customerId, customerInfo?.email, customerInfo?.name]);

  const handleSendMessage = (content: string) => {
    if (!socket || !sessionId || !content.trim()) return;

    socket.emit('message:send', {
      sessionId,
      content: content.trim(),
      senderType: 'customer',
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const handleTyping = (isTyping: boolean) => {
    if (!socket || !sessionId) return;

    if (isTyping) {
      socket.emit('typing:start', { sessionId });
    } else {
      socket.emit('typing:stop', { sessionId });
    }
  };

  return (
    <>
      <CustomerInfoModal
        opened={showCustomerInfoModal}
        onSubmit={handleCustomerInfoSubmit}
      />

      <Stack gap={0} h="100%" style={{ backgroundColor: 'white' }}>
        <ChatHeader
          merchantName={merchantName}
          isOnline={merchantOnline}
          merchantTookOver={merchantTookOver}
          onClose={onClose}
        />

        {/* Messages area */}
        <Box
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f8f9fa',
          }}
        >
          {!isConnected && (
          <Box style={{ textAlign: 'center', padding: '20px' }}>
            <Loader size="sm" />
            <Text size="sm" c="dimmed" mt="xs">
              Connecting...
            </Text>
          </Box>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isTyping && (
          <Box mt="xs">
            <Badge size="sm" variant="light">
              {merchantTookOver ? 'Merchant' : 'AI'}
              {' '}
              is typing...
            </Badge>
          </Box>
          )}

          <div ref={messagesEndRef} />
        </Box>

        {/* Input area */}
        <ChatInput
          onSend={handleSendMessage}
          onTyping={handleTyping}
          disabled={!isConnected || !sessionId}
        />
      </Stack>
    </>
  );
}
