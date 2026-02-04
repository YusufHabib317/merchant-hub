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

    // Fetch merchant by slug
    const merchant = await prisma.merchant.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
        products: {
          select: {
            id: true,
            name: true,
            description: true,
            priceUSD: true,
            priceSYP: true,
            imageUrls: true,
            category: true,
            // Explicitly exclude exchangeRate from public API
            // exchangeRate: false, // Not needed, just don't select it
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
