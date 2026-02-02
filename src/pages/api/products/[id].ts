import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { UpdateProductRequestSchema } from '@/schemas/api/products';
import { prisma } from '@/lib/prisma';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { sanitizeProductInput, rateLimit, RATE_LIMITS } from '@/lib/security';

const PRODUCT_NOT_FOUND_ERROR = 'Product not found';
const PRODUCT_NOT_OWNED_ERROR = 'You do not own this product';

// Helper to return product not found error
const returnProductNotFound = (res: NextApiResponse) => {
  const apiError = createApiError({ error: new Error('notFound') });
  apiError.message.fallback = PRODUCT_NOT_FOUND_ERROR;
  apiError.message.key = 'productNotFound';
  return res.status(httpCode.NOT_FOUND).json(apiError);
};

// Helper to return forbidden error
const returnForbiddenError = (res: NextApiResponse) => {
  const apiError = createApiError({ error: new Error('forbidden') });
  apiError.message.fallback = PRODUCT_NOT_OWNED_ERROR;
  apiError.message.key = 'forbidden';
  return res.status(httpCode.FORBIDDEN).json(apiError);
};

async function handleGetProduct(id: string, res: NextApiResponse) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return returnProductNotFound(res);
    }

    return res.status(httpCode.SUCCESS).json({
      success: true,
      data: product,
    });
  } catch (error) {
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

async function handleUpdateProduct(
  id: string,
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    // Validate request body
    const input = UpdateProductRequestSchema.parse(req.body);

    // Sanitize user inputs to prevent XSS
    const sanitizedInput = sanitizeProductInput(input);

    // Get product
    const product = await prisma.product.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!product) {
      return returnProductNotFound(res);
    }

    // Check merchant ownership
    if (product.merchant.userId !== req.user.id) {
      return returnForbiddenError(res);
    }

    // Update product with sanitized data
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...sanitizedInput,
        // Use the provided exchange rate or keep the existing one
        exchangeRate: sanitizedInput.exchangeRate !== undefined ? sanitizedInput.exchangeRate : product.exchangeRate,
        // Calculate priceSYP using the exchange rate (new or existing)
        priceSYP: sanitizedInput.priceSYP || (sanitizedInput.priceUSD
          ? sanitizedInput.priceUSD * (sanitizedInput.exchangeRate || product.exchangeRate)
          : undefined),
      },
    });

    return res.status(httpCode.SUCCESS).json({
      success: true,
      data: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

async function handleDeleteProduct(
  id: string,
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    // Get product
    const product = await prisma.product.findUnique({
      where: { id },
      include: { merchant: true },
    });

    if (!product) {
      return returnProductNotFound(res);
    }

    // Check merchant ownership
    if (product.merchant.userId !== req.user.id) {
      return returnForbiddenError(res);
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    return res.status(httpCode.SUCCESS).json({
      success: true,
      message: 'Product deleted successfully',
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

  const { id } = req.query;

  if (typeof id !== 'string') {
    const apiError = createApiError({ error: new Error('Invalid product ID') });
    apiError.code = httpCode.BAD_REQUEST;
    apiError.message.key = 'validationError';
    res.status(httpCode.BAD_REQUEST).json(apiError);
    return;
  }

  if (req.method === 'GET') {
    await handleGetProduct(id, res);
    return;
  }
  if (req.method === 'PUT') {
    await handleUpdateProduct(id, req, res);
    return;
  }
  if (req.method === 'DELETE') {
    await handleDeleteProduct(id, req, res);
    return;
  }

  const apiError = createApiError({ error: new Error('Method not allowed') });
  apiError.code = httpCode.METHOD_NOT_ALLOWED;
  apiError.message.key = 'methodNotAllowed';
  res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
}

export default withAuth(handler);
