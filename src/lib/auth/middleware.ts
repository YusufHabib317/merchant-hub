import { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import { auth } from '@/lib/auth';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface Session {
  user: SessionUser;
}

export interface AuthenticatedRequest extends NextApiRequest {
  session?: Session;
  user: SessionUser;
}

/**
 * Get server session from Better Auth
 * Extracts session from cookies or Authorization header
 */
export async function getServerSession(req: NextApiRequest): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    return session as Session | null;
  } catch {
    return null;
  }
}

/**
 * Middleware to protect API routes with authentication
 * Usage: export default withAuth(handler);
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      const session = await getServerSession(req);

      if (!session) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - No valid session',
        });
      }

      req.session = session;
      req.user = session.user;
      return handler(req, res);
    } catch {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  };
}

/**
 * Middleware to protect API routes with role-based access control
 * Usage: export default withRole(['MERCHANT', 'ADMIN'], handler);
 */
export function withRole(
  roles: string[],
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void> | void,
) {
  return withAuth(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Insufficient permissions',
      });
    }

    return handler(req, res);
  });
}
