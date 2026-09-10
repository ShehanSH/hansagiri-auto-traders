import { z } from "zod";
import {
  emailSchema,
  honeypotSchema,
  nameSchema,
  optionalMessageSchema,
  optionalPhoneSchema,
  phoneSchema,
} from "@/lib/validation/common";

export const testDriveSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema.default(""),
  email: emailSchema,
  vehicleId: z.string().max(80).optional().default(""),
  vehicleLabel: z.string().max(160).optional().default(""),
  preferredDate: z.string().min(1, "Please choose a preferred date").max(40),
  preferredTime: z.string().min(1, "Please choose a preferred time").max(40),
  message: optionalMessageSchema.default(""),
  company: honeypotSchema,
});

export type TestDriveInput = z.infer<typeof testDriveSchema>;
