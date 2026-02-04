import {
  Container, Title, Text, Button, Group, Box,
} from '@mantine/core';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { authClient } from '@/lib/auth-client';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

export function Hero() {
  const { toRegister, toLogin, toDashboard } = useAppRouter();
  const { data: session } = authClient.useSession();

  return (
    <Box
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)',
        }}
        animate={{
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Box ta="center" py={80}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Group justify="center" mb="md">
              <IconSparkles size={32} color="white" />
            </Group>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Title
              order={1}
              size={56}
              fw={900}
              c="white"
              mb="xl"
              style={{
                lineHeight: 1.2,
                textShadow: '0 2px 20px rgba(0,0,0,0.2)',
              }}
            >
              Showcase Your Products
              <br />
              <Text
                component="span"
                inherit
                variant="gradient"
                gradient={{ from: 'yellow', to: 'orange', deg: 45 }}
              >
                Beautifully
              </Text>
            </Title>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Text
              size="xl"
              c="white"
              mb={40}
              maw={700}
              mx="auto"
              style={{
                opacity: 0.95,
                lineHeight: 1.6,
              }}
            >
              Create stunning product catalogs, generate QR codes, and chat with customers in
              real-time. Everything you need to grow your business online.
            </Text>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
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
                Get Started Free
              </Button>
              <Button
                size="xl"
                radius="xl"
                variant="outline"
                c="white"
                style={{
                  borderColor: 'white',
                  borderWidth: 2,
                }}
                onClick={session ? toDashboard : toLogin}
              >
                {session ? 'Go to Dashboard' : 'Sign In'}
              </Button>
            </Group>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Text size="sm" c="white" mt="xl">
              No credit card required • Free forever plan available
            </Text>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
