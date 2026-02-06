import { Container, Title, Text, Box, Stack, Group, ThemeIcon } from '@mantine/core';
import { IconNumber1, IconNumber2, IconNumber3, IconNumber4 } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import useTranslation from 'next-translate/useTranslation';

interface Step {
  number: React.ReactNode;
  titleKey: string;
  descriptionKey: string;
}

const steps: Step[] = [
  {
    number: <IconNumber1 size={32} />,
    titleKey: 'how_it_works.step1_title',
    descriptionKey: 'how_it_works.step1_desc',
  },
  {
    number: <IconNumber2 size={32} />,
    titleKey: 'how_it_works.step2_title',
    descriptionKey: 'how_it_works.step2_desc',
  },
  {
    number: <IconNumber3 size={32} />,
    titleKey: 'how_it_works.step3_title',
    descriptionKey: 'how_it_works.step3_desc',
  },
  {
    number: <IconNumber4 size={32} />,
    titleKey: 'how_it_works.step4_title',
    descriptionKey: 'how_it_works.step4_desc',
  },
];

export function HowItWorks() {
  const { t } = useTranslation('common');

  return (
    <Box id="how-it-works" py={80} bg="white">
      <Container size="lg">
        <Box ta="center" mb={60}>
          <Title order={2} size={42} fw={800} mb="md">
            {t('how_it_works.title')}
          </Title>
          <Text size="lg" c="dimmed" maw={600} mx="auto">
            {t('how_it_works.subtitle')}
          </Text>
        </Box>

        <Stack gap={40}>
          {steps.map((step, index) => (
            <motion.div
              key={step.titleKey}
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
                    {t(step.titleKey)}
                  </Title>
                  <Text size="lg" c="dimmed" style={{ lineHeight: 1.6 }}>
                    {t(step.descriptionKey)}
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
