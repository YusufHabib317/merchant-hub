import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { setLocaleClientCookie } from '@/lib/locale';

export function CompactLanguageSwitcher() {
  const { lang, t } = useTranslation('common');
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    const { pathname, asPath, query } = router;
    // Save locale to cookie
    setLocaleClientCookie(locale);
    // Navigate to the new locale
    router.push({ pathname, query }, asPath, { locale });
  };

  return (
    <Menu shadow="md" width={150} position="bottom-end">
      <Menu.Target>
        <Tooltip label={t('language')}>
          <ActionIcon variant="subtle" size="lg" aria-label="Change language">
            <IconLanguage size={20} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('language')}</Menu.Label>
        <Menu.Item
          onClick={() => changeLanguage('en')}
          style={{
            backgroundColor: lang === 'en' ? 'var(--mantine-color-blue-light)' : undefined,
            fontWeight: lang === 'en' ? 600 : 400,
          }}
        >
          English
        </Menu.Item>
        <Menu.Item
          onClick={() => changeLanguage('ar')}
          style={{
            backgroundColor: lang === 'ar' ? 'var(--mantine-color-blue-light)' : undefined,
            fontWeight: lang === 'ar' ? 600 : 400,
          }}
        >
          العربية
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
