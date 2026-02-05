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
  Box,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { LoginSchema } from '@/schemas/auth';
import { z } from 'zod';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import useTranslation from 'next-translate/useTranslation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function LoginPage() {
  const { t, lang } = useTranslation('common');
  const {
    toDashboard,
    toRegister,
    toForgotPassword,
    query,
  } = useAppRouter();
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
      setSuccess(t('auth.password_reset_success'));
    }
  }, [reset, t]);

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
        const errorCode = authError.code;
        const translatedError = errorCode ? t(`error_codes.${errorCode}`) : null;
        setError(translatedError || t('error.login_failed') || t('auth.sign_in_failed') || 'فشل تسجيل الدخول');
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
        {t('auth.welcome_back')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        {t('auth.sign_in')}
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
              autoComplete="current-password"
            />

            <Checkbox
              label={t('auth.remember_me')}
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
              {isLoading ? t('loading') : t('auth.sign_in_button')}
            </Button>
          </Stack>
        </form>

        <Group justify="space-between" mt="lg" gap="xs">
          <Anchor component="button" type="button" onClick={toRegister} size="sm">
            {t('auth.no_account')}
          </Anchor>
          <Anchor component="button" type="button" onClick={toForgotPassword} size="sm">
            {t('auth.forgot_password')}
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
