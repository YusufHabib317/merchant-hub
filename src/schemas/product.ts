/* eslint-disable sonarjs/no-duplicate-string */
import { z } from 'zod';

export const ProductConditionEnum = z.enum(['NEW', 'USED', 'REFURBISHED']);

export const ProductSchema = z.object({
  id: z.string().cuid(),
  merchantId: z.string().cuid(),
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().max(2000).optional(),
  priceUSD: z.number().min(0, 'Price must be 0 or greater'),
  priceSYP: z.number().positive().optional(),
  exchangeRate: z.number().positive('Exchange rate must be positive').default(15000),
  imageUrls: z.array(z.string().url('Invalid image URL')),
  category: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  condition: ProductConditionEnum.default('NEW'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  priceUSD: z.number().min(0, 'Price must be 0 or greater'),
  priceSYP: z.number().min(0, 'Price must be 0 or greater').optional(),
  exchangeRate: z.number().positive('Exchange rate must be positive').default(15000),
  imageUrls: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least one image is required')
    .max(3, 'Maximum 3 images allowed'),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  condition: ProductConditionEnum.default('NEW'),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type Product = z.infer<typeof ProductSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
