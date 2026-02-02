import { z } from 'zod';
import { ProductSchema, CreateProductSchema, UpdateProductSchema } from '../product';

// List Products
export const ListProductsRequestSchema = z.object({
  merchantId: z.string().cuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(1000)
    .default(20),
});

export const ListProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    products: z.array(ProductSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  }),
});

// Create Product
export const CreateProductRequestSchema = CreateProductSchema;

export const CreateProductResponseSchema = z.object({
  success: z.boolean(),
  data: ProductSchema,
  message: z.string().optional(),
});

// Update Product
export const UpdateProductRequestSchema = UpdateProductSchema;

export const UpdateProductResponseSchema = z.object({
  success: z.boolean(),
  data: ProductSchema,
  message: z.string().optional(),
});

// Get Product
export const GetProductResponseSchema = z.object({
  success: z.boolean(),
  data: ProductSchema,
});

// Delete Product
export const DeleteProductResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type ListProductsRequest = z.infer<typeof ListProductsRequestSchema>;
export type ListProductsResponse = z.infer<typeof ListProductsResponseSchema>;
export type CreateProductRequest = z.infer<typeof CreateProductRequestSchema>;
export type CreateProductResponse = z.infer<typeof CreateProductResponseSchema>;
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;
export type UpdateProductResponse = z.infer<typeof UpdateProductResponseSchema>;
export type GetProductResponse = z.infer<typeof GetProductResponseSchema>;
export type DeleteProductResponse = z.infer<typeof DeleteProductResponseSchema>;
