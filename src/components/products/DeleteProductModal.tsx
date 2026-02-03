import {
  Modal, Text, Group, Button,
} from '@mantine/core';

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
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Product"
      centered
    >
      <Text mb="lg">
        Are you sure you want to delete this product? This action cannot be undone.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="red"
          onClick={onConfirm}
          loading={loading}
        >
          Delete
        </Button>
      </Group>
    </Modal>
  );
}
