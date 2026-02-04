import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Get locale from cookie
 */
export function getLocaleFromCookie(request: NextRequest): string | undefined {
  return request.cookies.get(LOCALE_COOKIE_NAME)?.value;
}

/**
 * Set locale cookie in response
 */
export function setLocaleCookie(response: NextResponse, locale: string): void {
  response.cookies.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

/**
 * Client-side function to set locale cookie
 */
export function setLocaleClientCookie(locale: string): void {
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

/**
 * Client-side function to get locale cookie
 */
export function getLocaleClientCookie(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find((cookie) => {
    const [name] = cookie.trim().split('=');
    return name === LOCALE_COOKIE_NAME;
  });

  if (localeCookie) {
    const [, value] = localeCookie.trim().split('=');
    return value;
  }

  return null;
}
