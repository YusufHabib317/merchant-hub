import {
  Box,
  Container,
  Group,
  Button,
  ActionIcon,
  useMantineColorScheme,
  useComputedColorScheme,
  Burger,
  Drawer,
  Stack,
} from '@mantine/core';
import {
  IconSun,
  IconMoon,
  IconLogin,
  IconUserPlus,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useAppRouter } from '@/lib/hooks/useAppRouter';
import { authClient } from '@/lib/auth-client';
import useTranslation from 'next-translate/useTranslation';

interface LandingHeaderProps {
  activeSection?: string;
}

export function LandingHeader({ activeSection = 'home' }: LandingHeaderProps) {
  const { t } = useTranslation('common');
  const { toLogin, toRegister, toDashboard } = useAppRouter();
  const { data: session } = authClient.useSession();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setMobileMenuOpened(false); // Close mobile menu after navigation
    }
  };

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { label: t('nav.home'), id: 'home' },
    { label: t('nav.features'), id: 'features' },
    { label: t('nav.how_it_works'), id: 'how-it-works' },
    { label: t('nav.get_started'), id: 'cta' },
  ];

  const isDark = computedColorScheme === 'dark';

  const getBgColor = () => {
    if (!scrolled) {
      return isDark ? 'rgba(26, 27, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    }
    return isDark ? 'rgba(26, 27, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  };

  const getBorderColor = () => {
    if (!scrolled) return 'none';
    return isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)';
  };

  return (
    <Box
      component={motion.header}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: getBgColor(),
        backdropFilter: 'blur(10px)',
        borderBottom: getBorderColor(),
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container size="xl" px={{ base: 'md', sm: 'lg' }}>
        <Group h={{ base: 60, sm: 70 }} justify="space-between" wrap="nowrap">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="subtle"
              size="lg"
              fw={700}
              onClick={() => scrollToSection('home')}
              p={{ base: 'xs', sm: 'sm' }}
              style={{
                fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MerchantHub
            </Button>
          </motion.div>

          {/* Navigation Links */}
          <Group gap="xs" visibleFrom="lg">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'light' : 'subtle'}
                onClick={() => scrollToSection(item.id)}
                style={{
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </Button>
            ))}
          </Group>

          {/* Right Side Actions */}
          <Group gap="xs" wrap="nowrap">
            {/* Theme Toggle - Desktop */}
            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="lg"
              aria-label="Toggle color scheme"
              visibleFrom="sm"
            >
              {computedColorScheme === 'dark' ? (
                <IconSun size={20} />
              ) : (
                <IconMoon size={20} />
              )}
            </ActionIcon>

            {/* Language Switcher - Desktop */}
            <Box visibleFrom="sm">
              <LanguageSwitcher />
            </Box>

            {/* Auth Buttons - Desktop */}
            {session ? (
              <Button
                onClick={toDashboard}
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 45 }}
                leftSection={<IconUserPlus size={18} />}
                visibleFrom="sm"
                size="sm"
              >
                {t('nav.dashboard')}
              </Button>
            ) : (
              <>
                <Button
                  onClick={toLogin}
                  variant="default"
                  leftSection={<IconLogin size={18} />}
                  visibleFrom="md"
                  size="sm"
                >
                  {t('nav.login')}
                </Button>
                <Button
                  onClick={toRegister}
                  variant="gradient"
                  gradient={{ from: 'violet', to: 'grape', deg: 45 }}
                  leftSection={<IconUserPlus size={18} />}
                  visibleFrom="sm"
                  size="sm"
                >
                  {t('nav.sign_up')}
                </Button>
              </>
            )}

            {/* Mobile Menu Burger */}
            <Burger
              opened={mobileMenuOpened}
              onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
              hiddenFrom="lg"
              size="sm"
            />
          </Group>
        </Group>
      </Container>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={mobileMenuOpened}
        onClose={() => setMobileMenuOpened(false)}
        position="right"
        size="75%"
        title="Menu"
        hiddenFrom="lg"
      >
        <Stack gap="md">
          {/* Navigation Links */}
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? 'light' : 'subtle'}
              onClick={() => scrollToSection(item.id)}
              fullWidth
              justify="flex-start"
            >
              {item.label}
            </Button>
          ))}

          <Box my="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }} />

          {/* Theme Toggle */}
          <Button
            onClick={toggleColorScheme}
            variant="default"
            fullWidth
            leftSection={computedColorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
          >
            {computedColorScheme === 'dark' ? t('nav.light_mode') || 'Light Mode' : t('nav.dark_mode') || 'Dark Mode'}
          </Button>

          {/* Language Switcher Mobile */}
          <LanguageSwitcher />

          <Box my="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }} />

          {/* Auth Buttons */}
          {session ? (
            <Button
              onClick={() => {
                toDashboard();
                setMobileMenuOpened(false);
              }}
              variant="gradient"
              gradient={{ from: 'violet', to: 'grape', deg: 45 }}
              leftSection={<IconUserPlus size={18} />}
              fullWidth
            >
              {t('nav.dashboard')}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  toLogin();
                  setMobileMenuOpened(false);
                }}
                variant="default"
                leftSection={<IconLogin size={18} />}
                fullWidth
              >
                {t('nav.login')}
              </Button>
              <Button
                onClick={() => {
                  toRegister();
                  setMobileMenuOpened(false);
                }}
                variant="gradient"
                gradient={{ from: 'violet', to: 'grape', deg: 45 }}
                leftSection={<IconUserPlus size={18} />}
                fullWidth
              >
                {t('nav.sign_up')}
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </Box>
  );
}
