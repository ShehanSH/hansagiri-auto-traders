import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import type { SiteSettings } from "@/types";
import { toDirectionsHref } from "@/utils/maps";
import { toTelHref } from "@/utils/phone";
import { generalWhatsAppMessage, toWhatsAppHref } from "@/utils/whatsapp";

function todayHours(settings: SiteSettings): string {
  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "Asia/Colombo",
  }).format(new Date());
  const row = settings.openingHours.find((item) => item.day === today);
  if (!row) return "";
  return row.closed ? "Closed today" : `Open today · ${row.hours}`;
}

export function ContactIntro({ settings }: { settings: SiteSettings }) {
  const tel = toTelHref(settings.phone);
  const wa = toWhatsAppHref(
    settings.whatsapp || settings.phone,
    generalWhatsAppMessage(settings.businessName),
  );
  const directions = toDirectionsHref(settings.address);
  const hours = todayHours(settings);

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Contact</p>
      <h1 className="mt-3 font-display text-4xl text-white">Talk to the dealership</h1>
      <p className="mt-4 max-w-lg text-muted">
        Ask about a vehicle, check availability, or arrange a visit. Call, WhatsApp, or send a
        message and our team will follow up with the next step.
      </p>

      <ul className="mt-8 space-y-4 border border-gold/15 bg-dark-secondary/60 p-5">
        {settings.phone ? (
          <li className="flex items-start gap-3 text-sm">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Phone</p>
              {tel ? (
                <a href={tel} className="mt-1 inline-block text-white transition-colors hover:text-gold">
                  {settings.phone}
                </a>
              ) : (
                <p className="mt-1 text-white">{settings.phone}</p>
              )}
            </div>
          </li>
        ) : null}
        {settings.whatsapp || settings.phone ? (
          <li className="flex items-start gap-3 text-sm">
            <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">WhatsApp</p>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-white transition-colors hover:text-gold"
                >
                  {settings.whatsapp || settings.phone}
                </a>
              ) : (
                <p className="mt-1 text-white">{settings.whatsapp || settings.phone}</p>
              )}
            </div>
          </li>
        ) : null}
        {settings.email ? (
          <li className="flex items-start gap-3 text-sm">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Email</p>
              <a
                href={`mailto:${settings.email}`}
                className="mt-1 inline-block break-all text-white transition-colors hover:text-gold"
              >
                {settings.email}
              </a>
            </div>
          </li>
        ) : null}
        {settings.address ? (
          <li className="flex items-start gap-3 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Showroom</p>
              <p className="mt-1 text-white">{settings.address}</p>
              {directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.16em] text-gold transition-colors hover:text-gold-light"
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Get directions
                </a>
              ) : null}
            </div>
          </li>
        ) : null}
        {hours ? (
          <li className="flex items-start gap-3 text-sm">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Hours</p>
              <p className="mt-1 text-white">{hours}</p>
            </div>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
