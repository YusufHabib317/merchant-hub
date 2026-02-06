import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { customSession, emailOTP } from 'better-auth/plugins';
import { prisma } from './prisma';
import { sendPasswordResetEmail, sendOTPEmail } from './email';

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
    sendOnSignUp: false, // We use OTP instead
    autoSignIn: false, // Don't auto sign in, require OTP verification first
    sendResetPasswordEmail: async ({
      user,
      url,
    }: {
      user: { email: string; name?: string };
      url: string;
    }) => {
      try {
        await sendPasswordResetEmail(user.email, url);
        // eslint-disable-next-line no-console
        console.log(`Password reset email sent to ${user.email}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to send password reset email:', error);
      }
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 3, // 3 days - security-focused session duration
    updateAge: 60 * 60 * 12, // 12 hours - refresh session twice daily
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
    emailOTP({
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      async sendVerificationOTP({ email, otp, type }) {
        try {
          await sendOTPEmail(email, otp, type);
          // eslint-disable-next-line no-console
          console.log(`OTP email sent to ${email} for ${type}`);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to send OTP email:', error);
          throw error;
        }
      },
    }),
    customSession(
      async ({ user, session }) => ({
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
      }),
      authOptions
    ),
  ],
});
