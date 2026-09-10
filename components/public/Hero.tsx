import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeroVideo } from "@/components/public/HeroVideo";
import type { SiteSettings } from "@/types";

export function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-dark">
      <HeroVideo />
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/75 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-black/40" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-20 pt-32 lg:px-8">
        <p className="text-xs uppercase tracking-[0.38em] text-gold">Premium Auto Dealership</p>
        <h1 className="mt-5 max-w-4xl font-display text-4xl text-white sm:text-6xl lg:text-7xl">
          {settings.heroTitle}
        </h1>
        <p className="mt-6 font-display text-2xl text-gold-champagne sm:text-3xl">
          {settings.heroSubtitle}
        </p>
        <p className="mt-4 max-w-xl text-base text-white/75">{settings.heroSupporting}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/vehicles">
            <Button size="lg">Browse Vehicles</Button>
          </Link>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Us
            </Button>
          </Link>
          <Link href="/test-drive">
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/15 transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:text-gold"
            >
              Book a Test Drive
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
