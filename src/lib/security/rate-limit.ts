/**
 * Simple in-memory rate limiter for API routes
 * Uses LRU cache for efficient memory management
 */

import { LRUCache } from 'lru-cache';
import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Time window in seconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

// Create cache for rate limit tracking
const rateLimitCache = new LRUCache<string, { count: number; resetTime: number }>({
  max: 10000, // Maximum number of entries
  ttl: 1000 * 60 * 15, // 15 minutes TTL
});

/**
 * Get the client identifier from request
 * Uses X-Forwarded-For header (for proxied requests) or falls back to IP
 */
function getClientIdentifier(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  return Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
}

/**
 * Check rate limit for a specific key
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowMs = options.windowMs * 1000;

  let entry = rateLimitCache.get(key);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    entry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitCache.set(key, entry);
    return {
      success: true,
      remaining: options.limit - 1,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count += 1;
  rateLimitCache.set(key, entry);

  if (entry.count > options.limit) {
    return {
      success: false,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    remaining: options.limit - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict limit for auth endpoints (10 requests per minute)
  auth: { limit: 10, windowMs: 60 },
  // Standard limit for API endpoints (100 requests per minute)
  api: { limit: 100, windowMs: 60 },
  // Relaxed limit for read operations (200 requests per minute)
  read: { limit: 200, windowMs: 60 },
  // Very strict for sensitive operations (5 requests per minute)
  sensitive: { limit: 5, windowMs: 60 },
} as const;

/**
 * Rate limit middleware for Next.js API routes
 * @returns true if request should be allowed, false if rate limited
 */
export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  options: RateLimitOptions = RATE_LIMITS.api
): boolean {
  const clientId = getClientIdentifier(req);
  const endpoint = req.url || '/unknown';
  const key = `${clientId}:${endpoint}`;

  const result = checkRateLimit(key, options);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', options.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.reset / 1000));

  if (!result.success) {
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
    });
    return false;
  }

  return true;
}

/**
 * Higher-order function to wrap API handlers with rate limiting
 */
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
  options: RateLimitOptions = RATE_LIMITS.api
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    if (!rateLimit(req, res, options)) {
      return;
    }
    await handler(req, res);
  };
}
