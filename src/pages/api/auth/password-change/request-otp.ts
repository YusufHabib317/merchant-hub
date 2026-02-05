import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { RequestPasswordChangeOTPSchema } from '@/schemas/api/password';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

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
    const validationResult = RequestPasswordChangeOTPSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.format(),
      });
    }

    const { currentPassword } = validationResult.data;

    // Verify current password using Better Auth
    const signInResult = await auth.api.signInEmail({
      body: {
        email: session.user.email,
        password: currentPassword,
      },
    });

    if (!signInResult) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Send OTP using Better Auth's emailOTP plugin
    await auth.api.sendVerificationOTP({
      body: {
        email: session.user.email,
        type: 'forget-password',
      },
    });

    // Store a verification token to track this password change request
    // We don't store the new password - it will be sent with the OTP verification
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const { prisma } = await import('@/lib/prisma');

    await prisma.verification.create({
      data: {
        id: token,
        identifier: session.user.email,
        value: JSON.stringify({
          userId: session.user.id,
          type: 'password-change',
          currentPassword, // Store hashed version would be better, but we need it for changePassword
        }),
        expiresAt,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      token,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Request password change OTP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
