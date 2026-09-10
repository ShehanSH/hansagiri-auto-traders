import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";
import { ContactPreview } from "@/components/public/ContactPreview";
import { getSettings } from "@/lib/services/settings.server";
import { toMapsEmbedSrc } from "@/utils/maps";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, message, or visit Hansagiri Auto Traders.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const settings = await getSettings();
  const { vehicle } = await searchParams;
  const maps = toMapsEmbedSrc(settings.address, settings.mapsUrl);

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">Contact</p>
          <h1 className="mt-3 font-display text-4xl text-white">Talk to the dealership</h1>
          <p className="mt-4 text-muted">
            Send a message, call, or use WhatsApp. You do not need an account.
          </p>
          {maps ? (
            <div className="mt-8 overflow-hidden border border-gold/15">
              <iframe
                title="Map"
                src={maps}
                className="h-72 w-full grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted">
              Google Maps can be added from admin settings when the business location is confirmed.
            </p>
          )}
        </div>
        <ContactForm subject={vehicle ? `Enquiry: ${vehicle}` : ""} />
      </div>
      <ContactPreview settings={settings} />
    </div>
  );
}
