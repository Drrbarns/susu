/**
 * Server-side input validation schemas using Zod.
 * Used in API proxy routes to validate request bodies before forwarding.
 */
import { z } from "zod";

// ============================================================
// Auth Validations
// ============================================================

export const loginSchema = z.object({
  phone: z
    .string()
    .min(9, "Phone number is too short")
    .max(15, "Phone number is too long")
    .regex(/^[\d+]+$/, "Phone number must contain only digits"),
  password: z.string().min(1, "Password is required"),
  deviceInfo: z.record(z.string(), z.string()).optional(),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .min(9, "Phone number is too short")
    .max(15, "Phone number is too long")
    .regex(/^[\d+]+$/, "Phone number must contain only digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  referralCode: z.string().optional(),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(9),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must be digits only"),
});

export const resetPasswordSchema = z.object({
  phone: z.string().min(9),
  otp: z.string().optional(),
  newPassword: z.string().min(8).max(128).optional(),
});

// ============================================================
// Payment Validations
// ============================================================

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be positive").max(50000, "Amount exceeds maximum"),
  payment_method: z.enum(["momo", "card", "cash"]),
  purpose: z.enum(["contribution", "join_fee", "wallet_topup"]),
  group_id: z.string().uuid().optional(),
  contribution_schedule_id: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  idempotency_key: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  payment_intent_id: z.string().uuid().optional(),
  provider_reference: z.string().optional(),
  fromRedirect: z.boolean().optional(),
});

// ============================================================
// Wallet Validations
// ============================================================

export const withdrawalSchema = z.object({
  amount: z.number().positive().max(10000),
  method: z.enum(["momo"]),
  momo_number: z
    .string()
    .min(10)
    .max(15)
    .regex(/^[\d+]+$/),
  momo_name: z.string().min(2).max(100),
});

// ============================================================
// Group Validations
// ============================================================

export const createGroupSchema = z.object({
  name: z.string().min(3, "Group name must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["public", "request", "paid"]),
  daily_amount: z.number().positive().max(10000),
  group_size: z.number().int().min(2).max(100),
  days_per_turn: z.number().int().positive(),
  payout_amount: z.number().positive(),
  join_fee: z.number().nonnegative().optional(),
  start_date: z.string().optional(),
  rules: z.string().max(2000).optional(),
});

/**
 * Validate a request body against a schema.
 * Returns { success: true, data } or { success: false, error }.
 */
export function validateBody<T>(
  body: unknown,
  schema: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(body);
  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Invalid input",
    };
  }
  return { success: true, data: result.data };
}
