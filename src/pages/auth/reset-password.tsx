import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  PasswordInput,
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
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import { getRoutePath } from '@/config/routes';

const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    // .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    // .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    // .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const { query, to } = useAppRouter();
  const { token } = query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!token) {
      setError('Invalid reset token');
      setIsLoading(false);
      return;
    }

    try {
      // Validate input
      const validated = ResetPasswordSchema.parse({
        password,
        confirmPassword,
      });

      // Reset password
      const { error: resetError } = await authClient.resetPassword({
        token: token as string,
        newPassword: validated.password,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to reset password');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Redirect to login with success message
      to(`${getRoutePath.login()}?reset=success`);
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
        Reset Your Password
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Enter your new password below
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <PasswordInput
              label="New Password"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <Button
              fullWidth
              type="submit"
              disabled={isLoading}
              leftSection={isLoading ? <Loader size={16} /> : null}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
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
