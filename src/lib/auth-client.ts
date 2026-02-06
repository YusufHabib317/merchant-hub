import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000',
  plugins: [emailOTPClient()],
});

// Export commonly used hooks and methods
export const { useSession, signIn, signUp, signOut } = authClient;

// Type exports
export type Session = typeof authClient.$Infer.Session;
export type User = (typeof authClient.$Infer.Session)['user'];
