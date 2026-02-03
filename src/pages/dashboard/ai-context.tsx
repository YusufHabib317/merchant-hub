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
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconAlertCircle,
  IconCheck,
} from '@tabler/icons-react';
import { useState } from 'react';
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
      setError(err.response?.data?.error || 'Failed to create context');
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
      setError(err.response?.data?.error || 'Failed to update context');
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
      setError(err.response?.data?.error || 'Failed to delete context');
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
    if (window.confirm('Are you sure you want to delete this context?')) {
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
              <Title order={1}>AI Context Manager</Title>
              <Text c="dimmed">
                Manage additional information and knowledge for your AI assistant.
              </Text>
            </div>
            <Button leftSection={<IconPlus size={16} />} onClick={open}>
              Add Context
            </Button>
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error" onClose={() => setError(null)} withCloseButton>
              {error}
            </Alert>
          )}

          <Card withBorder padding="lg" radius="md">
            {contexts && contexts.length > 0 ? (
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Content</Table.Th>
                    <Table.Th>Tags</Table.Th>
                    <Table.Th style={{ width: 100 }}>Actions</Table.Th>
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
                <Text c="dimmed">No context items found. Add some information to help your AI.</Text>
              </Center>
            )}
          </Card>
        </Stack>

        <Modal
          opened={opened}
          onClose={closeModal}
          title={editingContext ? 'Edit Context' : 'Add New Context'}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <Stack>
              {error && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
                  {error}
                </Alert>
              )}

              <Textarea
                label="Content"
                placeholder="Enter information for the AI..."
                minRows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.currentTarget.value })}
                required
                description="The AI will use this information to answer customer queries. Inappropriate content will be rejected."
              />

              <TagsInput
                label="Tags"
                placeholder="Press Enter to add tags"
                value={formData.tags}
                onChange={(tags) => setFormData({ ...formData, tags })}
                clearable
              />

              <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={createMutation.isPending || updateMutation.isPending}
                  leftSection={<IconCheck size={16} />}
                >
                  {editingContext ? 'Save Changes' : 'Add Context'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
