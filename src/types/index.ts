import { User, Merchant, Product, ChatSession, Role, SubscriptionTier } from '@prisma/client';

export type { User, Merchant, Product, ChatSession, Role, SubscriptionTier };

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

export interface ProductWithMerchant extends Product {
  merchant: Merchant;
}

export interface MerchantWithProducts extends Merchant {
  products: Product[];
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: Array<{
    id: string;
    sessionId: string;
    senderId?: string;
    senderType: 'customer' | 'merchant' | 'ai';
    content: string;
    createdAt: Date;
  }>;
}

export type ExportTemplate = 'elegant' | 'price-list';

export interface ExportRequest {
  productIds: string[];
  template: ExportTemplate;
  format?: 'png' | 'jpg';
}

export interface QRCodeRequest {
  merchantSlug: string;
  size?: number;
  format?: 'png' | 'svg';
}
