import { NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { sanitizeMerchantInput, rateLimit, RATE_LIMITS } from '@/lib/security';

const ListMerchantsRequestSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const CreateMerchantSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(200),
  description: z.string().max(2000).optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  address: z.string().optional(),
});

async function handleCreateMerchant(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const input = CreateMerchantSchema.parse(req.body);

    // Sanitize user inputs to prevent XSS
    const sanitizedInput = sanitizeMerchantInput(input);

    const existingMerchant = await prisma.merchant.findUnique({
      where: { userId: req.user.id },
    });

    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        error: 'Merchant profile already exists',
      });
    }

    const slug = `${sanitizedInput.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;

    const merchant = await prisma.merchant.create({
      data: {
        userId: req.user.id,
        name: sanitizedInput.name,
        slug,
        description: sanitizedInput.description,
        logoUrl: input.logoUrl, // URL is validated by Zod, not sanitized
        address: sanitizedInput.address,
      },
    });

    return res.status(201).json({
      success: true,
      data: merchant,
      message: 'Merchant created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.issues,
      });
    }
    // eslint-disable-next-line no-console
    console.error('Create merchant error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.api)) {
    return;
  }

  if (req.method === 'GET') {
    try {
      // Validate query params
      const queryParams = ListMerchantsRequestSchema.parse(req.query);
      const { page, limit } = queryParams;

      // Fetch total count
      const total = await prisma.merchant.count();

      // Fetch merchants with pagination
      const merchants = await prisma.merchant.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: { products: true },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        success: true,
        data: {
          merchants,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      });
      return;
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues,
        });
        return;
      }

      // eslint-disable-next-line no-console
      console.error('Get merchants error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
      return;
    }
  }
  if (req.method === 'POST') {
    await handleCreateMerchant(req, res);
    return;
  }
  res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
}

export default withAuth(handler);
