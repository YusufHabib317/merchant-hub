/* eslint-disable no-nested-ternary */
import {
  Title,
  Stack,
  TextInput,
  Select,
  Table,
  Badge,
  Group,
  Pagination,
  Text,
  Card,
  Skeleton,
} from '@mantine/core';
import { IconSearch, IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminUsers } from '@/lib/hooks/useAdmin';
import { Role } from '@prisma/client';

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);

  const { data, isLoading } = useAdminUsers({
    page,
    limit: 20,
    search,
    role: roleFilter,
  });

  const users = data?.users || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / (data?.limit || 20));

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'MERCHANT':
        return 'blue';
      case 'USER':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminLayout>
        <Stack gap="lg">
          <Title order={1}>Users Management</Title>

          <Card withBorder padding="lg" radius="md">
            <Group mb="md" gap="md">
              <TextInput
                placeholder="Search by name or email..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filter by role"
                data={[
                  { value: '', label: 'All Roles' },
                  { value: 'USER', label: 'User' },
                  { value: 'MERCHANT', label: 'Merchant' },
                  { value: 'ADMIN', label: 'Admin' },
                ]}
                value={roleFilter || ''}
                onChange={(value) => {
                  setRoleFilter(value ? (value as Role) : undefined);
                  setPage(1);
                }}
                clearable
                style={{ width: 200 }}
              />
            </Group>

            {isLoading ? (
              <Stack gap="sm">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} height={50} radius="sm" />
                ))}
              </Stack>
            ) : users.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No users found
              </Text>
            ) : (
              <>
                <Table.ScrollContainer minWidth={700}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Role</Table.Th>
                        <Table.Th>Email Verified</Table.Th>
                        <Table.Th>Created At</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {users.map((user) => (
                        <Table.Tr key={user.id}>
                          <Table.Td>{user.name || '-'}</Table.Td>
                          <Table.Td>{user.email}</Table.Td>
                          <Table.Td>
                            <Badge color={getRoleBadgeColor(user.role)} variant="light">
                              {user.role}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {user.emailVerified ? (
                              <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
                                Verified
                              </Badge>
                            ) : (
                              <Badge color="red" variant="light" leftSection={<IconX size={12} />}>
                                Not Verified
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>

                {totalPages > 1 && (
                  <Group justify="space-between" mt="md">
                    <Text size="sm" c="dimmed">
                      Showing {users.length} of {total} users
                    </Text>
                    <Pagination total={totalPages} value={page} onChange={setPage} />
                  </Group>
                )}
              </>
            )}
          </Card>
        </Stack>
      </AdminLayout>
    </ProtectedRoute>
  );
}
