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
import { IconSearch } from '@tabler/icons-react';
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAdminProducts } from '@/lib/hooks/useAdmin';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<boolean | undefined>(undefined);

  const { data, isLoading } = useAdminProducts({
    page,
    limit: 20,
    search,
    isPublished: publishedFilter,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / (data?.limit || 20));

  const formatPrice = (price: number) => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminLayout>
        <Stack gap="lg">
          <Title order={1}>Products Management</Title>

          <Card withBorder padding="lg" radius="md">
            <Group mb="md" gap="md">
              <TextInput
                placeholder="Search by product name..."
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
                style={{ flex: 1 }}
              />
              <Select
                placeholder="Filter by status"
                data={[
                  { value: '', label: 'All Products' },
                  { value: 'true', label: 'Published' },
                  { value: 'false', label: 'Unpublished' },
                ]}
                value={publishedFilter === undefined ? '' : String(publishedFilter)}
                onChange={(value) => {
                  setPublishedFilter(value === '' ? undefined : value === 'true');
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
            ) : products.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No products found
              </Text>
            ) : (
              <>
                <Table.ScrollContainer minWidth={800}>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Product Name</Table.Th>
                        <Table.Th>Merchant</Table.Th>
                        <Table.Th>Price (USD)</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Created At</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {products.map((product) => (
                        <Table.Tr key={product.id}>
                          <Table.Td>{product.name}</Table.Td>
                          <Table.Td>{product.merchantName}</Table.Td>
                          <Table.Td>{formatPrice(product.priceUSD)}</Table.Td>
                          <Table.Td>
                            {product.isPublished ? (
                              <Badge color="green" variant="light">
                                Published
                              </Badge>
                            ) : (
                              <Badge color="gray" variant="light">
                                Unpublished
                              </Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            {new Date(product.createdAt).toLocaleDateString('en-US', {
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
                      Showing {products.length} of {total} products
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
