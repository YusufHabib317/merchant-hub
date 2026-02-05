import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Maximum number of retries for transient database errors
 */
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;

/**
 * Transient error codes that should trigger a retry
 * P2024 - Connection pool timeout
 * P2028 - Transaction API error
 */
const RETRYABLE_ERROR_CODES = ['P2024', 'P2028'];

/**
 * Sleep helper for retry delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Check if error is retryable
 */
function isRetryableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError
    && RETRYABLE_ERROR_CODES.includes(error.code)
  );
}

/**
 * Create Prisma client with retry extension for transient failures
 */
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // Add retry middleware for transient errors
  return client.$extends({
    query: {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async $allOperations({ args, query }) {
        let lastError: Error | null = null;
        let attempt = 0;

        while (attempt < MAX_RETRIES) {
          try {
            // eslint-disable-next-line no-await-in-loop
            return await query(args);
          } catch (error) {
            lastError = error as Error;

            // Check if this is a retryable Prisma error
            if (isRetryableError(error)) {
              attempt += 1;
              // eslint-disable-next-line no-await-in-loop
              await sleep(RETRY_DELAY_MS * attempt);
            } else {
              // Non-retryable error, throw immediately
              throw error;
            }
          }
        }

        // All retries exhausted
        throw lastError;
      },
    },
  }) as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
