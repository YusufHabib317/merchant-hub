import {
  ActionIcon, Badge, Box, Group, Image, Table, Text,
} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { z } from 'zod';
import { ProductConditionEnum } from '@/schemas/product';
import { formatCurrency } from '@/utils/currency';

interface Product {
  id: string;
  name: string;
  description?: string | null;
  priceUSD: number;
  priceSYP?: number | null;
  imageUrls?: string[];
  category?: string | null;
  condition?: z.infer<typeof ProductConditionEnum>;
}

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  showActions?: boolean;
}

export function ProductTable({
  products,
  onEdit = undefined,
  onDelete = undefined,
  showActions = false,
}: ProductTableProps) {
  const { t } = useTranslation('common');

  const rows = products.map((product) => (
    <Table.Tr key={product.id}>
      <Table.Td>
        {product.imageUrls && product.imageUrls.length > 0 ? (
          <Image
            src={product.imageUrls[0]}
            alt={product.name}
            w={50}
            h={50}
            radius="sm"
            fit="cover"
          />
        ) : (
          <Box w={50} h={50} bg="gray.1" style={{ borderRadius: 4 }} />
        )}
      </Table.Td>
      <Table.Td>
        <Text fw={500}>{product.name}</Text>
        {product.description && (
          <Text size="xs" c="dimmed" lineClamp={1}>
            {product.description}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        {product.category ? (
          <Badge variant="light">{product.category}</Badge>
        ) : (
          <Text size="sm" c="dimmed">-</Text>
        )}
        {product.condition && product.condition !== 'NEW' && (
          <Badge variant="outline" color={product.condition === 'USED' ? 'orange' : 'blue'} ml="xs">
            {t(`condition_${product.condition.toLowerCase()}`)}
          </Badge>
        )}
      </Table.Td>
      <Table.Td>
        <Text fw={500}>{formatCurrency(product.priceUSD, 'USD')}</Text>
        {product.priceSYP && (
          <Text size="xs" c="dimmed">
            {formatCurrency(product.priceSYP, 'SYP')}
          </Text>
        )}
      </Table.Td>
      {showActions && (
        <Table.Td>
          <Group gap="xs">
            {onEdit && (
              <ActionIcon variant="subtle" color="blue" onClick={() => onEdit(product)}>
                <IconEdit size={16} />
              </ActionIcon>
            )}
            {onDelete && (
              <ActionIcon variant="subtle" color="red" onClick={() => onDelete(product)}>
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('image')}</Table.Th>
          <Table.Th>{t('name')}</Table.Th>
          <Table.Th>{t('category')}</Table.Th>
          <Table.Th>{t('price')}</Table.Th>
          {showActions && <Table.Th>{t('actions')}</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
