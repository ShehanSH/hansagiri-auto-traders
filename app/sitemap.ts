import type { MetadataRoute } from "next";
import { listPublicVehicles } from "@/lib/services/vehicles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://hansagiriautotraders.example";
  const routes = [
    "",
    "/vehicles",
    "/about",
    "/services",
    "/contact",
    "/test-drive",
    "/trade-in",
    "/financing",
    "/privacy-policy",
    "/terms",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  try {
    const vehicles = await listPublicVehicles({ page: 1, pageSize: 200 });
    return [
      ...routes,
      ...vehicles.items.map((vehicle) => ({
        url: `${base}/vehicles/${vehicle.slug}`,
        lastModified: new Date(vehicle.updatedAt),
      })),
    ];
  } catch {
    return routes;
  }
}
