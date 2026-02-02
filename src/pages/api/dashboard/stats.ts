import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.read)) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    // Get merchant for this user
    const merchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id },
    });

    if (!merchant) {
      res.status(403).json({
        success: false,
        error: 'Merchant profile not found',
      });
      return;
    }

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { merchantId: merchant.id },
    });

    // Get total chat sessions
    const totalChats = await prisma.chatSession.count({
      where: { merchantId: merchant.id },
    });

    // Get total messages (as a proxy for views/interactions)
    const totalMessages = await prisma.message.count({
      where: {
        session: {
          merchantId: merchant.id,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalChats,
        totalViews: totalMessages,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

export default withAuth(handler);
