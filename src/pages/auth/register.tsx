import { useState } from 'react';
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
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { RegisterSchema } from '@/schemas/auth';
import { z } from 'zod';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

export default function RegisterPage() {
  const { toDashboard } = useAppRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      const validated = RegisterSchema.parse({
        email,
        password,
        confirmPassword,
        businessName,
      });

      // Sign up with Better Auth
      const { data, error: authError } = await authClient.signUp.email({
        email: validated.email,
        password: validated.password,
        name: validated.businessName,
      });

      if (authError) {
        setError(authError.message || 'Failed to register');
        setIsLoading(false);
        return;
      }

      if (data) {
        // Redirect to dashboard on successful registration
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
        Create Your MerchantHub Account
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        Start selling and managing your products today
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
              label="Business Name"
              placeholder="Your store name"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.currentTarget.value)}
              disabled={isLoading}
            />

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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="lg">
          <Text size="sm">
            Already have an account?
            {' '}
            <Anchor component="a" href="/auth/login" size="sm">
              Sign in
            </Anchor>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}
