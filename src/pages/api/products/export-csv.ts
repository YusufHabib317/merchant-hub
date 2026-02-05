import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { productsToCSV } from '@/utils/csv';
import createApiError from '@/lib/api/createApiError';
import { httpCode } from '@/lib/constants';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    const apiError = createApiError({ error: new Error('Method not allowed') });
    apiError.code = httpCode.METHOD_NOT_ALLOWED;
    return res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
  }

  try {
    // Get merchant for this user
    const merchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id },
    });

    if (!merchant) {
      const apiError = createApiError({ error: new Error('forbidden') });
      apiError.message.fallback = 'Merchant profile not found';
      apiError.message.key = 'merchantNotFound';
      return res.status(httpCode.FORBIDDEN).json(apiError);
    }

    // Get all products for this merchant
    const products = await prisma.product.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to CSV
    const csvContent = productsToCSV(products);

    // Set headers for file download
    const filename = `products-${merchant.slug}-${Date.now()}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    return res.status(200).send(csvContent);
  } catch (error) {
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

export default withAuth(handler);
