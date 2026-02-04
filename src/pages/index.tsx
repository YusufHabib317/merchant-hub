import { Box } from '@mantine/core';
import {
  Hero,
  Features,
  HowItWorks,
  CallToAction,
} from '@/components/landing';

export default function IndexPage() {
  return (
    <Box>
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
    </Box>
  );
}
