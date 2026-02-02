import { NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { UpdateMerchantSchema } from '@/schemas/merchant';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { sanitizeMerchantInput, rateLimit, RATE_LIMITS } from '@/lib/security';

async function handleGetMerchant(
  id: string,
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      const apiError = createApiError({ error: new Error('notFound') });
      apiError.message.fallback = 'Merchant not found';
      apiError.message.key = 'merchantNotFound';
      return res.status(httpCode.NOT_FOUND).json(apiError);
    }

    // Check ownership
    if (merchant.userId !== req.user.id) {
      const apiError = createApiError({ error: new Error('forbidden') });
      apiError.message.fallback = 'You do not own this merchant';
      apiError.message.key = 'forbidden';
      return res.status(httpCode.FORBIDDEN).json(apiError);
    }

    return res.status(httpCode.SUCCESS).json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    const apiError = createApiError({ error });
    return res.status(apiError.code).json(apiError);
  }
}

async function handleUpdateMerchant(
  id: string,
  req: AuthenticatedRequest,
  res: NextApiResponse,
) {
  try {
    // Validate request body
    const input = UpdateMerchantSchema.parse(req.body);

    // Sanitize user inputs to prevent XSS
    const sanitizedInput = sanitizeMerchantInput(input);

    // Get merchant
    const merchant = await prisma.merchant.findUnique({
      where: { id },
    });

    if (!merchant) {
      const apiError = createApiError({ error: new Error('notFound') });
      apiError.message.fallback = 'Merchant not found';
      apiError.message.key = 'merchantNotFound';
      return res.status(httpCode.NOT_FOUND).json(apiError);
    }

    // Check ownership
    if (merchant.userId !== req.user.id) {
      const apiError = createApiError({ error: new Error('forbidden') });
      apiError.message.fallback = 'You do not own this merchant';
      apiError.message.key = 'forbidden';
      return res.status(httpCode.FORBIDDEN).json(apiError);
    }

    // Update merchant with sanitized data
    const updatedMerchant = await prisma.merchant.update({
      where: { id },
      data: sanitizedInput,
    });

    return res.status(httpCode.SUCCESS).json({
      success: true,
      data: updatedMerchant,
      message: 'Merchant updated successfully',
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
    const apiError = createApiError({ error: new Error('Invalid merchant ID') });
    apiError.code = httpCode.BAD_REQUEST;
    apiError.message.key = 'validationError';
    res.status(httpCode.BAD_REQUEST).json(apiError);
    return;
  }

  if (req.method === 'GET') {
    await handleGetMerchant(id, req, res);
    return;
  }
  if (req.method === 'PUT') {
    await handleUpdateMerchant(id, req, res);
    return;
  }

  const apiError = createApiError({ error: new Error('Method not allowed') });
  apiError.code = httpCode.METHOD_NOT_ALLOWED;
  apiError.message.key = 'methodNotAllowed';
  res.status(httpCode.METHOD_NOT_ALLOWED).json(apiError);
}

export default withAuth(handler);
