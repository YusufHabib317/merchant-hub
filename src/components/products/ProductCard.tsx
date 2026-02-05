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
import useTranslation from 'next-translate/useTranslation';
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
  stock?: number;
  isPublished?: boolean;
  tags?: string[];
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// eslint-disable-next-line complexity
export function ProductCard({
  id,
  name,
  description = undefined,
  priceUSD,
  priceSYP,
  imageUrls = undefined,
  category = undefined,
  stock = 0,
  isPublished = true,
  tags = [],
  showActions = false,
  onEdit = undefined,
  onDelete = undefined,
}: ProductCardProps) {
  const { t } = useTranslation('common');
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
                <Text c="dimmed" size="xs">{t('no_image')}</Text>
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
                <Group gap="xs" align="center">
                  <Text fw={600} size="md" lineClamp={1}>
                    {name}
                  </Text>
                  {!isPublished && (
                    <Badge size="xs" color="gray">
                      {t('unpublished')}
                    </Badge>
                  )}
                </Group>
                <Group gap="xs" mt={4}>
                  {category && <Badge size="xs">{category}</Badge>}
                  {stock === 0 && (
                    <Badge size="xs" color="red">
                      {t('out_of_stock')}
                    </Badge>
                  )}
                  {stock > 0 && stock <= 5 && (
                    <Badge size="xs" color="orange">
                      {t('low_stock')}
                    </Badge>
                  )}
                </Group>
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
                      {t('edit')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => setDeleteModalOpened(true)}
                    >
                      {t('delete')}
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

            {tags && tags.length > 0 && (
              <Group gap={4}>
                {tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} size="xs" variant="dot" color="blue">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 3 && (
                  <Text size="xs" c="dimmed">
                    +
                    {tags.length - 3}
                  </Text>
                )}
              </Group>
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
        title={t('delete_product_title')}
        centered
      >
        <Text mb="lg">
          {t('delete_product_confirm')}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteModalOpened(false)}>
            {t('cancel')}
          </Button>
          <Button color="red" onClick={handleDelete}>
            {t('delete')}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
