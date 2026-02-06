import { Group, TextInput, Select, SegmentedControl, Box } from '@mantine/core';
import { IconSearch, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import useTranslation from 'next-translate/useTranslation';

export type ViewMode = 'grid' | 'table';

interface ProductViewControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: string) => void;
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  initialSearch?: string;
  initialSort?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export function ProductViewControls({
  viewMode,
  onViewModeChange,
  onSearchChange,
  onSortChange,
  onSortOrderChange,
  initialSearch = '',
  initialSort = 'createdAt',
  initialSortOrder = 'desc',
}: ProductViewControlsProps) {
  const { t } = useTranslation('common');
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    // Skip the initial mount to prevent resetting page on load
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    onSearchChange(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <Group justify="space-between" mb="lg">
      <TextInput
        placeholder={t('search_products_placeholder')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        style={{ flex: 1, maxWidth: 300 }}
      />

      <Group>
        <Select
          placeholder={t('sort_by')}
          value={initialSort}
          onChange={(value) => onSortChange(value || 'createdAt')}
          data={[
            { value: 'createdAt', label: t('date_added') },
            { value: 'name', label: t('name') },
            { value: 'priceUSD', label: t('price') },
          ]}
          w={150}
        />

        <SegmentedControl
          value={initialSortOrder}
          onChange={(value) => onSortOrderChange(value as 'asc' | 'desc')}
          data={[
            { label: t('asc'), value: 'asc' },
            { label: t('desc'), value: 'desc' },
          ]}
        />

        <SegmentedControl
          value={viewMode}
          onChange={(value) => onViewModeChange(value as ViewMode)}
          data={[
            {
              value: 'grid',
              label: (
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <IconLayoutGrid size={16} />
                </Box>
              ),
            },
            {
              value: 'table',
              label: (
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                  <IconList size={16} />
                </Box>
              ),
            },
          ]}
        />
      </Group>
    </Group>
  );
}
