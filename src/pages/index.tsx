import { Box } from '@mantine/core';
import {
  Hero, Features, HowItWorks, CallToAction,
} from '@/components/landing';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { useState, useEffect } from 'react';

export default function IndexPage() {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'how-it-works', 'cta'];
      const scrollPosition = window.scrollY + 100; // Offset for header

      const currentSection = sections.find((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          return scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box>
      <LandingHeader activeSection={activeSection} />
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
    </Box>
  );
}
