import { NextApiResponse } from 'next';
import { Prisma, Role } from '@prisma/client';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/prisma';
import { httpCode } from '@/lib/constants';
import createApiError from '@/lib/api/createApiError';
import { rateLimit, RATE_LIMITS } from '@/lib/security';
import { AdminUsersResponse, AdminUserItem } from '@/types/admin';

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
    const { page = '1', limit = '20', search, role } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));

    // Build where clause
    const where: Prisma.UserWhereInput = {};

    // Search filter (case-insensitive on name or email)
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Role filter (exact match)
    if (role && typeof role === 'string' && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    // Fetch total count
    const total = await prisma.user.count({ where });

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const response: AdminUsersResponse = {
      users: users as AdminUserItem[],
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
