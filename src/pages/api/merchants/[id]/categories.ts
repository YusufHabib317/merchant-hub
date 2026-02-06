import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { rateLimit, RATE_LIMITS } from '@/lib/security';

/**
 * Category information returned by the categories API
 */
export interface CategoryInfo {
  /** Category name ("Uncategorized" for null/empty/whitespace) */
  name: string;
  /** Count of published products in this category */
  productCount: number;
  /** Image URL of the most recently created product with images, or null */
  imageUrl: string | null;
}

/**
 * Normalizes a raw category value to a display name.
 * Null, empty, or whitespace-only values become "Uncategorized".
 */
function normalizeCategory(category: string | null): string {
  if (category === null || category.trim() === '') {
    return 'Uncategorized';
  }
  return category;
}

/**
 * Builds a sorted CategoryInfo list from raw product data.
 * Exported for testability in property-based tests.
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function buildCategoryList(
  products: Array<{
    category: string | null;
    imageUrls: string[];
    createdAt: Date;
  }>
): CategoryInfo[] {
  // Group products by normalized category
  const categoryMap = new Map<
    string,
    { count: number; latestProductWithImage: { imageUrl: string; createdAt: Date } | null }
  >();

  products.forEach((product) => {
    const name = normalizeCategory(product.category);
    const existing = categoryMap.get(name);

    // Determine if this product has a representative image
    const firstImage = product.imageUrls.length > 0 ? product.imageUrls[0] : null;

    if (!existing) {
      categoryMap.set(name, {
        count: 1,
        latestProductWithImage:
          firstImage !== null ? { imageUrl: firstImage, createdAt: product.createdAt } : null,
      });
    } else {
      existing.count += 1;

      // Update representative image if this product is more recent and has images
      if (
        firstImage !== null &&
        (existing.latestProductWithImage === null ||
          product.createdAt > existing.latestProductWithImage.createdAt)
      ) {
        existing.latestProductWithImage = { imageUrl: firstImage, createdAt: product.createdAt };
      }
    }
  });

  // Convert to CategoryInfo array
  const categories: CategoryInfo[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    productCount: data.count,
    imageUrl: data.latestProductWithImage?.imageUrl ?? null,
  }));

  // Sort alphabetically with "Uncategorized" last
  categories.sort((a, b) => {
    if (a.name === 'Uncategorized') return 1;
    if (b.name === 'Uncategorized') return -1;
    return a.name.localeCompare(b.name);
  });

  return categories;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting (public endpoint)
  if (!rateLimit(req, res, RATE_LIMITS.read)) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
    return;
  }

  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Invalid merchant ID',
      });
      return;
    }

    // Fetch all published products for this merchant with relevant fields
    const products = await prisma.product.findMany({
      where: {
        merchantId: id,
        isPublished: true,
      },
      select: {
        category: true,
        imageUrls: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const categories = buildCategoryList(products);

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Get merchant categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
