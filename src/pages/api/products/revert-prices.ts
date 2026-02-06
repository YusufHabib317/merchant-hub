import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import {
  RevertPricesRequestSchema,
  type RevertPricesRequest,
  type RevertPricesResponse,
} from '@/schemas/api/exchangeRate';

// Re-export types for consumers of this API
export type { RevertPricesRequest, RevertPricesResponse };

/**
 * POST /api/products/revert-prices
 *
 * Reverts selected products to their original SYP prices.
 *
 * Requirements satisfied:
 * - 5.3: Restore each selected product's priceSYP to its stored original value
 * - 5.4: Clear the stored original price (set originalPriceSYP to null) after reversion
 */
async function handleRevertPrices(
  req: AuthenticatedRequest,
  res: NextApiResponse<RevertPricesResponse | ReturnType<typeof createApiError>>
) {
  try {
    // Validate request body
    const validationResult = RevertPricesRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      const apiError = createApiError({ error: validationResult.error });
      return res.status(httpCode.BAD_REQUEST).json(apiError);
    }

    const { productIds } = validationResult.data;

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

    // Verify all products belong to this merchant and have original prices
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        merchantId: merchant.id,
      },
    });

    if (products.length !== productIds.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missingIds = productIds.filter((id) => !foundIds.has(id));
      const apiError = createApiError({ error: new Error('notFound') });
      apiError.message.fallback = `Products not found or not owned by merchant: ${missingIds.join(
        ', '
      )}`;
      apiError.message.key = 'productsNotFound';
      return res.status(httpCode.NOT_FOUND).json(apiError);
    }

    // Filter products that have original prices to revert
    const productsWithOriginalPrice = products.filter((p) => p.originalPriceSYP !== null);

    if (productsWithOriginalPrice.length === 0) {
      const apiError = createApiError({ error: new Error('noOriginalPrices') });
      apiError.message.fallback = 'None of the selected products have original prices to revert';
      apiError.message.key = 'noOriginalPrices';
      return res.status(httpCode.BAD_REQUEST).json(apiError);
    }

    // Revert products to original prices using a transaction with increased timeout
    const revertedProducts = await prisma.$transaction(
      async (tx) => {
        // Batch update products in chunks to avoid timeout
        const BATCH_SIZE = 50;
        const results: Array<{
          id: string;
          name: string;
          priceUSD: number;
          priceSYP: number;
          exchangeRate: number;
          originalPriceSYP: number | null;
        }> = [];

        for (let i = 0; i < productsWithOriginalPrice.length; i += BATCH_SIZE) {
          const batch = productsWithOriginalPrice.slice(i, i + BATCH_SIZE);
          // Requirement 5.3: Restore priceSYP to originalPriceSYP
          // Requirement 5.4: Clear originalPriceSYP after reversion
          const batchPromises = batch.map(async (product) =>
            tx.product.update({
              where: { id: product.id },
              data: {
                priceSYP: product.originalPriceSYP!, // We know it's not null from filter
                originalPriceSYP: null,
              },
              select: {
                id: true,
                name: true,
                priceUSD: true,
                priceSYP: true,
                exchangeRate: true,
                originalPriceSYP: true,
              },
            })
          );

          // eslint-disable-next-line no-await-in-loop -- Intentional sequential batching to avoid DB overload
          const batchResults = await Promise.all(batchPromises);
          results.push(...batchResults);
        }

        return results;
      },
      {
        timeout: 30000, // 30 seconds for bulk operations
      }
    );

    return res.status(httpCode.SUCCESS).json({
      success: true,
      data: {
        revertedCount: revertedProducts.length,
        products: revertedProducts,
      },
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

  if (req.method === 'POST') {
    await handleRevertPrices(req, res);
    return;
  }

  const apiError = createApiError({ error: new Error('Method not allowed') });
  apiError.code = httpCode.METHOD_NOT_ALLOWED;
  apiError.message.key = 'methodNotAllowed';
  res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
}

export default withAuth(handler);
