import { z } from 'zod';
import { LoginSchema, RegisterSchema, UserSchema } from '../auth';

// Login - Better Auth handles session via cookies
export const LoginRequestSchema = LoginSchema;

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
    session: z
      .object({
        id: z.string(),
        expiresAt: z.date(),
        token: z.string(),
      })
      .optional(),
  }),
  message: z.string().optional(),
});

// Register - Better Auth handles session via cookies
export const RegisterRequestSchema = RegisterSchema;

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: UserSchema,
    session: z
      .object({
        id: z.string(),
        expiresAt: z.date(),
        token: z.string(),
      })
      .optional(),
  }),
  message: z.string().optional(),
});

// Get Current User
export const GetCurrentUserResponseSchema = z.object({
  success: z.boolean(),
  data: UserSchema,
});

// Error Response
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.any().optional(),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type GetCurrentUserResponse = z.infer<typeof GetCurrentUserResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
