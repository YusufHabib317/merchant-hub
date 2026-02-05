import { z } from 'zod';

const PASSWORD_MIN_LENGTH_ERROR = 'Password must be at least 8 characters';

// Password change with OTP
export const RequestPasswordChangeOTPSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, PASSWORD_MIN_LENGTH_ERROR),
});

export const VerifyPasswordChangeOTPSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z
    .string()
    .min(8, PASSWORD_MIN_LENGTH_ERROR),
});

// Password reset with OTP (forgot password)
export const RequestPasswordResetOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const VerifyPasswordResetOTPSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z
    .string()
    .min(8, PASSWORD_MIN_LENGTH_ERROR),
});

// Type exports
export type RequestPasswordChangeOTPInput = z.infer<typeof RequestPasswordChangeOTPSchema>;
export type VerifyPasswordChangeOTPInput = z.infer<typeof VerifyPasswordChangeOTPSchema>;
export type RequestPasswordResetOTPInput = z.infer<typeof RequestPasswordResetOTPSchema>;
export type VerifyPasswordResetOTPInput = z.infer<typeof VerifyPasswordResetOTPSchema>;
