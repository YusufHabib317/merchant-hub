import {
  Paper,
  Group,
  Text,
  ThemeIcon,
  Badge,
  Collapse,
  Stack,
  Box,
  SegmentedControl,
  MultiSelect,
  NumberInput,
  Button,
} from '@mantine/core';
import {
  IconFilter,
  IconChevronDown,
  IconChevronUp,
  IconTag,
  IconPackage,
  IconCash,
} from '@tabler/icons-react';
import useTranslation from 'next-translate/useTranslation';
import { ProductFiltersProps } from '@/types/filters';

/* eslint-disable complexity -- UI component with multiple filter sections */
export function ProductFilters({
  values,
  options,
  onChange,
  onClear,
  isOpen = false,
  onToggle,
  showToggle = true,
}: ProductFiltersProps) {
  const { t } = useTranslation('common');

  const activeCount = [
    values.condition !== 'ALL',
    (values.categories?.length ?? 0) > 0,
    values.stock !== 'ALL',
    values.published !== 'ALL',
    (values.tags?.length ?? 0) > 0,
    values.minPrice !== '',
    values.maxPrice !== '',
  ].filter(Boolean).length;

  const handleChange = (key: keyof typeof values, value: unknown) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <Paper withBorder p="sm" radius="sm" bg="var(--mantine-color-gray-0)">
      <Group
        gap="xs"
        mb={isOpen ? 'xs' : 0}
        style={showToggle ? { cursor: 'pointer' } : undefined}
        onClick={showToggle ? onToggle : undefined}
        justify="space-between"
      >
        <Group gap="xs">
          <ThemeIcon size="xs" variant="light" color="blue">
            <IconFilter size={12} />
          </ThemeIcon>
          <Text size="sm" fw={500}>{t('filter')}</Text>
          {activeCount > 0 && (
            <Badge size="xs" variant="filled" color="blue">
              {activeCount}
            </Badge>
          )}
        </Group>
        {showToggle && (isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />)}
      </Group>

      <Collapse in={isOpen}>
        <Stack gap="sm">
          {/* Condition Filter */}
          <Box>
            <Text size="xs" fw={500} mb={4}>Condition</Text>
            <SegmentedControl
              value={values.condition || 'ALL'}
              onChange={(value) => handleChange('condition', value)}
              data={[
                { label: t('all'), value: 'ALL' },
                { label: t('condition_new'), value: 'NEW' },
                { label: t('condition_used'), value: 'USED' },
                { label: t('condition_refurbished'), value: 'REFURBISHED' },
              ]}
              fullWidth
              size="xs"
            />
          </Box>

          {/* Category Filter */}
          {options.categories.length > 0 && (
            <Box>
              <Group gap={4} mb={4}>
                <IconTag size={12} />
                <Text size="xs" fw={500}>Category</Text>
              </Group>
              <MultiSelect
                size="xs"
                placeholder="All categories"
                data={options.categories}
                value={values.categories || []}
                onChange={(value) => handleChange('categories', value)}
                clearable
                searchable
              />
            </Box>
          )}

          {/* Stock Filter */}
          <Box>
            <Group gap={4} mb={4}>
              <IconPackage size={12} />
              <Text size="xs" fw={500}>Stock</Text>
            </Group>
            <SegmentedControl
              value={values.stock || 'ALL'}
              onChange={(value) => handleChange('stock', value)}
              data={[
                { label: 'All', value: 'ALL' },
                { label: 'In Stock', value: 'IN_STOCK' },
                { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
              ]}
              fullWidth
              size="xs"
            />
          </Box>

          {/* Published Filter */}
          <Box>
            <Text size="xs" fw={500} mb={4}>Status</Text>
            <SegmentedControl
              value={values.published || 'ALL'}
              onChange={(value) => handleChange('published', value)}
              data={[
                { label: 'All', value: 'ALL' },
                { label: 'Published', value: 'PUBLISHED' },
                { label: 'Unpublished', value: 'UNPUBLISHED' },
              ]}
              fullWidth
              size="xs"
            />
          </Box>

          {/* Tags Filter */}
          {options.tags.length > 0 && (
            <Box>
              <Group gap={4} mb={4}>
                <IconTag size={12} />
                <Text size="xs" fw={500}>Tags</Text>
              </Group>
              <MultiSelect
                size="xs"
                placeholder="All tags"
                data={options.tags}
                value={values.tags || []}
                onChange={(value) => handleChange('tags', value)}
                clearable
                searchable
              />
            </Box>
          )}

          {/* Price Range Filter */}
          <Box>
            <Group gap={4} mb={4}>
              <IconCash size={12} />
              <Text size="xs" fw={500}>Price Range (USD)</Text>
            </Group>
            <Group gap="xs">
              <NumberInput
                size="xs"
                placeholder="Min"
                value={values.minPrice}
                onChange={(value) => handleChange('minPrice', value)}
                min={0}
                style={{ flex: 1 }}
              />
              <Text size="xs" c="dimmed">-</Text>
              <NumberInput
                size="xs"
                placeholder="Max"
                value={values.maxPrice}
                onChange={(value) => handleChange('maxPrice', value)}
                min={0}
                style={{ flex: 1 }}
              />
            </Group>
          </Box>

          {/* Clear Filters Button */}
          {activeCount > 0 && (
            <Button
              variant="subtle"
              size="xs"
              onClick={onClear}
              fullWidth
            >
              Clear All Filters
            </Button>
          )}
        </Stack>
      </Collapse>
    </Paper>
  );
}
