import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@uploadthing/react/styles.css';
import Head from 'next/head';
import { MantineProvider, DirectionProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AppProps } from 'next/app';
import { Roboto, Cairo } from 'next/font/google';
import { useRouter } from 'next/router';
import { getLocaleClientCookie, setLocaleClientCookie } from '@/lib/locale';
import ErrorBoundary from '@/components/ErrorBoundary';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

const cairo = Cairo({
  subsets: ['latin', 'arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  useEffect(() => {
    const cookieLocale = getLocaleClientCookie();
    const currentLocale = router.locale;

    if (cookieLocale && cookieLocale !== currentLocale) {
      router.push(router.pathname, router.asPath, { locale: cookieLocale });
    } else if (currentLocale) {
      setLocaleClientCookie(currentLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const dir = router.locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = router.locale || 'en';
  }, [router.locale]);

  const dir = router.locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider initialDirection={dir} detectDirection={false}>
        <MantineProvider
          defaultColorScheme="light"
          theme={{
            fontFamily: `${cairo.style.fontFamily}, ${roboto.style.fontFamily}, sans-serif`,
            headings: {
              fontFamily: `${cairo.style.fontFamily}, ${roboto.style.fontFamily}, sans-serif`,
            },
          }}
        >
          <Notifications position="top-right" />
          <Head>
            <title>MerchantHub</title>
            <meta
              name="viewport"
              content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
            />
            <link rel="shortcut icon" href="/favicon.svg" />
          </Head>
          <div
            style={{
              maxWidth: '1920px',
              margin: '0 auto',
              position: 'relative',
              transform: 'translate(0)',
              minHeight: '100vh',
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </div>
        </MantineProvider>
      </DirectionProvider>
    </QueryClientProvider>
  );
}
