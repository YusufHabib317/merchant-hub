import {
  Title,
  Stack,
  Card,
  Text,
  TextInput,
  Textarea,
  Button,
  Group,
  Loader,
  Center,
  Alert,
  ActionIcon,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import {
  IconCheck, IconAlertCircle, IconCopy, IconCheck as IconCheckmark,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageUpload } from '@/components/products/ImageUpload';
import useTranslation from 'next-translate/useTranslation';

interface MerchantData {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
}

export default function SettingsPage() {
  const { t } = useTranslation('common');
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    address: '',
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: merchant, isLoading } = useQuery<MerchantData>({
    queryKey: ['merchant', session?.user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get(API_ENDPOINTS.merchants.me);
      return data.data;
    },
    enabled: !!session?.user?.id,
    retry: false,
  });

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name || '',
        description: merchant.description || '',
        logoUrl: merchant.logoUrl || '',
        address: merchant.address || '',
      });
    }
  }, [merchant]);

  const updateMerchant = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.put(API_ENDPOINTS.merchants.update(merchant?.id || ''), data);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage(t('settings_page.save_success'));
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || t('settings_page.save_error'));
      setSuccessMessage(null);
    },
  });

  const createMerchant = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.post(API_ENDPOINTS.merchants.create, data);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(t('settings_page.setup_success'));
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      queryClient.setQueryData(['merchant', session?.user?.id], data.data);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || t('settings_page.setup_error'));
      setSuccessMessage(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (merchant) {
      updateMerchant.mutate(formData);
    } else {
      createMerchant.mutate(formData);
    }
  };

  if (isLoading) {
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

  const isNewMerchant = !merchant && !createMerchant.isError;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Title order={1}>{isNewMerchant ? t('settings_page.create_store_title') : t('settings_page.title')}</Title>

          <Text c="dimmed">
            {isNewMerchant
              ? t('settings_page.create_store_desc')
              : t('settings_page.manage_settings_desc')}
          </Text>

          {successMessage && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Success">
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Card withBorder padding="lg" radius="md">
                <Title order={3} mb="md">
                  {t('settings_page.store_info_title')}
                </Title>
                <Stack gap="md">
                  <TextInput
                    label={t('settings_page.store_name_label')}
                    placeholder={t('settings_page.store_name_placeholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
                    required
                  />

                  <Textarea
                    label={t('settings_page.description_label')}
                    placeholder={t('settings_page.description_placeholder')}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.currentTarget.value })}
                    rows={4}
                  />

                  <TextInput
                    label={t('settings_page.address_label')}
                    placeholder={t('settings_page.address_placeholder')}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.currentTarget.value })}
                  />

                  <ImageUpload
                    label={t('settings_page.store_logo_label')}
                    value={formData.logoUrl}
                    onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                    onError={(msg) => setErrorMessage(msg)}
                    endpoint="merchantLogo"
                  />
                </Stack>
              </Card>

              {!isNewMerchant && (
                <Card withBorder padding="lg" radius="md">
                  <Title order={3} mb="md">
                    {t('settings_page.account_info_title')}
                  </Title>
                  <Stack gap="md">
                    <CopyButton value={session?.user?.email || ''}>
                      {({ copied, copy }) => (
                        <TextInput
                          label={t('settings_page.email_label')}
                          value={session?.user?.email || ''}
                          readOnly
                          rightSection={(
                            <Tooltip label={copied ? t('settings_page.copied') : t('settings_page.copy')} withArrow position="right">
                              <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                variant="subtle"
                                onClick={copy}
                              >
                                {copied ? <IconCheckmark size={16} /> : <IconCopy size={16} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        />
                      )}
                    </CopyButton>
                    <CopyButton value={merchant?.slug || ''}>
                      {({ copied, copy }) => (
                        <TextInput
                          label={t('settings_page.store_url_slug_label')}
                          value={merchant?.slug || ''}
                          readOnly
                          description={t('settings_page.store_url_slug_desc')}
                          rightSection={(
                            <Tooltip label={copied ? t('settings_page.copied') : t('settings_page.copy')} withArrow position="right">
                              <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                variant="subtle"
                                onClick={copy}
                              >
                                {copied ? <IconCheckmark size={16} /> : <IconCopy size={16} />}
                              </ActionIcon>
                            </Tooltip>
                          )}
                        />
                      )}
                    </CopyButton>
                  </Stack>
                </Card>
              )}

              <Group justify="flex-end">
                <Button
                  type="submit"
                  loading={updateMerchant.isPending || createMerchant.isPending}
                  leftSection={<IconCheck size={16} />}
                >
                  {isNewMerchant ? t('settings_page.create_store_btn') : t('settings_page.save_settings_btn')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
