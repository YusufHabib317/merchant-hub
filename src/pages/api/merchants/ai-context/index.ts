import { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { validateAIContext, sanitizeBasic } from '@/lib/security';

const CreateContextSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000),
  tags: z.array(z.string()).optional().default([]),
});

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Get merchant ID from user
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user.id },
  });

  if (!merchant) {
    return res.status(404).json({ success: false, error: 'Merchant not found' });
  }

  if (req.method === 'GET') {
    try {
      // @ts-ignore - Prisma client might not be regenerated yet
      const contexts = await prisma.merchantContext.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({ success: true, data: contexts });
    } catch {
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const input = CreateContextSchema.parse(req.body);

      // Content filtering
      const validation = validateAIContext(input.content);
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

      // Sanitize content
      const sanitizedContent = sanitizeBasic(input.content);

      // @ts-ignore - Prisma client might not be regenerated yet
      const context = await prisma.merchantContext.create({
        data: {
          merchantId: merchant.id,
          content: sanitizedContent,
          tags: input.tags,
        },
      });

      return res.status(201).json({ success: true, data: context });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ success: false, error: 'Validation error', details: error.issues });
      }
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

export default withAuth(handler);
