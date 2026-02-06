import { Card, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconUser, IconMail } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';

interface UserSession {
  user: {
    id: string;
    email: string;
    name?: string;
    emailVerified: boolean;
    role?: string;
  };
  session: {
    expiresAt: Date;
    createdAt?: Date;
  };
}

interface AccountInfoCardProps {
  session: UserSession;
}

export function AccountInfoCard({ session }: AccountInfoCardProps) {
  const { t } = useTranslation('common');

  return (
    <Card withBorder padding="lg" radius="md">
      <Group mb="md">
        <IconUser size={24} />
        <Text fw={600} size="lg">
          {t('profile_page.account_info')}
        </Text>
      </Group>
      <Stack gap="md">
        <TextInput
          label={t('profile_page.name_label')}
          value={session.user.name || t('profile_page.not_set')}
          readOnly
          leftSection={<IconUser size={16} />}
          description={t('profile_page.name_description')}
        />

        <TextInput
          label={t('profile_page.email_label')}
          value={session.user.email}
          readOnly
          leftSection={<IconMail size={16} />}
          description={t('profile_page.email_description')}
        />
      </Stack>
    </Card>
  );
}
