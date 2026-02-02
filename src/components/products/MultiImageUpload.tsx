import {
  Box,
  Image,
  Text,
  ActionIcon,
  Progress,
  Paper,
  Stack,
  ThemeIcon,
  SimpleGrid,
  Group,
} from '@mantine/core';
import {
  IconUpload, IconX, IconPhoto,
} from '@tabler/icons-react';
import { useState } from 'react';
import { UploadButton } from '@uploadthing/react';
import type { UploadRouter } from '@/lib/uploadthing';

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  maxImages?: number;
  required?: boolean;
}

export function MultiImageUpload({
  value,
  onChange,
  onError = undefined,
  disabled = false,
  maxImages = 3,
  required = false,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleRemove = (indexToRemove: number) => {
    const newUrls = value.filter((_, index) => index !== indexToRemove);
    onChange(newUrls);
  };

  const canUploadMore = value.length < maxImages;

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Product Images
          {required && <Text component="span" c="red"> *</Text>}
        </Text>
        <Text size="xs" c="dimmed">
          {value.length}
          {' '}
          /
          {maxImages}
          {' '}
          images
        </Text>
      </Group>

      {value.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
          {value.map((url, index) => (
            <Paper
              key={url}
              withBorder
              radius="md"
              p="xs"
              pos="relative"
              style={{ overflow: 'hidden' }}
            >
              <Box pos="relative">
                <Image
                  src={url}
                  alt={`Product image ${index + 1}`}
                  h={150}
                  fit="contain"
                  radius="sm"
                />
                <ActionIcon
                  pos="absolute"
                  top={4}
                  right={4}
                  color="red"
                  variant="filled"
                  size="sm"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                >
                  <IconX size={14} />
                </ActionIcon>
                {index === 0 && (
                  <Box
                    pos="absolute"
                    bottom={4}
                    left={4}
                  >
                    <Text size="xs" fw={600} c="blue" bg="white" px={6} py={2} style={{ borderRadius: 4 }}>
                      Primary
                    </Text>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </SimpleGrid>
      )}

      {canUploadMore && (
        <Paper
          withBorder
          radius="md"
          p="xl"
          style={{ cursor: disabled ? 'not-allowed' : 'default' }}
        >
          {isUploading ? (
            <Stack align="center" gap="md">
              <ThemeIcon size={48} radius="xl" variant="light" color="blue">
                <IconUpload size={24} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">Uploading...</Text>
              <Progress value={progress} w="100%" size="sm" animated />
            </Stack>
          ) : (
            <Stack align="center" gap="md">
              <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                <IconPhoto size={24} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" ta="center">
                Click below to upload
                {' '}
                {value.length === 0 ? 'images' : 'more images'}
              </Text>
              <UploadButton<UploadRouter, 'productImage'>
                endpoint="productImage"
                onUploadBegin={() => {
                  setIsUploading(true);
                  setProgress(0);
                }}
                onUploadProgress={(p) => {
                  setProgress(p);
                }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  setProgress(100);
                  if (res && res.length > 0) {
                    const newUrls = res.map((file) => file.url);
                    onChange([...value, ...newUrls]);
                  }
                }}
                onUploadError={(err) => {
                  setIsUploading(false);
                  setProgress(0);
                  onError?.(err.message);
                }}
                disabled={disabled || !canUploadMore}
                appearance={{
                  button: {
                    backgroundColor: 'var(--mantine-color-blue-6)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                  },
                  allowedContent: {
                    display: 'none',
                  },
                }}
              />
              <Text size="xs" c="dimmed">
                PNG, JPG up to 4MB each • Max
                {maxImages}
                {' '}
                images
              </Text>
            </Stack>
          )}
        </Paper>
      )}
    </Stack>
  );
}
