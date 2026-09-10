import { z } from "zod";
import {
  emailSchema,
  honeypotSchema,
  mileageSchema,
  nameSchema,
  optionalMessageSchema,
  phoneSchema,
  yearSchema,
} from "@/lib/validation/common";

export const tradeInSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  make: z.string().trim().min(1, "Enter the make").max(40),
  model: z.string().trim().min(1, "Enter the model").max(40),
  year: yearSchema,
  mileage: mileageSchema,
  fuelType: z
    .enum(["Petrol", "Diesel", "Hybrid", "Electric", "CNG", "Other"])
    .or(z.literal("")),
  transmission: z
    .enum(["Automatic", "Manual", "CVT", "DCT", "Other"])
    .or(z.literal("")),
  condition: z.string().trim().min(2, "Describe the condition").max(80),
  registrationStatus: z.string().trim().min(2, "Enter registration status").max(80),
  expectedPrice: z.coerce.number().min(0).max(1_000_000_000).optional().nullable(),
  notes: optionalMessageSchema.default(""),
  company: honeypotSchema,
});

export type TradeInInput = z.infer<typeof tradeInSchema>;
