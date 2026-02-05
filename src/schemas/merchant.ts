import { z } from 'zod';

export const MerchantSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  name: z.string().min(1, 'Business name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  address: z.string().optional(),
  subscriptionTier: z.enum(['FREE', 'BASIC', 'PREMIUM']).default('FREE'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UpdateMerchantSchema = z.object({
  name: z.string().min(1, 'Business name is required').optional(),
  description: z.string().optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  address: z.string().optional(),
  aiContext: z.string().optional(),
  isChatEnabled: z.boolean().optional(),
});

export type Merchant = z.infer<typeof MerchantSchema>;
export type UpdateMerchantInput = z.infer<typeof UpdateMerchantSchema>;
