import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Anchor,
  Alert,
  Loader,
  Checkbox,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { LoginSchema } from '@/schemas/auth';
import { z } from 'zod';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

export default function LoginPage() {
  const { toDashboard, query } = useAppRouter();
  const { reset } = query;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Show success message if redirected from password reset
  useEffect(() => {
    if (reset === 'success') {
      setSuccess('Password reset successful! Please sign in with your new password.');
    }
  }, [reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      const validated = LoginSchema.parse({ email, password });

      // Sign in with Better Auth
      const { data, error: authError } = await authClient.signIn.email({
        email: validated.email,
        password: validated.password,
        rememberMe,
      });

      if (authError) {
        setError(authError.message || 'Failed to sign in');
        setIsLoading(false);
        return;
      }

      if (data) {
        // Redirect to dashboard on successful login
        setIsLoading(false);
        toDashboard();
      }
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

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2} mb="lg">
        Welcome to MerchantHub
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Sign in to your merchant account
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {success && (
          <Alert color="green" mb="md">
            {success}
          </Alert>
        )}

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

            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />

            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.currentTarget.checked)}
              disabled={isLoading}
            />

            <Button
              fullWidth
              type="submit"
              disabled={isLoading}
              leftSection={isLoading ? <Loader size={16} /> : null}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Stack>
        </form>

        <Group justify="space-between" mt="lg" gap="xs">
          <Anchor component="a" href="/auth/register" size="sm">
            Don&apos;t have an account? Register
          </Anchor>
          <Anchor component="a" href="/auth/forgot-password" size="sm">
            Forgot password?
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
