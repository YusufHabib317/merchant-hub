import {
  Group,
  TextInput,
  Select,
  SegmentedControl,
  Box,
} from '@mantine/core';
import { IconSearch, IconLayoutGrid, IconList } from '@tabler/icons-react';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';

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
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch] = useDebouncedValue(search, 500);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <Group justify="space-between" mb="lg">
      <TextInput
        placeholder="Search products..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        style={{ flex: 1, maxWidth: 300 }}
      />

      <Group>
        <Select
          placeholder="Sort by"
          value={initialSort}
          onChange={(value) => onSortChange(value || 'createdAt')}
          data={[
            { value: 'createdAt', label: 'Date Added' },
            { value: 'name', label: 'Name' },
            { value: 'priceUSD', label: 'Price' },
          ]}
          w={150}
        />

        <SegmentedControl
          value={initialSortOrder}
          onChange={(value) => onSortOrderChange(value as 'asc' | 'desc')}
          data={[
            { label: 'Asc', value: 'asc' },
            { label: 'Desc', value: 'desc' },
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
