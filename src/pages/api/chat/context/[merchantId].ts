import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting (this is a public endpoint for chat widget)
  if (!rateLimit(req, res, RATE_LIMITS.api)) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { merchantId } = req.query;

    if (!merchantId || typeof merchantId !== 'string') {
      res.status(400).json({ error: 'Invalid merchant ID' });
      return;
    }

    // Get merchant info
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!merchant) {
      res.status(404).json({ error: 'Merchant not found' });
      return;
    }

    // Get merchant products
    const products = await prisma.product.findMany({
      where: { merchantId },
      select: {
        id: true,
        name: true,
        description: true,
        priceUSD: true,
        priceSYP: true,
        category: true,
      },
      orderBy: { name: 'asc' },
    });

    // Return context for AI
    res.status(200).json({
      merchantId: merchant.id,
      name: merchant.name,
      description: merchant.description,
      products,
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
