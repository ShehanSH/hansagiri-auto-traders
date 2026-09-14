import { z } from "zod";
import { emailSchema } from "@/lib/validation/common";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(72, "Password is too long"),
    confirmPassword: z.string().min(8, "Confirm your new password"),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
