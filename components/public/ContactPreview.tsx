import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import type { SiteSettings } from "@/types";
import { toDirectionsHref } from "@/utils/maps";
import { toTelHref } from "@/utils/phone";
import { generalWhatsAppMessage, toWhatsAppHref } from "@/utils/whatsapp";

const DAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function shortDay(day: string): string {
  return DAY_SHORT[day] ?? day;
}

function compactHours(hours: string): string {
  return hours.replace(/\s*–\s*/g, " – ").replace(/\s*-\s*/g, " – ");
}

function ContactCard({
  icon,
  title,
  children,
  footer,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={`group flex h-full min-h-[220px] flex-col border border-gold/15 bg-gradient-to-b from-white/[0.04] to-transparent p-6 transition-colors hover:border-gold/30 ${className}`}
    >
      <div className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full bg-gold/10 px-3 text-gold transition-colors group-hover:bg-gold/15">
        {icon}
      </div>
      <h3 className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gold-champagne">{title}</h3>
      <div className="mt-3 flex-1 text-sm leading-relaxed text-white">{children}</div>
      {footer ? (
        <div className="mt-5 flex justify-center border-t border-white/5 pt-4">{footer}</div>
      ) : null}
    </article>
  );
}

function ContactAction({
  href,
  icon,
  label,
  external = false,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex items-center gap-2 rounded-sm border border-gold/20 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-gold transition-colors hover:border-gold/40 hover:bg-gold/5 hover:text-gold-light"
    >
      {icon}
      {label}
    </a>
  );
}

export function ContactPreview({ settings }: { settings: SiteSettings }) {
  const tel = toTelHref(settings.phone);
  const wa = toWhatsAppHref(
    settings.whatsapp || settings.phone,
    generalWhatsAppMessage(settings.businessName),
  );
  const directions = toDirectionsHref(settings.address);
  const displayPhone = settings.phone || settings.whatsapp;
  const hasContact = Boolean(displayPhone);

  return (
    <section className="bg-dark py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Visit & enquire</p>
        <h2 className="mt-3 font-display text-3xl text-white">Contact</h2>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:items-stretch">
          <ContactCard
            className="lg:col-span-3"
            icon={
              <>
                <Phone className="h-4 w-4" />
                <WhatsAppIcon className="h-4 w-4" />
              </>
            }
            title="Call & WhatsApp"
            footer={
              tel || wa ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {tel ? (
                    <ContactAction href={tel} icon={<Phone className="h-3.5 w-3.5" />} label="Call" />
                  ) : null}
                  {wa ? (
                    <ContactAction
                      href={wa}
                      external
                      icon={<WhatsAppIcon className="h-3.5 w-3.5" />}
                      label="WhatsApp"
                    />
                  ) : null}
                </div>
              ) : undefined
            }
          >
            {hasContact ? (
              <div className="space-y-2">
                {settings.phone ? (
                  <p>
                    <span className="text-muted">Phone · </span>
                    {tel ? (
                      <a href={tel} className="text-base hover:text-gold">
                        {settings.phone}
                      </a>
                    ) : (
                      <span className="text-base">{settings.phone}</span>
                    )}
                  </p>
                ) : null}
                {settings.whatsapp && settings.whatsapp !== settings.phone ? (
                  <p>
                    <span className="text-muted">WhatsApp · </span>
                    <span className="text-base">{settings.whatsapp}</span>
                  </p>
                ) : null}
              </div>
            ) : (
              <span className="text-muted">Add phone or WhatsApp in admin settings</span>
            )}
          </ContactCard>

          <ContactCard
            className="lg:col-span-3"
            icon={<Mail className="h-4 w-4" />}
            title="Email"
            footer={
              settings.email ? (
                <ContactAction
                  href={`mailto:${settings.email}`}
                  icon={<Mail className="h-3.5 w-3.5" />}
                  label="Send email"
                />
              ) : undefined
            }
          >
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="break-all text-base hover:text-gold">
                {settings.email}
              </a>
            ) : (
              <span className="text-muted">Add an email in admin settings</span>
            )}
          </ContactCard>

          <ContactCard
            className="lg:col-span-2"
            icon={<MapPin className="h-4 w-4" />}
            title="Location"
            footer={
              directions ? (
                <ContactAction
                  href={directions}
                  external
                  icon={<Navigation className="h-3.5 w-3.5" />}
                  label="Directions"
                />
              ) : undefined
            }
          >
            {settings.address ? (
              <span className="text-base">{settings.address}</span>
            ) : (
              <span className="text-muted">Address can be added in admin settings</span>
            )}
          </ContactCard>

          <ContactCard
            className="sm:col-span-2 lg:col-span-4"
            icon={<Clock className="h-4 w-4" />}
            title="Hours"
          >
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {settings.openingHours.map((item) => (
                <li
                  key={item.day}
                  className="flex items-center justify-between gap-4 border-b border-white/5 py-2 last:border-0"
                >
                  <span className="shrink-0 font-medium text-white">{shortDay(item.day)}</span>
                  <span className="whitespace-nowrap text-right text-muted">
                    {item.closed ? "Closed" : compactHours(item.hours)}
                  </span>
                </li>
              ))}
            </ul>
          </ContactCard>
        </div>
      </div>
    </section>
  );
}
