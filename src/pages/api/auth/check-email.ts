import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { rateLimit, RATE_LIMITS } from '@/lib/security/rate-limit';

const CheckEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting to prevent abuse
  if (!rateLimit(req, res, RATE_LIMITS.auth)) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validationResult = CheckEmailSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.format(),
      });
    }

    const { email } = validationResult.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Only select id to minimize data exposure
    });

    return res.status(200).json({
      exists: !!user,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error checking email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
