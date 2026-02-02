import {
  Box,
  Image,
  Text,
  ActionIcon,
  Progress,
  Paper,
  Stack,
  ThemeIcon,
} from '@mantine/core';
import {
  IconUpload, IconX, IconCheck, IconPhoto,
} from '@tabler/icons-react';
import { useState } from 'react';
import { UploadButton } from '@uploadthing/react';
import type { UploadRouter } from '@/lib/uploadthing';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  endpoint?: keyof UploadRouter;
}

export function ImageUpload({
  value,
  onChange,
  onError = undefined,
  disabled = false,
  required = false,
  label = 'Product Image',
  endpoint = 'productImage',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleRemove = () => {
    onChange('');
    setUploadSuccess(false);
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        {label}
        {required && <Text component="span" c="red"> *</Text>}
      </Text>
      {value ? (
        <Paper
          withBorder
          radius="md"
          p="xs"
          pos="relative"
          style={{ overflow: 'hidden' }}
        >
          <Box pos="relative">
            <Image
              src={value}
              alt="Product preview"
              h={200}
              fit="contain"
              radius="sm"
            />
            {uploadSuccess && (
              <Box
                pos="absolute"
                top={8}
                left={8}
              >
                <ThemeIcon color="green" size="md" radius="xl">
                  <IconCheck size={14} />
                </ThemeIcon>
              </Box>
            )}
            <ActionIcon
              pos="absolute"
              top={8}
              right={8}
              color="red"
              variant="filled"
              size="sm"
              radius="xl"
              onClick={handleRemove}
              disabled={disabled}
            >
              <IconX size={14} />
            </ActionIcon>
          </Box>
        </Paper>
      ) : (
        <Paper
          withBorder
          radius="md"
          p="xl"
          style={{
            borderStyle: 'dashed',
            backgroundColor: 'var(--mantine-color-gray-0)',
          }}
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
                Click below to upload an image
              </Text>
              <UploadButton<UploadRouter, typeof endpoint>
                endpoint={endpoint}
                onUploadBegin={() => {
                  setIsUploading(true);
                  setProgress(0);
                  setUploadSuccess(false);
                }}
                onUploadProgress={(p) => {
                  setProgress(p);
                }}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  setProgress(100);
                  const url = res?.[0]?.url;
                  if (url) {
                    onChange(url);
                    setUploadSuccess(true);
                  }
                }}
                onUploadError={(err) => {
                  setIsUploading(false);
                  setProgress(0);
                  onError?.(err.message);
                }}
                disabled={disabled}
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
              <Text size="xs" c="dimmed">PNG, JPG up to 4MB</Text>
            </Stack>
          )}
        </Paper>
      )}
    </Stack>
  );
}
