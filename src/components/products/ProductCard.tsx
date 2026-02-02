import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Stack,
  ActionIcon,
  Menu,
  Modal,
  Button,
  Box,
} from '@mantine/core';
import {
  IconEdit, IconTrash, IconDots, IconChevronLeft, IconChevronRight,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useDeleteProduct } from '@/lib/hooks/useProducts';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import { formatCurrency } from '@/utils/currency';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  priceUSD: number;
  priceSYP: number;
  imageUrls?: string[];
  category?: string;
}

export function ProductCard({
  id,
  name,
  description = undefined,
  priceUSD,
  priceSYP,
  imageUrls = undefined,
  category = undefined,
}: ProductCardProps) {
  const { toEditProduct } = useAppRouter();
  const deleteProduct = useDeleteProduct();
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleDelete = () => {
    deleteProduct.mutate(id, {
      onSuccess: () => {
        setDeleteModalOpened(false);
      },
      // Error is already handled in the hook's onError callback
    });
  };

  const handlePrevImage = () => {
    if (imageUrls && imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
    }
  };

  const handleNextImage = () => {
    if (imageUrls && imageUrls.length > 0) {
      setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <>
      <Card withBorder radius="md">
        {imageUrls && imageUrls.length > 0 && (
          <Card.Section pos="relative">
            <Image
              src={imageUrls[currentImageIndex]}
              alt={`${name} - ${currentImageIndex + 1}`}
              height={200}
              fit="cover"
            />
            {imageUrls.length > 1 && (
              <>
                <ActionIcon
                  pos="absolute"
                  top="50%"
                  left={8}
                  style={{ transform: 'translateY(-50%)' }}
                  variant="filled"
                  color="dark"
                  size="sm"
                  onClick={handlePrevImage}
                >
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <ActionIcon
                  pos="absolute"
                  top="50%"
                  right={8}
                  style={{ transform: 'translateY(-50%)' }}
                  variant="filled"
                  color="dark"
                  size="sm"
                  onClick={handleNextImage}
                >
                  <IconChevronRight size={16} />
                </ActionIcon>
                <Group
                  pos="absolute"
                  bottom={8}
                  left="50%"
                  style={{ transform: 'translateX(-50%)' }}
                  gap={4}
                >
                  {imageUrls.map((url, index) => (
                    <Box
                      key={`${url}-${index}`}
                      w={8}
                      h={8}
                      bg={index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)'}
                      style={{ borderRadius: '50%', cursor: 'pointer' }}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </Group>
              </>
            )}
          </Card.Section>
        )}

        <Stack gap="sm" p="md">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={600} size="lg" lineClamp={1}>
                {name}
              </Text>
              {category && <Badge size="sm">{category}</Badge>}
            </div>
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => toEditProduct(id)}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => setDeleteModalOpened(true)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          {description && (
            <Text size="sm" c="dimmed" lineClamp={2}>
              {description}
            </Text>
          )}

          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">
                USD
              </Text>
              <Text fw={600}>
                {formatCurrency(priceUSD, 'USD')}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                SYP
              </Text>
              <Text fw={600}>{formatCurrency(priceSYP, 'SYP')}</Text>
            </div>
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={deleteModalOpened}
        onClose={() => setDeleteModalOpened(false)}
        title="Delete Product"
        centered
      >
        <Text mb="lg">
          Are you sure you want to delete this product? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={deleteProduct.isPending}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
