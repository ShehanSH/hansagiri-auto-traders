const DEFAULT_CURRENCY = "LKR";

export function formatPrice(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale = "en-LK",
): string {
  if (!Number.isFinite(amount)) return "Price on request";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString("en-US")}`;
  }
}

export function formatMileage(km: number): string {
  if (!Number.isFinite(km)) return "—";
  return `${Math.round(km).toLocaleString("en-US")} km`;
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function composeVehicleName(vehicle: {
  year?: number | string;
  make?: string;
  model?: string;
  variant?: string;
}): string {
  const year = Number(vehicle.year);
  return [Number.isFinite(year) && year > 1900 ? String(year) : "", vehicle.make, vehicle.model, vehicle.variant]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ");
}

export function vehicleTitle(vehicle: {
  name?: string;
  year: number;
  make: string;
  model: string;
  variant?: string;
}): string {
  if (vehicle.name?.trim()) return vehicle.name.trim();
  return composeVehicleName(vehicle);
}

export function statusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
