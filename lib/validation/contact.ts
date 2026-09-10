import { z } from "zod";
import {
  emailSchema,
  honeypotSchema,
  messageSchema,
  nameSchema,
  phoneSchema,
} from "@/lib/validation/common";

export const contactSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  subject: z.string().trim().min(3, "Please add a subject").max(120),
  message: messageSchema,
  company: honeypotSchema,
});

export type ContactInput = z.infer<typeof contactSchema>;
