import {
  Title,
  Stack,
  Text,
  Group,
  Loader,
  Center,
  Alert,
  Badge,
} from '@mantine/core';
import {
  IconCheck,
  IconAlertCircle,
  IconShield,
} from '@tabler/icons-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { authClient } from '@/lib/auth-client';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { AccountInfoCard } from '@/components/auth/AccountInfoCard';
import { PasswordChangeCard } from '@/components/auth/PasswordChangeCard';
import { OtpVerificationModal } from '@/components/auth/OtpVerificationModal';
import useTranslation from 'next-translate/useTranslation';

type PasswordChangeStep = 'idle' | 'otp-sent' | 'verifying' | 'success';

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const { t } = useTranslation('common');

  const [passwordChangeStep, setPasswordChangeStep] = useState<PasswordChangeStep>('idle');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const requestPasswordOTP = useMutation({
    mutationFn: async (data: typeof passwordForm) => {
      const response = await apiClient.post(API_ENDPOINTS.auth.requestPasswordChangeOTP, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResetToken(data.token);
      setPasswordChangeStep('otp-sent');
      setShowOtpModal(true);
      setSuccessMessage(t('profile_page.otp_sent_success'));
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || t('profile_page.failed_to_send_otp'));
      setSuccessMessage(null);
      setPasswordChangeStep('idle');
    },
  });

  const verifyOTPAndChangePassword = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(API_ENDPOINTS.auth.verifyPasswordChangeOTP, {
        token: resetToken,
        otp,
        newPassword: passwordForm.newPassword,
      });
      return response.data;
    },
    onSuccess: () => {
      setPasswordChangeStep('success');
      setSuccessMessage(t('profile_page.password_changed_success'));
      setErrorMessage(null);
      setShowOtpModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOtp('');
      setResetToken('');
      setTimeout(() => {
        setPasswordChangeStep('idle');
        setSuccessMessage(null);
      }, 4000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || t('profile_page.otp_verification_failed'));
      setSuccessMessage(null);
      setPasswordChangeStep('otp-sent');
    },
  });

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage(t('profile_page.passwords_do_not_match'));
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMessage(t('profile_page.password_too_short'));
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setErrorMessage(t('profile_page.password_must_be_different'));
      return;
    }

    setErrorMessage(null);
    requestPasswordOTP.mutate(passwordForm);
  };

  const handleOtpSubmit = () => {
    if (otp.length !== 6) {
      setErrorMessage(t('profile_page.invalid_otp'));
      return;
    }
    setPasswordChangeStep('verifying');
    verifyOTPAndChangePassword.mutate();
  };

  const handleResendOTP = () => {
    setOtp('');
    requestPasswordOTP.mutate(passwordForm);
  };

  if (!session) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <Center py="xl">
            <Loader />
          </Center>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const userSession = {
    user: {
      ...session.user,
      role: (session.user as { role?: string }).role,
    },
    session: session.session,
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between">
            <div>
              <Title order={1}>{t('profile_page.title')}</Title>
              <Text c="dimmed" mt="xs">
                {t('profile_page.subtitle')}
              </Text>
            </div>
            {userSession.user.role && (
              <Badge
                size="lg"
                variant="gradient"
                gradient={{ from: 'blue', to: 'cyan' }}
                leftSection={<IconShield size={16} />}
              >
                {userSession.user.role}
              </Badge>
            )}
          </Group>

          {successMessage && (
            <Alert icon={<IconCheck size={16} />} color="green" title={t('success')}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title={t('error')}>
              {errorMessage}
            </Alert>
          )}

          <AccountInfoCard session={userSession} />

          <PasswordChangeCard
            currentPassword={passwordForm.currentPassword}
            newPassword={passwordForm.newPassword}
            confirmPassword={passwordForm.confirmPassword}
            onCurrentPasswordChange={(value) => setPasswordForm({ ...passwordForm, currentPassword: value })}
            onNewPasswordChange={(value) => setPasswordForm({ ...passwordForm, newPassword: value })}
            onConfirmPasswordChange={(value) => setPasswordForm({ ...passwordForm, confirmPassword: value })}
            onSubmit={handlePasswordChangeSubmit}
            isLoading={requestPasswordOTP.isPending}
            isDisabled={passwordChangeStep !== 'idle'}
          />
        </Stack>

        <OtpVerificationModal
          opened={showOtpModal}
          onClose={() => {
            setShowOtpModal(false);
            setPasswordChangeStep('idle');
            setOtp('');
          }}
          email={session.user.email}
          otp={otp}
          onOtpChange={setOtp}
          onSubmit={handleOtpSubmit}
          onResend={handleResendOTP}
          isVerifying={passwordChangeStep === 'verifying'}
          isResending={requestPasswordOTP.isPending}
          error={passwordChangeStep === 'otp-sent' ? errorMessage : null}
        />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
