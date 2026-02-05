import {
  Modal, Text, Group, Button,
} from '@mantine/core';
import useTranslation from 'next-translate/useTranslation';

interface DeleteProductModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function DeleteProductModal({
  opened,
  onClose,
  onConfirm,
  loading,
}: DeleteProductModalProps) {
  const { t } = useTranslation('common');
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('delete_product_title')}
      centered
    >
      <Text mb="lg">
        {t('delete_product_confirm')}
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          color="red"
          onClick={onConfirm}
          loading={loading}
        >
          {t('delete')}
        </Button>
      </Group>
    </Modal>
  );
}
