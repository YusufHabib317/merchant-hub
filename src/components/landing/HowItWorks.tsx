import {
  Container, Title, Text, Box, Stack, Group, ThemeIcon,
} from '@mantine/core';
import {
  IconNumber1, IconNumber2, IconNumber3, IconNumber4,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface Step {
  number: React.ReactNode;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: <IconNumber1 size={32} />,
    title: 'Create Your Account',
    description: 'Sign up in seconds. No credit card required to get started.',
  },
  {
    number: <IconNumber2 size={32} />,
    title: 'Add Your Products',
    description: 'Upload product images, set prices in USD and SYP, add descriptions.',
  },
  {
    number: <IconNumber3 size={32} />,
    title: 'Share Your Store',
    description: 'Generate QR codes, export beautiful catalogs, share on social media.',
  },
  {
    number: <IconNumber4 size={32} />,
    title: 'Chat with Customers',
    description: 'Respond to inquiries in real-time. AI assistant helps when you&apos;re busy.',
  },
];

export function HowItWorks() {
  return (
    <Box py={80} bg="white">
      <Container size="lg">
        <Box ta="center" mb={60}>
          <Title order={2} size={42} fw={800} mb="md">
            How It Works
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Get your online store up and running in 4 simple steps
          </Text>
        </Box>

        <Stack gap={40}>
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Group
                gap="xl"
                align="flex-start"
                wrap="nowrap"
                style={{
                  flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                }}
              >
                <ThemeIcon
                  size={80}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'grape', deg: 45 }}
                  style={{ flexShrink: 0 }}
                >
                  {step.number}
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Title order={3} size="h3" mb="xs">
                    {step.title}
                  </Title>
                  <Text size="lg" c="dimmed" style={{ lineHeight: 1.6 }}>
                    {step.description}
                  </Text>
                </Box>
              </Group>
            </motion.div>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}
