import { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { validateAIContext, sanitizeBasic } from '@/lib/security';

const UpdateContextSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000).optional(),
  tags: z.array(z.string()).optional(),
});

async function handlePut(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string,
) {
  try {
    const input = UpdateContextSchema.parse(req.body);

    const data: Record<string, unknown> = {};

    if (input.content) {
      // Content filtering
      const validation = validateAIContext(input.content);
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }
      data.content = sanitizeBasic(input.content);
    }

    if (input.tags) {
      data.tags = input.tags;
    }

    // @ts-ignore
    const updatedContext = await prisma.merchantContext.update({
      where: { id },
      data,
    });

    return res.status(200).json({ success: true, data: updatedContext });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
    }
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handleDelete(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  id: string,
) {
  try {
    // @ts-ignore
    await prisma.merchantContext.delete({
      where: { id },
    });

    return res.status(200).json({ success: true, message: 'Context deleted successfully' });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid ID' });
  }

  // Get merchant ID from user
  const merchant = await prisma.merchant.findUnique({
    where: { userId: req.user.id },
  });

  if (!merchant) {
    return res.status(404).json({ success: false, error: 'Merchant not found' });
  }

  // @ts-ignore
  const existingContext = await prisma.merchantContext.findUnique({
    where: { id },
  });

  if (!existingContext) {
    return res.status(404).json({ success: false, error: 'Context not found' });
  }

  if (existingContext.merchantId !== merchant.id) {
    return res.status(403).json({ success: false, error: 'Forbidden' });
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, id);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

export default withAuth(handler);
