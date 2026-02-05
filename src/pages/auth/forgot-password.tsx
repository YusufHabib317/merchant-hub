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
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import useTranslation from 'next-translate/useTranslation';

const createForgotPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t('common:auth.invalid_email')),
});

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { to, toLogin } = useAppRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const ForgotPasswordSchema = createForgotPasswordSchema(t);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      // Validate input
      const validated = ForgotPasswordSchema.parse({ email });

      // Request password reset OTP using better-auth's emailOTP plugin
      const { error: resetError } = await authClient.emailOtp.requestPasswordReset({
        email: validated.email,
      });

      if (resetError) {
        setError(resetError.message || 'Failed to send reset code');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);

      // Redirect to reset password page with email
      setTimeout(() => {
        to(`/auth/reset-password?email=${encodeURIComponent(validated.email)}`);
      }, 2000);
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
          {t('common:auth.check_email')}
        </Title>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Alert color="green" mb="md">
            {t('common:auth.code_sent')}
          </Alert>

          <Group justify="center" mt="lg">
            <Anchor component="button" type="button" onClick={toLogin} size="sm">
              {t('common:auth.back_to_login')}
            </Anchor>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2} mb="lg">
        {t('common:auth.forgot_password_title')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        {t('common:auth.forgot_password_subtitle')}
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
              label={t('common:email')}
              placeholder={t('common:auth.email_placeholder')}
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
              {isLoading ? t('common:auth.sending') : t('common:auth.send_code')}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="lg">
          <Anchor component="button" type="button" onClick={toLogin} size="sm">
            {t('common:auth.back_to_login')}
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
