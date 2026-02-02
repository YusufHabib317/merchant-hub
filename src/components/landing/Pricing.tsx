import {
  Container, Title, Text, Box, Card, Stack, Button, List, Badge, Group, SimpleGrid,
} from '@mantine/core';
import { IconCheck, IconStar } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useAppRouter } from '@/lib/hooks/useAppRouter';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Up to 10 products',
      'Basic templates',
      'QR code generation',
      'Watermarked exports',
      'Community support',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: '$19',
    description: 'For growing businesses',
    features: [
      'Unlimited products',
      'All premium templates',
      'No watermarks',
      'Priority chat support',
      'Custom branding',
      'Analytics dashboard',
    ],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Enterprise',
    price: '$49',
    description: 'For established merchants',
    features: [
      'Everything in Pro',
      'Multiple team members',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
    ],
    cta: 'Contact Sales',
  },
];

export function Pricing() {
  const { toRegister } = useAppRouter();

  return (
    <Box py={80} bg="#f8f9fa">
      <Container size="lg">
        <Box ta="center" mb={60}>
          <Title order={2} size={42} fw={800} mb="md">
            Simple, Transparent Pricing
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              style={{ height: '100%' }}
            >
              <Card
                shadow={tier.popular ? 'xl' : 'sm'}
                padding="xl"
                radius="md"
                withBorder
                style={{
                  height: '100%',
                  position: 'relative',
                  border: tier.popular ? '2px solid #667eea' : undefined,
                }}
              >
                {tier.popular && (
                  <Badge
                    size="lg"
                    variant="gradient"
                    gradient={{ from: 'violet', to: 'grape' }}
                    leftSection={<IconStar size={14} />}
                    style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    Most Popular
                  </Badge>
                )}

                <Stack gap="md" h="100%">
                  <Box>
                    <Text size="xl" fw={700} mb={4}>
                      {tier.name}
                    </Text>
                    <Group gap={4} align="baseline">
                      <Text fw={900} lh={1} style={{ fontSize: 48 }}>
                        {tier.price}
                      </Text>
                      <Text size="sm" c="dimmed">
                        /month
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" mt="xs">
                      {tier.description}
                    </Text>
                  </Box>

                  <List
                    spacing="sm"
                    size="sm"
                    icon={(
                      <IconCheck
                        size={16}
                        style={{ color: tier.popular ? '#667eea' : '#51cf66' }}
                      />
                    )}
                    style={{ flex: 1 }}
                  >
                    {tier.features.map((feature) => (
                      <List.Item key={feature}>{feature}</List.Item>
                    ))}
                  </List>

                  <Button
                    size="md"
                    radius="md"
                    fullWidth
                    variant={tier.popular ? 'gradient' : 'light'}
                    gradient={tier.popular ? { from: 'violet', to: 'grape' } : undefined}
                    onClick={toRegister}
                  >
                    {tier.cta}
                  </Button>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>

        <Text size="sm" c="dimmed" ta="center" mt="xl">
          All plans include 14-day free trial. No credit card required.
        </Text>
      </Container>
    </Box>
  );
}
