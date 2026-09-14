import type { Metadata } from "next";
import { getSettings } from "@/lib/services/settings.server";
import { buildPageMetadata, clipSeo, resolveSiteSeo } from "@/lib/seo/content";

export async function marketingPageMetadata(
  path: string,
  title: string,
  description: string,
): Promise<Metadata> {
  const settings = await getSettings();
  const site = resolveSiteSeo(settings);
  return buildPageMetadata({
    title: clipSeo(`${title} | ${settings.businessName}`, 70),
    description: description.trim() || site.description,
    path,
    businessName: settings.businessName,
  });
}
