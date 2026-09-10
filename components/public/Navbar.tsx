"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { PUBLIC_NAV } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { toTelHref } from "@/utils/phone";
import { generalWhatsAppMessage, toWhatsAppHref } from "@/utils/whatsapp";

export function Navbar() {
  const pathname = usePathname();
  const overlay = pathname === "/";
  const settings = useSettings();
  const [open, setOpen] = useState(false);
  const tel = toTelHref(settings.phone);
  const wa = toWhatsAppHref(
    settings.whatsapp || settings.phone,
    generalWhatsAppMessage(settings.businessName),
  );

  return (
    <header
      className={`z-40 w-full ${
        overlay
          ? "absolute inset-x-0 top-0 bg-gradient-to-b from-black/80 to-transparent"
          : "sticky top-0 border-b border-gold/15 bg-dark/95 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setOpen(false)}>
          <BrandLogo size="md" priority />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {PUBLIC_NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs uppercase tracking-[0.18em] transition-colors ${
                  active ? "text-gold" : "text-white/80 hover:text-gold"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {tel ? (
            <a href={tel} className="text-gold hover:text-gold-light" aria-label="Call">
              <Phone className="h-4 w-4" />
            </a>
          ) : null}
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
          ) : null}
          <Link href="/vehicles">
            <Button size="sm">Browse Vehicles</Button>
          </Link>
        </div>

        <button
          type="button"
          className="p-2 text-gold lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-gold/15 bg-dark px-4 py-6 lg:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm uppercase tracking-[0.18em] text-white"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/vehicles" onClick={() => setOpen(false)}>
              <Button className="w-full">Browse Vehicles</Button>
            </Link>
            {tel ? (
              <a href={tel} className="inline-flex items-center gap-2 text-sm text-gold">
                <Phone className="h-4 w-4" />
                Call {settings.phone}
              </a>
            ) : null}
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gold"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WhatsApp
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
