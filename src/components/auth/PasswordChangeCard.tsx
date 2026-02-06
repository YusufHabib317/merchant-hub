import { Card, Group, Stack, Text, PasswordInput, Button, Divider } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface PasswordChangeCardProps {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function PasswordChangeCard({
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isLoading,
  isDisabled,
}: PasswordChangeCardProps) {
  const { t } = useTranslation('common');

  return (
    <Card withBorder padding="lg" radius="md">
      <Group mb="md">
        <IconLock size={24} />
        <Text fw={600} size="lg">
          {t('profile_page.password_security')}
        </Text>
      </Group>

      <Text c="dimmed" size="sm" mb="md">
        {t('profile_page.password_security_description')}
      </Text>

      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <PasswordInput
            label={t('profile_page.current_password')}
            placeholder={t('profile_page.current_password_placeholder')}
            value={currentPassword}
            onChange={(e) => onCurrentPasswordChange(e.currentTarget.value)}
            required
            disabled={isDisabled}
          />

          <Divider />

          <PasswordInput
            label={t('profile_page.new_password')}
            placeholder={t('profile_page.new_password_placeholder')}
            value={newPassword}
            onChange={(e) => onNewPasswordChange(e.currentTarget.value)}
            required
            disabled={isDisabled}
            description={t('profile_page.new_password_description')}
          />

          <PasswordInput
            label={t('profile_page.confirm_password')}
            placeholder={t('profile_page.confirm_password_placeholder')}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.currentTarget.value)}
            required
            disabled={isDisabled}
            error={
              confirmPassword && newPassword !== confirmPassword
                ? t('profile_page.passwords_do_not_match')
                : undefined
            }
          />

          <Group justify="flex-end">
            <Button
              type="submit"
              loading={isLoading}
              disabled={isDisabled}
              leftSection={<IconLock size={16} />}
            >
              {t('profile_page.change_password_button')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
}
