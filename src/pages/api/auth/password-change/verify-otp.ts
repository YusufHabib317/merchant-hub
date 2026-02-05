import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { VerifyPasswordChangeOTPSchema } from '@/schemas/api/password';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// eslint-disable-next-line sonarjs/cognitive-complexity
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    const validationResult = VerifyPasswordChangeOTPSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.format(),
      });
    }

    const { token, otp, newPassword } = validationResult.data;

    // Retrieve our custom verification record to validate the token
    const verification = await prisma.verification.findUnique({
      where: { id: token },
    });

    if (!verification) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    if (new Date(verification.expiresAt) < new Date()) {
      await prisma.verification.delete({ where: { id: token } });
      return res.status(400).json({ error: 'Token expired. Please request a new one.' });
    }

    // Security check: Ensure the token belongs to the current user
    if (verification.identifier !== session.user.email) {
      return res.status(403).json({ error: 'Forbidden: User mismatch' });
    }

    // Use Better Auth's emailOTP resetPassword API which handles OTP verification internally
    // This verifies the OTP and updates the password in one step
    const resetResult = await auth.api.resetPasswordEmailOTP({
      body: {
        email: session.user.email,
        otp,
        password: newPassword,
      },
    });

    if (!resetResult?.success) {
      return res.status(401).json({ error: 'Invalid OTP or password reset failed' });
    }

    // Delete our custom verification token
    await prisma.verification.delete({ where: { id: token } }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Verify password change OTP error:', error);

    // Check if it's an OTP-related error from Better Auth
    if (error instanceof Error) {
      if (error.message.includes('INVALID_OTP') || error.message.includes('OTP')) {
        return res.status(401).json({ error: 'Invalid OTP' });
      }
      if (error.message.includes('TOO_MANY_ATTEMPTS')) {
        return res.status(429).json({ error: 'Too many attempts. Please request a new OTP.' });
      }
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
}
