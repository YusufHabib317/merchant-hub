import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { csvToProducts, CSVProduct } from '@/utils/csv';
import createApiError from '@/lib/api/createApiError';
import { httpCode, DEFAULT_EXCHANGE_RATE } from '@/lib/constants';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

// Disable body parser to handle raw text
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};

interface ImportResult {
  created: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

interface ProductCreateResult {
  success: boolean;
  row: number;
  error?: string;
}

/**
 * Create a single product from CSV data
 */
async function createProductFromCSV(
  merchantId: string,
  product: CSVProduct,
  rowIndex: number,
): Promise<ProductCreateResult> {
  try {
    const exchangeRate = product.exchangeRate || DEFAULT_EXCHANGE_RATE;
    const priceSYP = product.priceSYP || product.priceUSD * exchangeRate;

    await prisma.product.create({
      data: {
        merchantId,
        name: product.name,
        description: product.description || null,
        priceUSD: product.priceUSD,
        priceSYP,
        exchangeRate,
        category: product.category || null,
        stock: product.stock || 0,
        isPublished: product.isPublished ?? true,
        tags: product.tags ? product.tags.split(';').filter(Boolean) : [],
        condition: (product.condition as 'NEW' | 'USED' | 'REFURBISHED') || 'NEW',
        imageUrls: product.imageUrls ? product.imageUrls.split(';').filter(Boolean) : [],
      },
    });

    return { success: true, row: rowIndex };
  } catch (createError) {
    return {
      success: false,
      row: rowIndex,
      error: createError instanceof Error ? createError.message : 'Unknown error',
    };
  }
}

/**
 * Parse and validate CSV content
 */
function parseAndValidateCSV(csvContent: string): CSVProduct[] {
  return csvToProducts(csvContent);
}

/**
 * Build response message for import result
 */
function buildResponseMessage(created: number, failed: number): string {
  const baseMessage = `Imported ${created} products`;
  if (failed > 0) {
    return `${baseMessage}, ${failed} failed`;
  }
  return baseMessage;
}

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  // Apply rate limiting
  if (!rateLimit(req, res, RATE_LIMITS.api)) {
    return;
  }

  if (req.method !== 'POST') {
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

    // Get CSV content from request body
    const { csvContent } = req.body as { csvContent: string };

    if (!csvContent || typeof csvContent !== 'string') {
      const apiError = createApiError({ error: new Error('CSV content is required') });
      apiError.code = httpCode.BAD_REQUEST;
      return res.status(httpCode.BAD_REQUEST).json(apiError);
    }

    // Parse CSV
    let products: CSVProduct[];
    try {
      products = parseAndValidateCSV(csvContent);
    } catch (parseError) {
      const apiError = createApiError({ error: parseError });
      apiError.code = httpCode.BAD_REQUEST;
      apiError.message.fallback = parseError instanceof Error ? parseError.message : 'Failed to parse CSV';
      return res.status(httpCode.BAD_REQUEST).json(apiError);
    }

    if (products.length === 0) {
      const apiError = createApiError({ error: new Error('No valid products found in CSV') });
      apiError.code = httpCode.BAD_REQUEST;
      return res.status(httpCode.BAD_REQUEST).json(apiError);
    }

    // Import all products in parallel
    const createPromises = products.map((product, index) => createProductFromCSV(merchant.id, product, index + 2));
    const results = await Promise.all(createPromises);

    // Aggregate results
    const result: ImportResult = results.reduce(
      (acc, r) => {
        if (r.success) {
          acc.created += 1;
        } else {
          acc.failed += 1;
          acc.errors.push({ row: r.row, error: r.error || 'Unknown error' });
        }
        return acc;
      },
      { created: 0, failed: 0, errors: [] as Array<{ row: number; error: string }> },
    );

    return res.status(httpCode.SUCCESS).json({
      success: true,
      data: result,
      message: buildResponseMessage(result.created, result.failed),
    });
  } catch (error) {
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

export default withAuth(handler);
