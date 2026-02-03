import {
  Title, Stack, Card, Text, Button, Group, Center, Loader, Box, Paper, Grid,
  CopyButton, ActionIcon, Tooltip, Alert,
} from '@mantine/core';
import {
  IconDownload, IconCopy, IconCheck, IconAlertCircle,
} from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useMyMerchant } from '@/lib/hooks/useMerchants';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

export default function QRCodePage() {
  const { toSettings } = useAppRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: merchant, isLoading, error } = useMyMerchant();

  const storeUrl = merchant
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/m/${merchant.slug}`
    : '';

  useEffect(() => {
    if (storeUrl && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, storeUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      }).then(() => {
        setQrDataUrl(canvasRef.current?.toDataURL('image/png') || null);
      });
    }
  }, [storeUrl]);

  const handleDownload = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `${merchant?.slug || 'store'}-qr-code.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Stack gap="lg">
          <Title order={1}>QR Code</Title>

          <Text c="dimmed">
            Share your store QR code with customers so they can easily access your products.
          </Text>

          {isLoading && (
            <Center py="xl">
              <Loader />
            </Center>
          )}

          {!isLoading && (error || !merchant) && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="No Store Found"
              color="yellow"
              variant="light"
            >
              <Stack gap="md">
                <Text size="sm">
                  You need to create a store before you can generate a QR code.
                  Go to Settings to set up your merchant profile.
                </Text>
                <Button
                  onClick={toSettings}
                  variant="filled"
                  color="blue"
                  size="sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  Go to Settings
                </Button>
              </Stack>
            </Alert>
          )}

          {!isLoading && merchant && (
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder padding="xl" radius="md">
                  <Stack align="center" gap="lg">
                    <Text fw={600} size="lg">
                      {merchant?.name || 'Your Store'}
                    </Text>

                    <Box
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <canvas ref={canvasRef} />
                    </Box>

                    <Box w="100%" maw={400}>
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
                      <Button
                        leftSection={<IconDownload size={16} />}
                        onClick={handleDownload}
                        disabled={!qrDataUrl}
                      >
                        Download QR Code
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder padding="lg" radius="md">
                  <Title order={4} mb="sm">
                    How to use your QR Code
                  </Title>
                  <Stack gap="xs">
                    <Text size="sm">1. Download the QR code image above</Text>
                    <Text size="sm">
                      2. Print it on flyers, business cards, or display it in your store
                    </Text>
                    <Text size="sm">
                      3. Customers can scan the code to view your products and chat with you
                    </Text>
                  </Stack>

                  <Title order={4} mt="lg" mb="sm">
                    Best Practices
                  </Title>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                      • Use a high-contrast design for better scanning
                    </Text>
                    <Text size="sm" c="dimmed">
                      • Test the QR code before printing
                    </Text>
                    <Text size="sm" c="dimmed">
                      • Place QR codes at eye level
                    </Text>
                    <Text size="sm" c="dimmed">
                      • Include instructions near the QR code
                    </Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          )}
        </Stack>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
