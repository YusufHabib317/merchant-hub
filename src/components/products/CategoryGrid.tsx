import {
  Grid,
  Card,
  Image,
  Text,
  Badge,
  Box,
  Skeleton,
  Stack,
  UnstyledButton,
} from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { CategoryInfo } from '@/pages/api/merchants/[id]/categories';

export interface CategoryGridProps {
  categories: CategoryInfo[];
  onSelectCategory: (name: string) => void;
  isLoading: boolean;
}

const SKELETON_COUNT = 6;

function CategoryCardSkeleton() {
  return (
    <Card withBorder radius="md" padding={0}>
      <Skeleton height={160} />
      <Stack gap="xs" p="sm">
        <Skeleton height={16} width="60%" />
        <Skeleton height={20} width={40} />
      </Stack>
    </Card>
  );
}

export function CategoryGrid({ categories, onSelectCategory, isLoading }: CategoryGridProps) {
  const { t } = useTranslation('common');

  if (isLoading) {
    return (
      <Grid>
        {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Grid.Col key={`skeleton-${index}`} span={{ base: 12, sm: 6, md: 4 }}>
            <CategoryCardSkeleton />
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  if (categories.length === 0) {
    return (
      <Box ta="center" py={60}>
        <Text size="xl" c="dimmed">
          {t('merchant_page.no_categories')}
        </Text>
      </Box>
    );
  }

  return (
    <Grid>
      {categories.map((category) => {
        const displayName =
          category.name === 'Uncategorized' ? t('merchant_page.uncategorized') : category.name;

        return (
          <Grid.Col key={category.name} span={{ base: 12, sm: 6, md: 4 }}>
            <UnstyledButton
              onClick={() => onSelectCategory(category.name)}
              style={{ width: '100%' }}
              aria-label={`${displayName} - ${category.productCount} ${t(
                'merchant_page.products_in_category'
              )}`}
            >
              <Card withBorder radius="md" padding={0} style={{ cursor: 'pointer' }}>
                {category.imageUrl ? (
                  <Image src={category.imageUrl} alt={displayName} height={160} fit="cover" />
                ) : (
                  <Box
                    h={160}
                    bg="gray.1"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconPhoto size={48} color="var(--mantine-color-gray-4)" />
                  </Box>
                )}

                <Stack gap="xs" p="sm">
                  <Text fw={600} size="md" lineClamp={1}>
                    {displayName}
                  </Text>
                  <Badge size="sm" variant="light">
                    {category.productCount} {t('merchant_page.products_in_category')}
                  </Badge>
                </Stack>
              </Card>
            </UnstyledButton>
          </Grid.Col>
        );
      })}
    </Grid>
  );
}
