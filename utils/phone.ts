export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function toInternationalDigits(phone: string): string {
  const digits = digitsOnly(phone);
  if (!digits) return "";
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("94") && digits.length >= 11) return digits;
  if (digits.startsWith("0")) return `94${digits.slice(1)}`;
  if (digits.length === 9) return `94${digits}`;
  return digits;
}

export function toTelHref(phone: string): string {
  const digits = toInternationalDigits(phone);
  return digits ? `tel:+${digits}` : "";
}

export function normalizePhoneKey(phone: string): string {
  const digits = digitsOnly(phone);
  return digits || "unknown";
}

export function isLikelyPhone(value: string): boolean {
  const digits = digitsOnly(value);
  return digits.length >= 9 && digits.length <= 15;
}
