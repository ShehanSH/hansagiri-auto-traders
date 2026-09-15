"use client";

import { Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import type { SiteSettings, Vehicle } from "@/types";
import { vehicleTitle } from "@/utils/format";
import { toTelHref } from "@/utils/phone";
import { toWhatsAppHref, vehicleInterestMessage } from "@/utils/whatsapp";

export function StickyMobileCta({
  vehicle,
  settings,
}: {
  vehicle: Vehicle;
  settings: SiteSettings;
}) {
  const title = vehicleTitle(vehicle);
  const tel = toTelHref(settings.phone);
  const wa = toWhatsAppHref(
    settings.whatsapp || settings.phone,
    vehicleInterestMessage({
      businessName: settings.businessName,
      title,
      stockId: vehicle.stockId,
    }),
  );

  if (!tel && !wa) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-gold/20 bg-dark/95 p-3 backdrop-blur lg:hidden">
      {tel ? (
        <a
          href={tel}
          className="mr-1 flex items-center justify-center gap-2 bg-gold py-3 text-xs uppercase tracking-[0.16em] text-dark transition-colors duration-200 hover:bg-gold-light"
        >
          <Phone className="h-4 w-4" /> Call Now
        </a>
      ) : (
        <span />
      )}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 flex items-center justify-center gap-2 border border-gold py-3 text-xs uppercase tracking-[0.16em] text-gold transition-colors duration-200 hover:bg-gold hover:text-dark"
        >
          <WhatsAppIcon className="h-4 w-4" />
          WhatsApp
        </a>
      ) : null}
    </div>
  );
}
