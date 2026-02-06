import { z } from 'zod';

// Translated field schema for i18n support
export const translatedFieldSchema = z.object({
  en: z.string().nullable(),
  ar: z.string().nullable(),
});

export type TranslatedField = z.infer<typeof translatedFieldSchema>;

// Backend error response structure
export interface BackendErrorBody {
  data: null;
  error: {
    status: number;
    name: string;
    message: string;
    details: {
      key?: string;
      params?: Record<string, string | TranslatedField | TranslatedField[] | string[]>;
    };
  };
}

// Standardized API error structure
export interface ApiErrorResponse {
  code: number;
  message: {
    fallback: string;
    key: string;
    params?: Record<string, string | TranslatedField | TranslatedField[] | string[]>;
  };
  errors?: Error[];
}

// Error keys for specific error types
export const ErrorKeys = {
  VALIDATION_ERROR: 'validationError',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'notFound',
  MERCHANT_NOT_FOUND: 'merchantNotFound',
  PRODUCT_NOT_FOUND: 'productNotFound',
  INTERNAL_SERVER_ERROR: 'internalServerError',
  METHOD_NOT_ALLOWED: 'methodNotAllowed',
} as const;

export type ErrorKey = (typeof ErrorKeys)[keyof typeof ErrorKeys];
