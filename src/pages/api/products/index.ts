import { NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { ListProductsRequestSchema, CreateProductRequestSchema } from '@/schemas/api/products';
import { prisma } from '@/lib/prisma';
import { httpCode, DEFAULT_EXCHANGE_RATE } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { sanitizeProductInput, rateLimit, RATE_LIMITS } from '@/lib/security';

async function handleGetProducts(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validate query params
    const queryParams = ListProductsRequestSchema.parse(req.query);
    const {
      merchantId,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
    } = queryParams;

    // Build where clause
    const where: Prisma.ProductWhereInput = merchantId ? { merchantId } : {};

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
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(httpCode.SUCCESS).json({
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
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

async function handleCreateProduct(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Validate request body
    const input = CreateProductRequestSchema.parse(req.body);

    // Sanitize user inputs to prevent XSS
    const sanitizedInput = sanitizeProductInput(input);

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

    // Create product with sanitized data
    const product = await prisma.product.create({
      data: {
        ...sanitizedInput,
        merchantId: merchant.id,
        // Use merchant's custom exchange rate if provided, otherwise use default
        exchangeRate: sanitizedInput.exchangeRate || DEFAULT_EXCHANGE_RATE,
        priceSYP: sanitizedInput.priceSYP || sanitizedInput.priceUSD * (sanitizedInput.exchangeRate || DEFAULT_EXCHANGE_RATE),
      },
    });

    return res.status(httpCode.CREATED).json({
      success: true,
      data: product,
      message: 'Product created successfully',
    });
  } catch (error) {
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse): Promise<void> {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.api)) {
    return;
  }

  if (req.method === 'GET') {
    await handleGetProducts(req, res);
    return;
  }
  if (req.method === 'POST') {
    await handleCreateProduct(req, res);
    return;
  }

  const apiError = createApiError({ error: new Error('Method not allowed') });
  apiError.code = httpCode.METHOD_NOT_ALLOWED;
  apiError.message.key = 'methodNotAllowed';
  res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
}

export default withAuth(handler);
