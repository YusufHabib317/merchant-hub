import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@uploadthing/react/styles.css';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AppProps } from 'next/app';
import { Roboto, Tajawal } from 'next/font/google';
import { theme } from '../theme';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () => new QueryClient({
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
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          ...theme,
          fontFamily: `${roboto.style.fontFamily}, ${tajawal.style.fontFamily}, sans-serif`,
          headings: {
            fontFamily: `${roboto.style.fontFamily}, ${tajawal.style.fontFamily}, sans-serif`,
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
          <Component {...pageProps} />
        </div>
      </MantineProvider>
    </QueryClientProvider>
  );
}
