import {
  Title, Stack, Card, Text, Button, Group, Center, Loader, Box, Paper, Grid,
  CopyButton, ActionIcon, Tooltip, Alert,
} from '@mantine/core';
import {
  IconDownload, IconCopy, IconCheck, IconAlertCircle,
} from '@tabler/icons-react';
import { useEffect, useState, useRef } from 'react';
import useTranslation from 'next-translate/useTranslation';
import QRCode from 'qrcode';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useMyMerchant } from '@/lib/hooks/useMerchants';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

function StoreQRCanvas({ url, onGenerated }: { url: string; onGenerated: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (url && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then(() => {
          if (canvasRef.current) {
            onGenerated(canvasRef.current.toDataURL('image/png'));
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error('QR Generation error', err);
        });
    }
  }, [url, onGenerated]);

  return <canvas ref={canvasRef} />;
}

export default function QRCodePage() {
  const { t } = useTranslation('common');
  const { toSettings } = useAppRouter();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const { data: merchant, isLoading, error } = useMyMerchant();

  const storeUrl = merchant
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/m/${merchant.slug}`
    : '';

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
          <Title order={1}>{t('qr_code_page.title')}</Title>

          <Text c="dimmed">
            {t('qr_code_page.description')}
          </Text>

          {isLoading && (
            <Center py="xl">
              <Loader />
            </Center>
          )}

          {!isLoading && (error || !merchant) && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title={t('qr_code_page.no_store_title')}
              color="yellow"
              variant="light"
            >
              <Stack gap="md">
                <Text size="sm">
                  {t('qr_code_page.no_store_message')}
                </Text>
                <Button
                  onClick={toSettings}
                  variant="filled"
                  color="blue"
                  size="sm"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {t('qr_code_page.go_to_settings')}
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
                      {merchant?.name || t('qr_code_page.your_store')}
                    </Text>

                    <Box
                      style={{
                        padding: '16px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                    >
                      <StoreQRCanvas url={storeUrl} onGenerated={setQrDataUrl} />
                    </Box>

                    <Box w="100%" maw={400}>
                      <Text size="sm" fw={500} mb="xs">
                        {t('qr_code_page.store_url')}
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
                            <Tooltip label={copied ? t('qr_code_page.copy_tooltip_copied') : t('qr_code_page.copy_tooltip')}>
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
                        {t('qr_code_page.download_button')}
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder padding="lg" radius="md">
                  <Title order={4} mb="sm">
                    {t('qr_code_page.how_to_use_title')}
                  </Title>
                  <Stack gap="xs">
                    <Text size="sm">{t('qr_code_page.step_1')}</Text>
                    <Text size="sm">
                      {t('qr_code_page.step_2')}
                    </Text>
                    <Text size="sm">
                      {t('qr_code_page.step_3')}
                    </Text>
                  </Stack>

                  <Title order={4} mt="lg" mb="sm">
                    {t('qr_code_page.best_practices_title')}
                  </Title>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                      {t('qr_code_page.practice_1')}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t('qr_code_page.practice_2')}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t('qr_code_page.practice_3')}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {t('qr_code_page.practice_4')}
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
