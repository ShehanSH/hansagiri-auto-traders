import { z } from "zod";
import { isLikelyPhone } from "@/utils/phone";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Please enter your name")
  .max(80, "Name is too long");

export const phoneSchema = z
  .string()
  .trim()
  .min(9, "Please enter a valid phone number")
  .max(20, "Phone number is too long")
  .refine(isLikelyPhone, "Please enter a valid phone number");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .max(20)
  .refine((value) => !value || isLikelyPhone(value), "Please enter a valid phone number");

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .max(120);

export const optionalEmailSchema = z
  .string()
  .trim()
  .max(120)
  .refine(
    (value) => !value || z.string().email().safeParse(value).success,
    "Please enter a valid email address",
  );

export const messageSchema = z
  .string()
  .trim()
  .min(10, "Please add a short message")
  .max(2000, "Message is too long");

export const optionalMessageSchema = z.string().trim().max(2000);

export const honeypotSchema = z.string().max(0).optional().or(z.literal(""));

export const yearSchema = z.coerce
  .number()
  .int()
  .min(1980, "Year looks too early")
  .max(new Date().getFullYear() + 1, "Year looks invalid");

export const priceSchema = z.coerce
  .number()
  .min(0, "Price cannot be negative")
  .max(1_000_000_000, "Price is too high");

export const mileageSchema = z.coerce
  .number()
  .min(0, "Mileage cannot be negative")
  .max(1_000_000, "Mileage looks invalid");

export const urlSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Please enter a valid URL");
