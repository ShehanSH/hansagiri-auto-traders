import type { MetadataRoute } from "next";
import { listPublicVehicles } from "@/lib/services/vehicles";
import { getSiteUrl } from "@/lib/seo/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const lastModified = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: base, lastModified, changeFrequency: "daily", priority: 1 },
    { url: `${base}/vehicles`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/services`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/test-drive`, lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/trade-in`, lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/financing`, lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/privacy-policy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const vehicles = await listPublicVehicles({ page: 1, pageSize: 200 });
    return [
      ...routes,
      ...vehicles.items.map((vehicle) => ({
        url: `${base}/vehicles/${vehicle.slug}`,
        lastModified: new Date(vehicle.updatedAt || lastModified),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    return routes;
  }
}
