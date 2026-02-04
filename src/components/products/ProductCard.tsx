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
  Flex,
} from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import {
  IconEdit, IconTrash, IconDots,
} from '@tabler/icons-react';
import { useState } from 'react';
import { formatCurrency } from '@/utils/currency';

interface ProductCardProps {
  id: string;
  name: string;
  description?: string;
  priceUSD: number;
  priceSYP: number;
  imageUrls?: string[];
  category?: string;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ProductCard({
  id,
  name,
  description = undefined,
  priceUSD,
  priceSYP,
  imageUrls = undefined,
  category = undefined,
  showActions = false,
  onEdit = undefined,
  onDelete = undefined,
}: ProductCardProps) {
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);

  const handleEdit = () => {
    if (onEdit) {
      onEdit(id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(id);
      setDeleteModalOpened(false);
    }
  };

  return (
    <>
      <Card withBorder radius="md" padding={0}>
        <Flex direction={{ base: 'row', sm: 'column' }}>
          <Box
            w={{ base: 120, sm: '100%' }}
            h={{ base: 'auto', sm: 200 }}
            style={{ position: 'relative', flexShrink: 0 }}
          >
            {!imageUrls || imageUrls.length === 0 ? (
              <Box
                h="100%"
                bg="gray.1"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text c="dimmed" size="xs">No image</Text>
              </Box>
            ) : null}

            {imageUrls && imageUrls.length === 1 ? (
              <Image
                src={imageUrls[0]}
                alt={name}
                h="100%"
                w="100%"
                fit="cover"
                style={{ minHeight: 120 }}
              />
            ) : null}

            {imageUrls && imageUrls.length > 1 ? (
              <Carousel
                withIndicators
                withControls={false}
                height="100%"
                style={{ height: '100%', minHeight: 120 }}
                emblaOptions={{ loop: true }}
                styles={{
                  indicator: {
                    width: 8,
                    height: 8,
                    transition: 'width 250ms ease',
                    '&[data-active]': {
                      width: 24,
                    },
                  },
                }}
              >
                {imageUrls.map((imageUrl) => (
                  <Carousel.Slide key={imageUrl}>
                    <Image
                      src={imageUrl}
                      alt={name}
                      h="100%"
                      w="100%"
                      fit="cover"
                    />
                  </Carousel.Slide>
                ))}
              </Carousel>
            ) : null}
          </Box>

          <Stack gap="xs" p="sm" style={{ flex: 1, overflow: 'hidden' }}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box style={{ flex: 1 }}>
                <Text fw={600} size="md" lineClamp={1}>
                  {name}
                </Text>
                {category && <Badge size="xs" mt={4}>{category}</Badge>}
              </Box>
              {showActions && (
                <Menu shadow="md" width={150}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray" size="sm">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={handleEdit}
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
              )}
            </Group>

            {description && (
              <Text size="xs" c="dimmed" lineClamp={2}>
                {description}
              </Text>
            )}

            <Group justify="space-between" mt="auto">
              <div>
                <Text size="xs" c="dimmed">
                  USD
                </Text>
                <Text fw={600} size="sm">
                  {formatCurrency(priceUSD, 'USD')}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  SYP
                </Text>
                <Text fw={600} size="sm">{formatCurrency(priceSYP, 'SYP')}</Text>
              </div>
            </Group>
          </Stack>
        </Flex>
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
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
        </Group>
      </Modal>
    </>
  );
}
