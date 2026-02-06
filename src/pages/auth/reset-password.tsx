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
  PinInput,
  Center,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { z } from 'zod';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import { getRoutePath } from '@/config/routes';
import useTranslation from 'next-translate/useTranslation';

const createResetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      otp: z.string().length(6, t('common:auth.otp_must_be_6_digits')),
      password: z.string().min(8, t('common:auth.password_min_length')),
      // .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      // .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      // .regex(/[0-9]/, 'Password must contain at least one number'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('common:auth.passwords_dont_match'),
      path: ['confirmPassword'],
    });

export default function ResetPasswordPage() {
  const { t } = useTranslation('common');
  const { query, to, toLogin } = useAppRouter();
  const { email } = query;
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const ResetPasswordSchema = createResetPasswordSchema(t);

  useEffect(() => {
    if (!email) {
      setError(t('common:auth.email_required'));
    }
  }, [email, t]);

  const handleResendOTP = async () => {
    if (!email || typeof email !== 'string') {
      setError(t('common:auth.otp_email_required'));
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const { error: resendError } = await authClient.emailOtp.requestPasswordReset({
        email,
      });

      if (resendError) {
        // Try to translate the error code if it exists
        const errorCode = resendError.code;
        let errorMessage: string = t('common:auth.failed_to_resend');

        if (errorCode) {
          const translatedError = t(`error:${errorCode}`);
          if (translatedError && translatedError !== `error:${errorCode}`) {
            errorMessage = translatedError;
          }
        }

        setError(errorMessage);
      }
    } catch {
      setError(t('common:auth.failed_to_resend'));
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || typeof email !== 'string') {
      setError(t('common:auth.otp_email_required'));
      setIsLoading(false);
      return;
    }

    try {
      // Validate input
      const validated = ResetPasswordSchema.parse({
        otp,
        password,
        confirmPassword,
      });

      // Reset password using OTP
      const { error: resetError } = await authClient.emailOtp.resetPassword({
        email,
        otp: validated.otp,
        password: validated.password,
      });

      if (resetError) {
        // Check if error has a code (like INVALID_OTP) and translate it
        const errorCode = resetError.code;
        let errorMessage: string = t('auth.otp_verification_failed');

        // Try to translate the error code if it exists
        if (errorCode) {
          const translatedError = t(`error:${errorCode}`);
          // Check if translation was found (it won't equal the key if found)
          if (translatedError && translatedError !== `error:${errorCode}`) {
            errorMessage = translatedError;
          }
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      // Redirect to login with success message
      to(`${getRoutePath.login()}?reset=success`);
    } catch (resetError) {
      if (resetError instanceof z.ZodError) {
        const errorMessage = resetError.issues[0]?.message || t('common:error');
        setError(errorMessage);
      } else {
        // Use generic translated error for all other errors
        setError(t('common:error'));
      }
      setIsLoading(false);
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2} mb="lg">
        {t('common:auth.reset_password_title')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        {t('common:auth.reset_password_subtitle', { email: email || '' })}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {error && (
          <Alert color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb="xs">
                {t('common:auth.verification_code')}
              </Text>
              <Center>
                <PinInput
                  length={6}
                  type="number"
                  value={otp}
                  onChange={setOtp}
                  disabled={isLoading}
                  size="lg"
                  oneTimeCode
                />
              </Center>
            </div>

            <PasswordInput
              label={t('common:auth.new_password')}
              placeholder={t('common:auth.new_password_placeholder')}
              required
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <PasswordInput
              label={t('common:auth.confirm_new_password')}
              placeholder={t('common:auth.confirm_new_password_placeholder')}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              disabled={isLoading}
              autoComplete="new-password"
            />

            <Button
              fullWidth
              type="submit"
              disabled={isLoading || otp.length !== 6}
              leftSection={isLoading ? <Loader size={16} /> : null}
            >
              {isLoading ? t('common:auth.resetting') : t('common:auth.reset_password_button')}
            </Button>
          </Stack>
        </form>

        <Group justify="center" mt="lg" gap="md">
          <Text size="sm" c="dimmed">
            {t('common:auth.didnt_receive_code')}
          </Text>
          <Anchor
            component="button"
            type="button"
            onClick={handleResendOTP}
            disabled={isResending}
            size="sm"
          >
            {isResending ? t('common:auth.sending') : t('common:auth.resend_code_button')}
          </Anchor>
        </Group>

        <Group justify="center" mt="md">
          <Anchor component="button" type="button" onClick={toLogin} size="sm">
            {t('common:auth.back_to_login')}
          </Anchor>
        </Group>
      </Paper>
    </Container>
  );
}
