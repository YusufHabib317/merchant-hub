/* eslint-disable no-nested-ternary */
import {
  Text, Card, Group, Stack, ThemeIcon, Box,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export interface TemplateOption {
  value: string;
  label: string;
  description: string;
  preview: string;
}

interface TemplateSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TEMPLATES: TemplateOption[] = [
  {
    value: 'elegant',
    label: 'Elegant',
    description: 'Premium card layout (best for sharing)',
    preview: 'light',
  },
  {
    value: 'price-list',
    label: 'List',
    description: 'Category tables (best for printing)',
    preview: 'table',
  },
];

export function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  return (
    <Stack gap="sm">
      <Text fw={600} size="sm">
        Choose Template
      </Text>
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {TEMPLATES.map((template) => (
          <Card
            key={template.value}
            onClick={() => onChange(template.value)}
            style={{
              cursor: 'pointer',
              border: value === template.value ? '2px solid #228be6' : '1px solid #e9ecef',
              backgroundColor: value === template.value ? '#e7f5ff' : 'white',
              transition: 'all 0.2s ease',
            }}
            padding="sm"
            radius="md"
          >
            <Group gap="sm" wrap="nowrap">
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 4,
                  backgroundColor:
                    template.preview === 'dark'
                      ? '#1a1a2e'
                      : template.preview === 'gradient'
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : template.preview === 'table'
                          ? '#333'
                          : '#f8f9fa',
                }}
              />
              <Box style={{ flex: 1 }}>
                <Group justify="space-between" wrap="nowrap">
                  <Text size="sm" fw={500}>
                    {template.label}
                  </Text>
                  {value === template.value && (
                    <ThemeIcon size="sm" radius="xl" color="blue">
                      <IconCheck size={12} />
                    </ThemeIcon>
                  )}
                </Group>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {template.description}
                </Text>
              </Box>
            </Group>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
