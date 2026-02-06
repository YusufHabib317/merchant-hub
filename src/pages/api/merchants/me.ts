import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.read)) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { session } = req as any;
  if (!session?.user?.id) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    });

    if (!merchant) {
      res.status(404).json({ success: false, error: 'Merchant not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: merchant.id,
        slug: merchant.slug,
        name: merchant.name,
        description: merchant.description,
        logoUrl: merchant.logoUrl,
        address: merchant.address,
        isChatEnabled: merchant.isChatEnabled,
        subscriptionTier: merchant.subscriptionTier,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

export default withAuth(handler);
