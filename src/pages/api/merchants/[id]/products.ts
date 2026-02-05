import { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import { ListProductsRequestSchema } from '@/schemas/api/products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting (public endpoint)
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
    const { id } = req.query;

    if (typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid merchant ID',
      });
      return;
    }

    // Validate query params
    // We override merchantId in the schema validation with the one from the URL
    const queryParams = ListProductsRequestSchema.parse({
      ...req.query,
      merchantId: id,
    });

    const {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    } = queryParams;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      merchantId: id,
      isPublished: true, // Only show published products on public page
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Fetch total count
    const total = await prisma.product.count({ where });

    // Fetch products with pagination
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        description: true,
        priceUSD: true,
        priceSYP: true,
        imageUrls: true,
        category: true,
        isPublished: true,
        createdAt: true,
        // Exclude internal fields
      },
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get merchant products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
