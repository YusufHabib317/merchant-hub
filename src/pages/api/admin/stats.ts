import { NextApiResponse } from 'next';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import { AdminStats } from '@/types/admin';

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.read)) {
    return;
  }

  if (req.method !== 'GET') {
    const apiError = createApiError({ error: new Error('Method not allowed') });
    apiError.code = httpCode.METHOD_NOT_ALLOWED;
    apiError.message.key = 'methodNotAllowed';
    res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
    return;
  }

  try {
    // Query platform statistics
    const [totalUsers, totalMerchants, totalProducts, totalChatSessions] = await Promise.all([
      prisma.user.count(),
      prisma.merchant.count(),
      prisma.product.count(),
      prisma.chatSession.count(),
    ]);

    const stats: AdminStats = {
      totalUsers,
      totalMerchants,
      totalProducts,
      totalChatSessions,
    };

    res.status(httpCode.SUCCESS).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const apiError = createApiError({ error });
    res.status(apiError.code).json(apiError);
  }
}

export default withRole(['ADMIN'], handler);
