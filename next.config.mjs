/** @type {import('next').NextConfig} */
import nextTranslate from 'next-translate-plugin';

const chatServerUrl = process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:9001';
const chatServerWsUrl = chatServerUrl.replace('https://', 'wss://').replace('http://', 'ws://');
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,

  // Security headers
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy - prevents XSS and other injection attacks
          // Production: remove 'unsafe-eval' for better security
          // Development: allow 'unsafe-eval' for React DevTools and HMR
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // In production, we avoid 'unsafe-eval' for better XSS protection
              // 'unsafe-inline' is still needed for inline styles from Mantine
              isProduction
                ? "script-src 'self' 'unsafe-inline' https://uploadthing.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://uploadthing.com",
              "style-src 'self' 'unsafe-inline'",
              // Restrict images to HTTPS only in production
              isProduction
                ? "img-src 'self' data: blob: https:"
                : "img-src 'self' data: blob: https: http:",
              "font-src 'self' data:",
              `connect-src 'self' https://uploadthing.com https://*.uploadthing.com wss://*.uploadthing.com https://api.uploadthing.com ${chatServerUrl} ${chatServerWsUrl}`,
              "frame-ancestors 'self'",
              "form-action 'self'",
              "base-uri 'self'",
              "object-src 'none'",
            ].join('; '),
          },
          // HTTPS enforcement - tells browsers to only use HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Stricter headers for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

export default nextTranslate(nextConfig);
