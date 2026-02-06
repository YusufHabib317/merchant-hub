import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import { calculateSYPPrice } from '@/utils/exchangeRate';
import {
  ApplyExchangeRateRequestSchema,
  type ApplyExchangeRateRequest,
  type ApplyExchangeRateResponse,
} from '@/schemas/api/exchangeRate';

// Re-export types for consumers of this API
export type { ApplyExchangeRateRequest, ApplyExchangeRateResponse };

/**
 * POST /api/products/exchange-rate
 *
 * Applies an exchange rate to selected products, calculating new SYP prices.
 *
 * Requirements satisfied:
 * - 3.1: Calculate priceSYP = priceUSD × exchangeRate
 * - 3.2: Update priceSYP field for all selected products
 * - 3.3: Store exchange rate value on each updated product record
 * - 4.1: Persist exchange rate value associated with merchant
 * - 5.1: Store original SYP price before update (only if originalPriceSYP is null)
 */
async function handleApplyExchangeRate(
  req: AuthenticatedRequest,
  res: NextApiResponse<ApplyExchangeRateResponse | ReturnType<typeof createApiError>>
) {
  try {
    // Validate request body
    const validationResult = ApplyExchangeRateRequestSchema.safeParse(req.body);

    if (!validationResult.success) {
      const apiError = createApiError({ error: validationResult.error });
      return res.status(httpCode.BAD_REQUEST).json(apiError);
    }

    const { exchangeRate, productIds } = validationResult.data;

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

    // Verify all products belong to this merchant
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

    // Update products with new exchange rate and calculated SYP prices
    // Using a transaction with increased timeout for bulk operations
    const updatedProducts = await prisma.$transaction(
      async (tx) => {
        // Update merchant's default exchange rate (Requirement 4.1)
        await tx.merchant.update({
          where: { id: merchant.id },
          data: { defaultExchangeRate: exchangeRate },
        });

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

        for (let i = 0; i < products.length; i += BATCH_SIZE) {
          const batch = products.slice(i, i + BATCH_SIZE);
          const batchPromises = batch.map(async (product) => {
            const newPriceSYP = calculateSYPPrice(product.priceUSD, exchangeRate);

            // Store original SYP price only if it's null (Requirement 5.1)
            const originalPriceSYP =
              product.originalPriceSYP === null ? product.priceSYP : product.originalPriceSYP;

            return tx.product.update({
              where: { id: product.id },
              data: {
                priceSYP: newPriceSYP,
                exchangeRate,
                originalPriceSYP,
              },
              select: {
                id: true,
                name: true,
                priceUSD: true,
                priceSYP: true,
                exchangeRate: true,
                originalPriceSYP: true,
              },
            });
          });

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
        updatedCount: updatedProducts.length,
        products: updatedProducts,
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
    await handleApplyExchangeRate(req, res);
    return;
  }

  const apiError = createApiError({ error: new Error('Method not allowed') });
  apiError.code = httpCode.METHOD_NOT_ALLOWED;
  apiError.message.key = 'methodNotAllowed';
  res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
}

export default withAuth(handler);
