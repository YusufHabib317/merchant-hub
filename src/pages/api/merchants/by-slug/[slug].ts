import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting (public endpoint for store pages)
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
    const { slug } = req.query;

    if (typeof slug !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid merchant slug',
      });
      return;
    }

    // Fetch merchant by slug - use select to only return public-facing fields
    // This prevents leaking internal data like userId, subscriptionTier, etc.
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      select: {
        // Only expose public merchant info
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        isChatEnabled: true,
        createdAt: true,
        // Include owner's public info only
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        // Include products with only public fields
        products: {
          where: { isPublished: true },
          select: {
            id: true,
            name: true,
            description: true,
            priceUSD: true,
            priceSYP: true,
            imageUrls: true,
            category: true,
            condition: true,
            // Explicitly exclude exchangeRate, stock, and other internal fields
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!merchant) {
      res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get merchant error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
