import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { ContactIntro } from "@/components/public/ContactIntro";
import { ContactPreview } from "@/components/public/ContactPreview";
import { getSettings } from "@/lib/services/settings.server";
import { marketingPageMetadata } from "@/lib/seo/pages";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return marketingPageMetadata(
    "/contact",
    "Contact",
    `Call, message, or visit ${settings.businessName}${settings.address ? ` at ${settings.address}` : ""}.`,
  );
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const settings = await getSettings();
  const { vehicle } = await searchParams;

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <ContactIntro settings={settings} />
        <ContactForm subject={vehicle ? `Enquiry: ${vehicle}` : ""} />
      </div>
      <ContactPreview settings={settings} />
    </div>
  );
}
