import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession } from 'better-auth/plugins';
import { prisma } from './prisma';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from './email';

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
    sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
      try {
        await sendVerificationEmail(user.email, url);
        // eslint-disable-next-line no-console
        console.log(`Verification email sent to ${user.email}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send verification email:', error);
        // Don't throw error to prevent blocking signup flow
      }
    },
    autoSignUpCallback: async (user: AuthUser) => {
      // Send welcome email after email verification
      try {
        await sendWelcomeEmail(user.email, user.name);
        // eslint-disable-next-line no-console
        console.log(`Welcome email sent to ${user.email}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send welcome email:', error);
      }
    },
    sendResetPasswordEmail: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
      try {
        await sendPasswordResetEmail(user.email, url);
        // eslint-disable-next-line no-console
        console.log(`Password reset email sent to ${user.email}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send password reset email:', error);
        // Don't throw error to prevent blocking password reset flow
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days - balanced security and UX
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
