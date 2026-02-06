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
  Box,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { RegisterSchema } from '@/schemas/auth';
import { z } from 'zod';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import useTranslation from 'next-translate/useTranslation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function RegisterPage() {
  const { t, lang } = useTranslation('common');
  const { to, toLogin } = useAppRouter();
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
        // Redirect to OTP verification page
        setIsLoading(false);
        to(`/auth/verify-otp?email=${encodeURIComponent(validated.email)}`);
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
        {t('auth.create_account')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        {t('auth.register_subtitle')}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
        <Box
          style={{
            position: 'absolute',
            top: '1rem',
            ...(lang === 'ar' ? { left: '1rem' } : { right: '1rem' }),
          }}
        >
          <LanguageSwitcher />
        </Box>

        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label={t('auth.business_name')}
              placeholder={t('auth.business_name_placeholder')}
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.currentTarget.value)}
              disabled={isLoading}
            />

            <TextInput
              label={t('email')}
              placeholder={t('auth.email_placeholder')}
              required
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="email"
            />

            <PasswordInput
              label={t('password')}
              placeholder={t('auth.password_placeholder')}
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <PasswordInput
              label={t('confirm_password')}
              placeholder={t('auth.confirm_password_placeholder')}
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
              {isLoading ? t('auth.creating_account') : t('auth.sign_up_button')}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="lg">
          <Text size="sm">
            {t('auth.already_have_account')}{' '}
            <Anchor component="button" type="button" onClick={toLogin} size="sm">
              {t('auth.sign_in')}
            </Anchor>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}
