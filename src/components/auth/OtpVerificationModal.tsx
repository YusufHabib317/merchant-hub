import { Modal, Stack, Text, Center, PinInput, Alert, Group, Button, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface OtpModalProps {
  opened: boolean;
  onClose: () => void;
  email: string;
  otp: string;
  onOtpChange: (value: string) => void;
  onSubmit: () => void;
  onResend: () => void;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
}

export function OtpVerificationModal({
  opened,
  onClose,
  email,
  otp,
  onOtpChange,
  onSubmit,
  onResend,
  isVerifying,
  isResending,
  error,
}: OtpModalProps) {
  const { t } = useTranslation('common');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={3}>{t('profile_page.otp_modal_title')}</Title>}
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('profile_page.otp_modal_description')} <strong>{email}</strong>.{' '}
          {t('profile_page.otp_modal_instruction')}
        </Text>

        <Center>
          <PinInput
            length={6}
            value={otp}
            onChange={onOtpChange}
            size="lg"
            type="number"
            disabled={isVerifying}
          />
        </Center>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        <Group justify="space-between">
          <Button
            variant="subtle"
            onClick={onResend}
            disabled={isResending || isVerifying}
            loading={isResending}
          >
            {t('profile_page.resend_otp')}
          </Button>
          <Button onClick={onSubmit} loading={isVerifying} disabled={otp.length !== 6}>
            {t('profile_page.verify_button')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
