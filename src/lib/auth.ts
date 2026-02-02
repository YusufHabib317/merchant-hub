import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession } from 'better-auth/plugins';
import { prisma } from './prisma';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

// Define auth options separately to enable proper type inference in customSession
const authOptions = {
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    autoSignUpCallback: async (user: AuthUser) => {
      // Create merchant profile when user signs up
      try {
        const slug = user.email.split('@')[0].toLowerCase();
        await prisma.merchant.create({
          data: {
            userId: user.id,
            name: user.name || 'My Store',
            slug: `${slug}-${Date.now().toString(36)}`,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to create merchant profile:', error);
      }
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
      // TODO: Implement email sending (e.g., using SendGrid, Resend, etc.)
      // eslint-disable-next-line no-console
      console.log(`Verification email would be sent to ${user.email}: ${url}`);
    },
    autoSignUpCallback: async (user: AuthUser) => {
      // User is automatically verified on signup
      // eslint-disable-next-line no-console
      console.log(`User ${user.email} email verified`);
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 5, // 5 days - balanced security and UX
    updateAge: 60 * 60 * 24, // 1 day - refresh session daily
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  appName: 'MerchantHub',
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000',
  user: {
    additionalFields: {
      role: {
        type: 'string' as const,
        defaultValue: 'MERCHANT',
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
};

export const auth = betterAuth({
  ...authOptions,
  plugins: [
    customSession(async ({ user, session }) => ({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      session: {
        expiresAt: session.expiresAt,
      },
    }), authOptions),
  ],
});
