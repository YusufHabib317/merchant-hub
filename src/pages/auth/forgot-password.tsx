import { useState } from 'react';
import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Anchor,
  Alert,
  Loader,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate input
      const validated = ForgotPasswordSchema.parse({ email });

      // Request password reset
      const { error: resetError } = await authClient.requestPasswordReset({
        email: validated.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to send reset email');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessage = err.issues[0]?.message || 'Validation error';
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Container size={420} my={40}>
        <Title ta="center" order={2} mb="lg">
          Check Your Email
        </Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert color="green" mb="md">
            Password reset link has been sent to your email. Please check your inbox and follow the link to reset your password.
          </Alert>

          <Group justify="center" mt="lg">
            <Anchor component="a" href="/auth/login" size="sm">
              Back to login
            </Anchor>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2} mb="lg">
        Reset Your Password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Enter your email address and we&apos;ll send you a link to reset your password
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="email"
            />

            <Button
              fullWidth
              type="submit"
              disabled={isLoading}
              leftSection={isLoading ? <Loader size={16} /> : null}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="lg">
          <Anchor component="a" href="/auth/login" size="sm">
            Back to login
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
