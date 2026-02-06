import {
  Title,
  Stack,
  Card,
  Text,
  Button,
  Group,
  Loader,
  Center,
  Alert,
  Modal,
  Textarea,
  TagsInput,
  ActionIcon,
  Badge,
  Table,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconEdit, IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { apiClient } from '@/lib/api/client';

interface MerchantContext {
  id: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const QUERY_KEY = ['ai-contexts'];

export default function AIContextPage() {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const [editingContext, setEditingContext] = useState<MerchantContext | null>(null);

  const [formData, setFormData] = useState({
    content: '',
    tags: [] as string[],
  });

  const [error, setError] = useState<string | null>(null);

  const closeModal = () => {
    setEditingContext(null);
    setFormData({ content: '', tags: [] });
    setError(null);
    close();
  };

  const { data: contexts, isLoading } = useQuery<MerchantContext[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await apiClient.get('/merchants/ai-context');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiClient.post('/merchants/ai-context', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      closeModal();
    },
    onError: (err: AxiosError<{ error: string }>) => {
      setError(err.response?.data?.error || t('ai_context.error_create'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await apiClient.put(`/merchants/ai-context/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      closeModal();
    },
    onError: (err: AxiosError<{ error: string }>) => {
      setError(err.response?.data?.error || t('ai_context.error_update'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/merchants/ai-context/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (err: AxiosError<{ error: string }>) => {
      setError(err.response?.data?.error || t('ai_context.error_delete'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (editingContext) {
      updateMutation.mutate({ id: editingContext.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (context: MerchantContext) => {
    setEditingContext(context);
    setFormData({
      content: context.content,
      tags: context.tags,
    });
    open();
  };

  const handleDelete = (id: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm(t('ai_context.delete_confirm'))) {
      deleteMutation.mutate(id);
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Group justify="space-between">
            <div>
              <Title order={1}>{t('ai_context.title')}</Title>
              <Text c="dimmed">{t('ai_context.description')}</Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={open}>
              {t('ai_context.add_context')}
            </Button>
          </Group>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              title={t('ai_context.error_title')}
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Alert>
          )}

          <Card withBorder padding="lg" radius="md">
            {contexts && contexts.length > 0 ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('ai_context.content')}</Table.Th>
                    <Table.Th>{t('ai_context.tags')}</Table.Th>
                    <Table.Th style={{ width: 100 }}>{t('ai_context.actions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {contexts.map((context) => (
                    <Table.Tr key={context.id}>
                      <Table.Td>
                        <Text lineClamp={2} size="sm">
                          {context.content}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          {context.tags.map((tag) => (
                            <Badge key={tag} size="sm" variant="light">
                              {tag}
                            </Badge>
                          ))}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(context)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => handleDelete(context.id)}
                            loading={deleteMutation.isPending}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Center py="xl">
                <Text c="dimmed">{t('ai_context.no_items')}</Text>
              </Center>
            )}
          </Card>
        </Stack>

        <Modal
          opened={opened}
          onClose={closeModal}
          title={editingContext ? t('ai_context.edit_context') : t('ai_context.add_new_context')}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <Stack>
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  title={t('ai_context.error_title')}
                >
                  {error}
                </Alert>
              )}

              <Textarea
                label={t('ai_context.content')}
                placeholder={t('ai_context.content_placeholder')}
                minRows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
                required
                description={t('ai_context.content_description')}
              />

              <TagsInput
                label={t('ai_context.tags')}
                placeholder={t('ai_context.tags_placeholder')}
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                clearable
              />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeModal}>
                  {t('ai_context.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                  leftSection={<IconCheck size={16} />}
                >
                  {editingContext ? t('ai_context.save_changes') : t('ai_context.add_context')}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
