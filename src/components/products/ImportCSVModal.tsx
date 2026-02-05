import {
  Modal,
  Button,
  Text,
  Stack,
  Group,
  FileInput,
  Alert,
  List,
  Paper,
  Code,
} from '@mantine/core';
import {
  IconUpload,
  IconAlertCircle,
  IconCheck,
  IconDownload,
} from '@tabler/icons-react';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { CSV_HEADERS, downloadCSV } from '@/utils/csv';

interface ImportCSVModalProps {
  opened: boolean;
  onClose: () => void;
}

interface ImportResult {
  created: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export function ImportCSVModal({ opened, onClose }: ImportCSVModalProps) {
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  const importMutation = useMutation({
    mutationFn: async (csvContent: string) => {
      const response = await apiClient.post('/products/import-csv', { csvContent });
      return response.data;
    },
    onSuccess: (data) => {
      setResult(data.data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleImport = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importMutation.mutate(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const templateContent = `${CSV_HEADERS.join(',')}\n`
      + 'Example Product,Product description,99.99,1499850,15000,Electronics,10,true,tag1;tag2,NEW,https://example.com/image.jpg';
    downloadCSV(templateContent, 'products-template.csv');
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    importMutation.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={t('import_csv_title')}
      size="lg"
    >
      <Stack gap="md">
        {!result ? (
          <>
            <Text size="sm" c="dimmed">
              {t('import_csv_description')}
            </Text>

            <Paper withBorder p="sm" bg="gray.0">
              <Text size="xs" fw={500} mb="xs">
                {t('csv_columns')}
                :
              </Text>
              <Code block style={{ fontSize: '11px' }}>
                {CSV_HEADERS.join(', ')}
              </Code>
            </Paper>

            <Button
              variant="subtle"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownloadTemplate}
              size="xs"
            >
              {t('download_template')}
            </Button>

            <FileInput
              label={t('select_csv_file')}
              placeholder={t('click_to_select_file')}
              accept=".csv,text/csv"
              value={file}
              onChange={setFile}
              leftSection={<IconUpload size={16} />}
            />

            {importMutation.isError && (
              <Alert color="red" icon={<IconAlertCircle size={16} />}>
                {importMutation.error instanceof Error
                  ? importMutation.error.message
                  : t('import_failed')}
              </Alert>
            )}

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button
                onClick={handleImport}
                loading={importMutation.isPending}
                disabled={!file}
                leftSection={<IconUpload size={16} />}
              >
                {t('import')}
              </Button>
            </Group>
          </>
        ) : (
          <>
            <Alert
              color={result.failed === 0 ? 'green' : 'yellow'}
              icon={result.failed === 0 ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
              title={t('import_complete')}
            >
              {t('import_result', { created: result.created, failed: result.failed })}
            </Alert>

            {result.errors.length > 0 && (
              <Paper withBorder p="sm">
                <Text size="sm" fw={500} mb="xs">
                  {t('import_errors')}
                  :
                </Text>
                <List size="xs" spacing="xs">
                  {result.errors.slice(0, 10).map((err) => (
                    <List.Item key={err.row}>
                      {t('row')}
                      {' '}
                      {err.row}
                      :
                      {' '}
                      {err.error}
                    </List.Item>
                  ))}
                  {result.errors.length > 10 && (
                    <List.Item>
                      ...
                      {t('and_more', { count: result.errors.length - 10 })}
                    </List.Item>
                  )}
                </List>
              </Paper>
            )}

            <Group justify="flex-end" mt="md">
              <Button onClick={handleClose}>
                {t('close')}
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
