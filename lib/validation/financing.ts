import { z } from "zod";
import {
  honeypotSchema,
  messageSchema,
  nameSchema,
  phoneSchema,
} from "@/lib/validation/common";

export const financingSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  vehicleLabel: z.string().trim().max(160).optional().default(""),
  estimatedBudget: z.string().trim().min(1, "Enter an estimated budget").max(40),
  employmentType: z.string().trim().min(2, "Enter employment type").max(40),
  message: messageSchema,
  company: honeypotSchema,
});

export type FinancingInput = z.infer<typeof financingSchema>;
