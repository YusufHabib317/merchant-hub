import {
  Container, Title, Text, SimpleGrid, Card, ThemeIcon, Stack, Box,
} from '@mantine/core';
import {
  IconTemplate,
  IconQrcode,
  IconMessageCircle,
  IconCurrencyDollar,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <IconTemplate size={28} />,
    title: 'Beautiful Templates',
    description: 'Choose from 6 professionally designed templates to showcase your products perfectly.',
    color: 'blue',
  },
  {
    icon: <IconQrcode size={28} />,
    title: 'QR Code Generator',
    description: 'Generate QR codes instantly for your store. Perfect for print materials and physical locations.',
    color: 'violet',
  },
  {
    icon: <IconMessageCircle size={28} />,
    title: 'Live Chat',
    description: 'Chat with customers in real-time. AI assistant helps when you&apos;re away.',
    color: 'teal',
  },
  {
    icon: <IconCurrencyDollar size={28} />,
    title: 'Dual Currency',
    description: 'Display prices in both USD and SYP. Automatic conversion with custom rates.',
    color: 'green',
  },
  {
    icon: <IconShare size={28} />,
    title: 'Easy Sharing',
    description: 'Export products as images and share directly to social media platforms.',
    color: 'orange',
  },
  {
    icon: <IconSparkles size={28} />,
    title: 'No Code Required',
    description: 'Simple, intuitive interface. Get your store online in minutes, not days.',
    color: 'pink',
  },
];

export function Features() {
  return (
    <Box py={80} bg="#f8f9fa">
      <Container size="lg">
        <Box ta="center" mb={60}>
          <Title order={2} size={42} fw={800} mb="md">
            Everything You Need to Succeed
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Powerful features designed to help merchants showcase products and connect with customers
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{ height: '100%' }}
            >
              <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
                <Stack gap="md">
                  <ThemeIcon size={60} radius="md" variant="light" color={feature.color}>
                    {feature.icon}
                  </ThemeIcon>
                  <Box>
                    <Title order={3} size="h4" mb="xs">
                      {feature.title}
                    </Title>
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Text>
                  </Box>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
}
