import {
  Container, Title, Text, Button, Box, Group,
} from '@mantine/core';
import { IconArrowRight, IconRocket } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

export function CallToAction() {
  const { toRegister } = useAppRouter();

  return (
    <Box
      py={100}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
        }}
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Group justify="center" mb="lg">
            <IconRocket size={48} color="white" />
          </Group>

          <Title order={2} size={48} fw={900} c="white" mb="xl">
            Ready to Grow Your Business?
          </Title>

          <Text size="xl" c="white" mb={40} style={{ opacity: 0.95 }}>
            Join thousands of merchants already using MerchantHub to showcase their products and
            connect with customers.
          </Text>

          <Group justify="center" gap="md">
            <Button
              size="xl"
              radius="xl"
              color="white"
              c="violet"
              rightSection={<IconArrowRight size={20} />}
              onClick={toRegister}
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Start Free Today
            </Button>
          </Group>

          <Text size="sm" c="white" mt="xl" style={{ opacity: 0.8 }}>
            No credit card required • Cancel anytime
          </Text>
        </motion.div>
      </Container>
    </Box>
  );
}
