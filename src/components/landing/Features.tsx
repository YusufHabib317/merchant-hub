import { Container, Title, Text, SimpleGrid, Card, ThemeIcon, Stack, Box } from '@mantine/core';
import {
  IconTemplate,
  IconQrcode,
  IconMessageCircle,
  IconCurrencyDollar,
  IconShare,
  IconSparkles,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

interface Feature {
  icon: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <IconTemplate size={28} />,
    titleKey: 'features.feature1_title',
    descriptionKey: 'features.feature1_desc',
    color: 'blue',
  },
  {
    icon: <IconQrcode size={28} />,
    titleKey: 'features.feature2_title',
    descriptionKey: 'features.feature2_desc',
    color: 'violet',
  },
  {
    icon: <IconMessageCircle size={28} />,
    titleKey: 'features.feature3_title',
    descriptionKey: 'features.feature3_desc',
    color: 'teal',
  },
  {
    icon: <IconCurrencyDollar size={28} />,
    titleKey: 'features.feature4_title',
    descriptionKey: 'features.feature4_desc',
    color: 'green',
  },
  {
    icon: <IconShare size={28} />,
    titleKey: 'features.feature5_title',
    descriptionKey: 'features.feature5_desc',
    color: 'orange',
  },
  {
    icon: <IconSparkles size={28} />,
    titleKey: 'features.feature6_title',
    descriptionKey: 'features.feature6_desc',
    color: 'pink',
  },
];

export function Features() {
  const { t } = useTranslation('common');

  return (
    <Box id="features" py={80} bg="#f8f9fa">
      <Container size="lg">
        <Box ta="center" mb={60}>
          <Title order={2} size={42} fw={800} mb="md">
            {t('features.title')}
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            {t('features.subtitle')}
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
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
                      {t(feature.titleKey)}
                    </Title>
                    <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                      {t(feature.descriptionKey)}
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
