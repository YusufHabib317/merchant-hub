import { NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import { AdminProductsResponse, AdminProductItem } from '@/types/admin';

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
    // Parse query parameters
    const { page = '1', limit = '20', search, isPublished } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    // Build where clause
    const where: Prisma.ProductWhereInput = {};

    // Search filter (case-insensitive on name)
    if (search && typeof search === 'string') {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Published filter
    if (isPublished !== undefined && typeof isPublished === 'string') {
      if (isPublished === 'true') {
        where.isPublished = true;
      } else if (isPublished === 'false') {
        where.isPublished = false;
      }
    }

    // Fetch total count
    const total = await prisma.product.count({ where });

    // Fetch products with pagination and include merchant name
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        priceUSD: true,
        isPublished: true,
        createdAt: true,
        merchant: {
          select: {
            name: true,
          },
        },
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    // Map products to flat structure with merchantName
    const productItems: AdminProductItem[] = products.map((product) => ({
      id: product.id,
      name: product.name,
      priceUSD: product.priceUSD,
      isPublished: product.isPublished,
      merchantName: product.merchant.name,
      createdAt: product.createdAt,
    }));

    const response: AdminProductsResponse = {
      products: productItems,
      total,
      page: pageNum,
      limit: limitNum,
    };

    res.status(httpCode.SUCCESS).json({
      success: true,
      data: response,
    });
  } catch (error) {
    const apiError = createApiError({ error });
    res.status(apiError.code).json(apiError);
  }
}

export default withRole(['ADMIN'], handler);
