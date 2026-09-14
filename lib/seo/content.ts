import type { Metadata } from "next";
import { BRAND_NAME } from "@/config/constants";
import type { SiteSettings } from "@/types";
import { composeVehicleName, formatMileage, formatPrice, vehicleTitle } from "@/utils/format";

export function getSiteUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (explicit) {
    return explicit.replace(/\/$/, "").replace(/^(?!https?:\/\/)/, "https://");
  }
  const vercel =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL ||
    "";
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }
  return "https://hansagiri-auto-traders.vercel.app";
}

export function clipSeo(value: string, max: number): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  const sliced = trimmed.slice(0, Math.max(1, max - 1));
  const lastSpace = sliced.lastIndexOf(" ");
  const clipped = (lastSpace > 24 ? sliced.slice(0, lastSpace) : sliced).trimEnd();
  return `${clipped}…`;
}

export function buildSiteSeo(settings: Pick<SiteSettings, "businessName" | "businessDescription" | "address">): {
  title: string;
  description: string;
} {
  const name = settings.businessName.trim() || BRAND_NAME;
  const location = settings.address.trim() ? ` in ${settings.address.trim()}` : " in Sri Lanka";
  const title = clipSeo(`${name} | New & Pre-Owned Vehicles${location}`, 70);
  const description = clipSeo(
    settings.businessDescription.trim() ||
      `Browse quality new and pre-owned vehicles at ${name}. Transparent pricing, test drives, trade-ins, and financing assistance.`,
    180,
  );
  return { title, description };
}

export function resolveSiteSeo(settings: SiteSettings): { title: string; description: string } {
  const generated = buildSiteSeo(settings);
  return {
    title: settings.seoTitle.trim() || generated.title,
    description: settings.seoDescription.trim() || generated.description,
  };
}

type VehicleSeoInput = {
  name?: string;
  year?: number | string;
  make?: string;
  model?: string;
  variant?: string;
  price?: number;
  currency?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  color?: string;
  location?: string;
  vehicleType?: string;
  description?: string;
};

export function buildVehicleSeo(
  vehicle: VehicleSeoInput,
  businessName = BRAND_NAME,
): { title: string; description: string } {
  const name = vehicleTitle({
    name: vehicle.name,
    year: Number(vehicle.year) || 0,
    make: vehicle.make || "",
    model: vehicle.model || "",
    variant: vehicle.variant,
  });
  const kind = vehicle.vehicleType === "new" ? "new" : "pre-owned";
  const place = vehicle.location?.trim() || "Sri Lanka";
  const title = clipSeo(`${name} for sale | ${businessName}`, 70);

  const facts = [
    name,
    vehicle.price ? `priced at ${formatPrice(Number(vehicle.price), vehicle.currency || "LKR")}` : "",
    vehicle.year ? `${vehicle.year}` : "",
    kind,
    vehicle.fuelType,
    vehicle.transmission,
    vehicle.mileage ? formatMileage(Number(vehicle.mileage)) : "",
    vehicle.color,
    vehicle.bodyType,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  const fromDescription = vehicle.description?.trim().replace(/\s+/g, " ");
  const description = clipSeo(
    fromDescription ||
      `${facts.join(" · ")}. Available at ${businessName} in ${place}. Enquire for a viewing or test drive.`,
    180,
  );

  return { title, description };
}

export function resolveVehicleSeo(
  vehicle: VehicleSeoInput & { seoTitle?: string; seoDescription?: string },
  businessName = BRAND_NAME,
): { title: string; description: string } {
  const generated = buildVehicleSeo(vehicle, businessName);
  return {
    title: vehicle.seoTitle?.trim() || generated.title,
    description: vehicle.seoDescription?.trim() || generated.description,
  };
}

export function pagePath(path: string): string {
  if (!path || path === "/") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  businessName?: string;
}): Metadata {
  const url = `${getSiteUrl()}${pagePath(input.path)}`;
  const image = input.image || "/cover.jpg";
  const brand = input.businessName || BRAND_NAME;
  return {
    title: { absolute: input.title },
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_LK",
      url,
      siteName: brand,
      title: input.title,
      description: input.description,
      images: [{ url: image, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function composeNameFromDraft(draft: VehicleSeoInput): string {
  return composeVehicleName(draft);
}
