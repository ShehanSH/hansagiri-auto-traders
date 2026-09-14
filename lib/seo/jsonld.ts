import type { SiteSettings, Vehicle } from "@/types";
import { getSiteUrl } from "@/lib/seo/content";
import { vehicleTitle } from "@/utils/format";

export function dealerJsonLd(settings: SiteSettings) {
  const url = getSiteUrl();
  const sameAs = [
    settings.social.facebook,
    settings.social.instagram,
    settings.social.tiktok,
    settings.social.youtube,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: settings.businessName,
    description: settings.businessDescription,
    url,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    image: `${url}/logonew.png`,
    address: settings.address
      ? {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressCountry: "LK",
        }
      : undefined,
    openingHoursSpecification: settings.openingHours
      .filter((item) => !item.closed)
      .map((item) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: item.day,
        opens: item.hours,
      })),
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function vehicleJsonLd(vehicle: Vehicle, settings: SiteSettings) {
  const title = vehicleTitle(vehicle);
  const url = `${getSiteUrl()}/vehicles/${vehicle.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: title,
    sku: vehicle.stockId,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    vehicleIdentificationNumber: vehicle.stockId,
    color: vehicle.color || undefined,
    vehicleTransmission: vehicle.transmission,
    fuelType: vehicle.fuelType,
    bodyType: vehicle.bodyType,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    },
    itemCondition:
      vehicle.vehicleType === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      url,
      price: vehicle.price,
      priceCurrency: vehicle.currency || settings.currency,
      availability:
        vehicle.status === "available"
          ? "https://schema.org/InStock"
          : vehicle.status === "reserved"
            ? "https://schema.org/PreOrder"
            : "https://schema.org/SoldOut",
      seller: { "@type": "AutoDealer", name: settings.businessName },
    },
    image: vehicle.images.map((item) => item.url),
    description: vehicle.seoDescription || vehicle.description || title,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  const origin = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}

export function vehicleListJsonLd(vehicles: Vehicle[], settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Vehicles at ${settings.businessName}`,
    itemListElement: vehicles.map((vehicle, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${getSiteUrl()}/vehicles/${vehicle.slug}`,
      name: vehicleTitle(vehicle),
    })),
  };
}
