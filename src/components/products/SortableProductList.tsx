import { useState } from 'react';
import {
  Paper,
  Group,
  Text,
  ActionIcon,
  Box,
  Alert,
  Button,
  Stack,
} from '@mantine/core';
import {
  IconGripVertical,
  IconAlertCircle,
  IconRefresh,
  IconCheck,
} from '@tabler/icons-react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { ProductCard } from './ProductCard';

interface Product {
  id: string;
  name: string;
  description?: string;
  priceUSD: number;
  priceSYP?: number;
  imageUrls?: string[];
  category?: string;
}

interface SortableProductListProps {
  products: Product[];
  sortOrder: string[];
  onSortOrderChange: (newOrder: string[]) => void;
  onResetSort: () => void;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface SortableItemProps {
  product: Product;
  index: number;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function SortableItem({
  product,
  index,
  isDragging,
  onDragStart,
  onDragEnd,
  showActions = false,
  onEdit = undefined,
  onDelete = undefined,
}: SortableItemProps) {
  return (
    <Reorder.Item
      value={product.id}
      id={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileDrag={{ scale: 1.02, zIndex: 1000 }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        listStyle: 'none',
        position: 'relative',
      }}
    >
      <Paper
        p="xs"
        withBorder
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          backgroundColor: isDragging ? 'var(--mantine-color-blue-light)' : undefined,
          borderColor: isDragging ? 'var(--mantine-color-blue-filled)' : undefined,
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
      >
        <Group gap="xs" align="flex-start" wrap="nowrap">
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 8,
            }}
          >
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <IconGripVertical size={18} />
            </ActionIcon>
            <Text size="xs" c="dimmed" w={30} ta="center">
              {index + 1}
            </Text>
          </Box>
          <Box style={{ flex: 1 }}>
            <ProductCard
              id={product.id}
              name={product.name}
              description={product.description}
              priceUSD={product.priceUSD}
              priceSYP={product.priceSYP || 0}
              imageUrls={product.imageUrls}
              category={product.category}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Box>
        </Group>
      </Paper>
    </Reorder.Item>
  );
}

export function SortableProductList({
  products,
  sortOrder,
  onSortOrderChange,
  onResetSort,
  showActions = false,
  onEdit = undefined,
  onDelete = undefined,
}: SortableProductListProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Create a map for quick lookup
  const productMap = new Map(products.map((p) => [p.id, p]));

  // Get products in current sort order
  const sortedProducts = sortOrder
    .map((id) => productMap.get(id))
    .filter((p): p is Product => p !== undefined);

  // Add any products that might not be in sortOrder yet
  const sortedProductIds = new Set(sortOrder);
  const missingProducts = products.filter((p) => !sortedProductIds.has(p.id));
  const allProducts = [...sortedProducts, ...missingProducts];

  const handleReorder = (newOrder: string[]) => {
    onSortOrderChange(newOrder);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  if (products.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No products yet
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="blue"
        variant="light"
      >
        <Group justify="space-between" align="center">
          <Text size="sm">
            Drag and drop products to arrange them in your preferred order.
            This order will be used for both the product list and image exports.
          </Text>
          <Button
            variant="light"
            size="xs"
            leftSection={<IconRefresh size={14} />}
            onClick={onResetSort}
          >
            Reset Order
          </Button>
        </Group>
      </Alert>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert
              icon={<IconCheck size={16} />}
              color="green"
              variant="light"
              withCloseButton
              onClose={() => setShowSuccess(false)}
            >
              Product order updated successfully!
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Reorder.Group
        axis="y"
        values={allProducts.map((p) => p.id)}
        onReorder={handleReorder}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: 0,
          margin: 0,
        }}
      >
        <AnimatePresence>
          {allProducts.map((product, index) => (
            <SortableItem
              key={product.id}
              product={product}
              index={index}
              isDragging={isDragging}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={() => setIsDragging(false)}
              showActions={showActions}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </Stack>
  );
}
