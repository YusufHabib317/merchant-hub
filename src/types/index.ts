import {
  User,
  Merchant,
  Product,
  ChatSession,
  Message,
  Role,
  SubscriptionTier,
  MessageFrom,
} from '@prisma/client';

// Re-export Prisma types
export type {
  User, Merchant, Product, ChatSession, Message, Role, SubscriptionTier, MessageFrom,
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
  details?: unknown;
}

// Session types
export interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Product types
export interface ProductWithMerchant extends Product {
  merchant: Merchant;
}

// Merchant types
export interface MerchantWithProducts extends Merchant {
  products: Product[];
}

// Chat types
export interface ChatSessionWithMessages extends ChatSession {
  messages: Message[];
}

// Export template types
export type ExportTemplate = 'classic' | 'modern' | 'elegant' | 'social' | 'catalog' | 'pricelist';

export interface ExportRequest {
  productIds: string[];
  template: ExportTemplate;
  format?: 'png' | 'jpg';
}

// QR Code types
export interface QRCodeRequest {
  merchantSlug: string;
  size?: number;
  format?: 'png' | 'svg';
}
