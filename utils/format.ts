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

export function vehicleTitle(vehicle: {
  year: number;
  make: string;
  model: string;
  variant?: string;
}): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.variant]
    .filter(Boolean)
    .join(" ");
}

export function statusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
