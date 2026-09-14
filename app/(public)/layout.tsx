import type { Metadata } from "next";
import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { SettingsProvider } from "@/hooks/useSettings";
import { getSettings } from "@/lib/services/settings.server";
import { buildPageMetadata, resolveSiteSeo } from "@/lib/seo/content";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const seo = resolveSiteSeo(settings);
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: "/",
    businessName: settings.businessName,
  });
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <SettingsProvider settings={settings}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat settings={settings} />
    </SettingsProvider>
  );
}
