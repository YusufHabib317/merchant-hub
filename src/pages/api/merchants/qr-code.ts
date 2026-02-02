import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth/middleware';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import QRCode from 'qrcode';

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.api)) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ success: false, error: 'Invalid merchant ID' });
    return;
  }

  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      res.status(404).json({ success: false, error: 'Merchant not found' });
      return;
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const storeUrl = `${appUrl}/m/${merchant.slug}`;

    const qrCodeDataUrl = await QRCode.toDataURL(storeUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeDataUrl,
        storeUrl,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          slug: merchant.slug,
        },
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to generate QR code' });
  }
}

export default withAuth(handler);
