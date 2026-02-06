import { useState } from 'react';
import { Modal, TextInput, Button, Stack, Text } from '@mantine/core';

interface CustomerInfoModalProps {
  opened: boolean;
  onSubmit: (name: string, email: string) => void;
  initialName?: string;
  initialEmail?: string;
}

export function CustomerInfoModal({
  opened,
  onSubmit,
  initialName = '',
  initialEmail = '',
}: CustomerInfoModalProps) {
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), email.trim());
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      title="Welcome to Chat"
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
      zIndex={10000}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Please provide your information to start chatting
          </Text>

          <TextInput
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
            data-autofocus
          />

          <TextInput
            label="Email (optional)"
            placeholder="your@email.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <Button type="submit" fullWidth disabled={!name.trim()}>
            Start Chat
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
