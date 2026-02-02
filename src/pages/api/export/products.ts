import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

interface ExportRequestBody {
  productIds?: string[];
  template?: string;
  format?: 'png' | 'jpg';
}

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting (sensitive operation)
  if (!rateLimit(req, res, RATE_LIMITS.sensitive)) {
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { session } = (req as any);
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

    const { productIds, template = 'classic' }: ExportRequestBody = req.body;

    let products;
    if (productIds && productIds.length > 0) {
      products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          merchantId: merchant.id,
        },
      });
    } else {
      products = await prisma.product.findMany({
        where: { merchantId: merchant.id },
        take: 50,
      });
    }

    const hasWatermark = merchant.subscriptionTier === 'FREE';

    const exportData = {
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceUSD: p.priceUSD,
        priceSYP: p.priceSYP,
        imageUrls: p.imageUrls,
        category: p.category,
      })),
      merchantName: merchant.name,
      template,
      watermark: hasWatermark,
    };

    res.status(200).json({ success: true, data: exportData });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to generate export data' });
  }
}

export default withAuth(handler);
