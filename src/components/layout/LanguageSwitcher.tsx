import { Menu, Button } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import { setLocaleClientCookie } from '@/lib/locale';

export function LanguageSwitcher() {
  const { lang, t } = useTranslation('common');
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    const { pathname, asPath, query } = router;
    setLocaleClientCookie(locale);
    router.push({ pathname, query }, asPath, { locale });
  };

  return (
    <Menu shadow="md" width={200}>
      <Menu.Target>
        <Button
          variant="subtle"
          leftSection={<IconLanguage size={18} />}
          style={{ textTransform: 'uppercase' }}
        >
          {lang}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t('language')}</Menu.Label>
        <Menu.Item
          onClick={() => changeLanguage('en')}
          style={{
            backgroundColor: lang === 'en' ? 'var(--mantine-color-blue-light)' : undefined,
          }}
        >
          {t('english')}
        </Menu.Item>
        <Menu.Item
          onClick={() => changeLanguage('ar')}
          style={{
            backgroundColor: lang === 'ar' ? 'var(--mantine-color-blue-light)' : undefined,
          }}
        >
          {t('arabic')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
