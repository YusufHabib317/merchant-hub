/**
 * Server-side input sanitization utility using sanitize-html
 * This module provides functions to sanitize user inputs at the Next.js server level
 * to prevent XSS attacks and other injection vulnerabilities.
 */

import sanitizeHtml from 'sanitize-html';

/**
 * Strict sanitization options - removes ALL HTML tags
 * Use for fields that should never contain HTML (names, titles, etc.)
 */
const strictOptions: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

/**
 * Basic sanitization options - allows safe formatting tags
 * Use for fields that may contain basic formatting (descriptions)
 */
const basicOptions: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'br', 'p'],
  allowedAttributes: {},
  disallowedTagsMode: 'discard',
};

/**
 * Rich sanitization options - allows more formatting
 * Use for content that needs more formatting options
 */
const richOptions: sanitizeHtml.IOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'a'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
  allowedSchemes: ['http', 'https'],
  disallowedTagsMode: 'discard',
};

/**
 * Sanitize a string with strict rules (no HTML allowed)
 * Ideal for: names, titles, slugs, categories, addresses
 */
export function sanitizeStrict(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return sanitizeHtml(input.trim(), strictOptions);
}

/**
 * Sanitize a string with basic formatting allowed
 * Ideal for: short descriptions, summaries
 */
export function sanitizeBasic(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return sanitizeHtml(input.trim(), basicOptions);
}

/**
 * Sanitize a string with rich formatting allowed
 * Ideal for: long descriptions, rich text content
 */
export function sanitizeRich(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return sanitizeHtml(input.trim(), richOptions);
}

/**
 * Sanitize an object's string properties recursively
 * Only sanitizes string values, leaves other types unchanged
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  mode: 'strict' | 'basic' | 'rich' = 'strict'
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  let sanitizeFn: (input: string) => string;
  if (mode === 'strict') {
    sanitizeFn = sanitizeStrict;
  } else if (mode === 'basic') {
    sanitizeFn = sanitizeBasic;
  } else {
    sanitizeFn = sanitizeRich;
  }

  const result = { ...obj };

  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeFn(value);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeFn(item) : item
      );
    } else if (value && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>,
        mode
      );
    }
  });

  return result;
}

/**
 * Sanitize product input data
 * Applies strict sanitization to name/category, basic to description
 */
export function sanitizeProductInput<
  T extends {
    name?: string;
    description?: string;
    category?: string;
    imageUrls?: string[];
  }
>(input: T): T {
  return {
    ...input,
    name: input.name ? sanitizeStrict(input.name) : input.name,
    description: input.description ? sanitizeBasic(input.description) : input.description,
    category: input.category ? sanitizeStrict(input.category) : input.category,
    // imageUrls are validated as URLs by Zod, no need to sanitize
  };
}

/**
 * Sanitize merchant input data
 * Applies strict sanitization to name/address, basic to description
 */
export function sanitizeMerchantInput<
  T extends {
    name?: string;
    description?: string;
    address?: string;
    aiContext?: string;
  }
>(input: T): T {
  return {
    ...input,
    name: input.name ? sanitizeStrict(input.name) : input.name,
    description: input.description ? sanitizeBasic(input.description) : input.description,
    address: input.address ? sanitizeStrict(input.address) : input.address,
    aiContext: input.aiContext ? sanitizeBasic(input.aiContext) : input.aiContext,
  };
}

/**
 * Sanitize chat message content
 * Applies strict sanitization - no HTML allowed in chat messages
 */
export function sanitizeChatMessage(content: string): string {
  return sanitizeStrict(content);
}
