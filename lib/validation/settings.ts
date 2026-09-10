import { z } from "zod";
import { emailSchema, optionalPhoneSchema, urlSchema } from "@/lib/validation/common";

export const settingsSchema = z.object({
  businessName: z.string().trim().min(2).max(80),
  businessDescription: z.string().trim().min(10).max(600),
  phone: optionalPhoneSchema.default(""),
  whatsapp: optionalPhoneSchema.default(""),
  email: z.union([emailSchema, z.literal("")]),
  address: z.string().trim().max(200).default(""),
  mapsUrl: urlSchema.or(z.literal("")),
  currency: z.string().trim().min(3).max(8),
  currencySymbol: z.string().trim().max(8).default(""),
  heroTitle: z.string().trim().min(2).max(80),
  heroSubtitle: z.string().trim().min(2).max(80),
  heroSupporting: z.string().trim().min(2).max(200),
  seoTitle: z.string().trim().min(2).max(70),
  seoDescription: z.string().trim().min(10).max(180),
  featuredLimit: z.coerce.number().int().min(1).max(12),
  showSoldVehicles: z.boolean(),
  showReservedVehicles: z.boolean(),
  privacyPolicy: z.string().max(20000).default(""),
  terms: z.string().max(20000).default(""),
  facebook: urlSchema.or(z.literal("")),
  instagram: urlSchema.or(z.literal("")),
  tiktok: urlSchema.or(z.literal("")),
  youtube: urlSchema.or(z.literal("")),
});
