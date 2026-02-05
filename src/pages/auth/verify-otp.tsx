import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Button,
  Title,
  Text,
  Stack,
  Group,
  Anchor,
  Alert,
  Loader,
  Box,
  PinInput,
} from '@mantine/core';
import { authClient } from '@/lib/auth-client';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import useTranslation from 'next-translate/useTranslation';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default function VerifyOtpPage() {
  const { t, lang } = useTranslation('common');
  const { toDashboard, toLogin, query } = useAppRouter();
  const { email } = query;
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendOtp = async (initial = false) => {
    if (!email || typeof email !== 'string') {
      setError(t('auth.otp_email_required'));
      return;
    }

    if (!initial) {
      setIsResending(true);
    }
    setError(null);

    try {
      const { error: sendError } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'email-verification',
      });

      if (sendError) {
        // Try to translate the error code if it exists
        const errorCode = sendError.code;
        let errorMessage: string = t('auth.otp_send_failed');

        if (errorCode) {
          const translatedError = t(`error:${errorCode}`);
          if (translatedError && translatedError !== `error:${errorCode}`) {
            errorMessage = translatedError;
          }
        }

        setError(errorMessage);
      } else {
        if (!initial) {
          setSuccess(t('auth.otp_resent'));
          setTimeout(() => setSuccess(null), 3000);
        }
        setCountdown(60);
      }
    } catch {
      setError(t('auth.otp_send_failed'));
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [countdown]);

  useEffect(() => {
    // Auto-send OTP when page loads with email
    if (email && typeof email === 'string') {
      sendOtp(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  const handleResendOtp = () => sendOtp(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || typeof email !== 'string') {
      setError(t('auth.otp_email_required'));
      setIsLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setError(t('auth.otp_invalid_length'));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: verifyError } = await authClient.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (verifyError) {
        const errorCode = verifyError.code;
        let errorMessage: string = t('auth.otp_verification_failed');

        if (errorCode) {
          const translatedError = t(`error:${errorCode}`);
          if (translatedError && translatedError !== `error:${errorCode}`) {
            errorMessage = translatedError;
          }
        }

        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data) {
        setSuccess(t('auth.email_verified_success'));
        setTimeout(() => toDashboard(), 1500);
      }
    } catch {
      setError(t('auth.otp_verification_failed'));
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <Container size={420} my={40}>
        <Paper withBorder shadow="md" p={30} radius="md">
          <Alert color="red">{t('auth.otp_no_email')}</Alert>
          <Group justify="center" mt="lg">
            <Anchor component="button" type="button" onClick={toLogin} size="sm">
              {t('auth.back_to_login')}
            </Anchor>
          </Group>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size={420} my={40}>
      <Title ta="center" order={2} mb="lg">
        {t('auth.verify_email')}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mb={30}>
        {t('auth.otp_sent_to', { email })}
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md" pos="relative">
        <Box
          style={{
            position: 'absolute',
            top: '1rem',
            ...(lang === 'ar' ? { left: '1rem' } : { right: '1rem' }),
            zIndex: 10,
          }}
        >
          <LanguageSwitcher />
        </Box>

        <Box pt={30}>
          {error && <Alert color="red" mb="md">{error}</Alert>}
          {success && <Alert color="green" mb="md">{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack gap="md" align="center">
              <PinInput
                length={6}
                type="number"
                value={otp}
                onChange={setOtp}
                disabled={isLoading}
                size="lg"
                oneTimeCode
                autoFocus
              />
              <Button
                fullWidth
                type="submit"
                disabled={isLoading || otp.length !== 6}
                leftSection={isLoading ? <Loader size={16} /> : null}
              >
                {isLoading ? t('auth.verifying') : t('auth.verify_button')}
              </Button>
            </Stack>
          </form>
          <Group justify="center" mt="lg">
            <Text size="sm">
              {t('auth.didnt_receive_code')}
              {' '}
              {countdown > 0 ? (
                <Text component="span" c="dimmed">
                  {t('auth.resend_in', { seconds: countdown })}
                </Text>
              ) : (
                <Anchor
                  component="button"
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  size="sm"
                >
                  {isResending ? t('auth.sending') : t('auth.resend_code')}
                </Anchor>
              )}
            </Text>
          </Group>
          <Group justify="center" mt="md">
            <Anchor component="button" type="button" onClick={toLogin} size="sm">
              {t('auth.back_to_login')}
            </Anchor>
          </Group>
        </Box>
      </Paper>
    </Container>
  );
}
