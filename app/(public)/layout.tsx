import { Footer } from "@/components/public/Footer";
import { Navbar } from "@/components/public/Navbar";
import { WhatsAppFloat } from "@/components/public/WhatsAppFloat";
import { SettingsProvider } from "@/hooks/useSettings";
import { getSettings } from "@/lib/services/settings.server";

export const dynamic = "force-dynamic";

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
