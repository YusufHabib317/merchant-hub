import {
  Paper,
  Text,
  Stack,
  Group,
  Box,
  Button,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconDownload, IconRefresh, IconCopy, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { QRCodeGenerator } from './QRCodeGenerator';

export interface QRCodePreviewProps {
  qrDataUrl: string | null;
  storeUrl: string;
  merchantName: string;
  onDownload: () => void;
  onRegenerate: () => void;
}

export function QRCodePreview({
  qrDataUrl,
  storeUrl,
  merchantName,
  onDownload,
  onRegenerate,
}: QRCodePreviewProps) {
  const [canvasValue] = useState<string>(storeUrl);

  return (
    <Stack gap="lg" align="center">
      <Text fw={600} size="lg">
        {merchantName}
      </Text>

      <Paper
        p="md"
        style={{
          backgroundColor: 'white',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Box
          style={{
            padding: 8,
            backgroundColor: 'white',
            borderRadius: 8,
          }}
        >
          <QRCodeGenerator value={canvasValue} size={250} margin={2} onGenerate={() => {}} />
        </Box>
      </Paper>

      <Box w="100%" maw={350}>
        <Text size="sm" fw={500} mb="xs">
          Store URL
        </Text>
        <Group gap={4}>
          <Paper
            p="xs"
            radius="md"
            style={{
              flex: 1,
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
            }}
          >
            <Text size="sm" lineClamp={1} style={{ fontFamily: 'monospace' }}>
              {storeUrl}
            </Text>
          </Paper>
          <CopyButton value={storeUrl}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied!' : 'Copy URL'}>
                <ActionIcon
                  color={copied ? 'teal' : 'gray'}
                  onClick={copy}
                  variant="light"
                  size="lg"
                >
                  {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        </Group>
      </Box>

      <Group>
        <Button leftSection={<IconDownload size={16} />} onClick={onDownload} disabled={!qrDataUrl}>
          Download
        </Button>
        <Button variant="light" leftSection={<IconRefresh size={16} />} onClick={onRegenerate}>
          Regenerate
        </Button>
      </Group>
    </Stack>
  );
}
