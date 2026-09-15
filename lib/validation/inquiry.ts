import { z } from "zod";
import {
  emailSchema,
  honeypotSchema,
  messageSchema,
  nameSchema,
  optionalPhoneSchema,
  phoneSchema,
} from "@/lib/validation/common";

export const inquirySchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  whatsapp: optionalPhoneSchema.default(""),
  email: emailSchema,
  vehicleId: z.string().max(80).optional().default(""),
  vehicleLabel: z.string().max(160).optional().default(""),
  message: messageSchema,
  preferredContact: z.enum(["phone", "whatsapp", "email"]),
  preferredDate: z.string().max(40).optional().default(""),
  preferredTime: z.string().max(40).optional().default(""),
  source: z
    .enum(["vehicles", "vehicle_detail", "contact", "home", "financing", "trade_in", "other"])
    .default("other"),
  company: honeypotSchema,
});

export type InquiryInput = z.infer<typeof inquirySchema>;
