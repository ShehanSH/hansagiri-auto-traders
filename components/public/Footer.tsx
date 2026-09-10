import Link from "next/link";
import { Mail, MapPin, Navigation, Phone } from "lucide-react";
import { PUBLIC_NAV } from "@/config/constants";
import { BrandLogo } from "@/components/BrandLogo";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { SocialIconLinks } from "@/components/public/SocialLinks";
import type { SiteSettings } from "@/types";
import { toDirectionsHref } from "@/utils/maps";
import { toTelHref } from "@/utils/phone";
import { generalWhatsAppMessage, toWhatsAppHref } from "@/utils/whatsapp";

export function Footer({ settings }: { settings: SiteSettings }) {
  const tel = toTelHref(settings.phone);
  const wa = toWhatsAppHref(
    settings.whatsapp || settings.phone,
    generalWhatsAppMessage(settings.businessName),
  );
  const directions = toDirectionsHref(settings.address);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gold/15 bg-dark-secondary">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <BrandLogo size="lg" />
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            {settings.businessDescription}
          </p>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-gold">Vehicles</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <Link href="/vehicles">All vehicles</Link>
            </li>
            <li>
              <Link href="/vehicles?type=new">New vehicles</Link>
            </li>
            <li>
              <Link href="/vehicles?type=used">Pre-owned vehicles</Link>
            </li>
            <li>
              <Link href="/trade-in">Trade-in</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-gold">Quick links</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {PUBLIC_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] text-gold">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            {settings.phone ? (
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gold" />
                {tel ? <a href={tel}>{settings.phone}</a> : settings.phone}
              </li>
            ) : null}
            {wa ? (
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-gold" />
                <a href={wa} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            ) : null}
            {settings.address ? (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>
                  {settings.address}
                  {directions ? (
                    <a
                      href={directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-gold"
                    >
                      <Navigation className="h-3 w-3" />
                      Get directions
                    </a>
                  ) : null}
                </span>
              </li>
            ) : null}
            {!settings.phone && !wa && !settings.email && !settings.address ? (
              <li>Contact details can be added in admin settings</li>
            ) : null}
          </ul>
          {(settings.social.facebook ||
            settings.social.instagram ||
            settings.social.tiktok ||
            settings.social.youtube) ? (
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-champagne">Follow</p>
              <SocialIconLinks settings={settings} className="mt-3" />
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {year} {settings.businessName}
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
