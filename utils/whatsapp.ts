import { toInternationalDigits } from "@/utils/phone";

export function toWhatsAppHref(phone: string, message = ""): string {
  const digits = toInternationalDigits(phone);
  if (!digits) return "";
  const url = new URL(`https://wa.me/${digits}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

export function vehicleInterestMessage(input: {
  businessName: string;
  title: string;
  stockId: string;
}): string {
  return `Hi ${input.businessName}, I'm interested in the ${input.title} (Stock ID: ${input.stockId}).`;
}

export function generalWhatsAppMessage(businessName: string): string {
  return `Hi ${businessName}, I would like to know more about your vehicles.`;
}
