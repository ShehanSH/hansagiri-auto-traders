import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES } from "@/config/constants";
import { marketingPageMetadata } from "@/lib/seo/pages";

export async function generateMetadata(): Promise<Metadata> {
  return marketingPageMetadata(
    "/services",
    "Services",
    "Vehicle sales, sourcing, trade-in assistance, financing introductions, and test drives.",
  );
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">Services</p>
      <h1 className="mt-3 font-display text-4xl text-white">How we can help</h1>
      <p className="mt-4 max-w-2xl text-muted">
        From finding a vehicle to arranging a test drive or trade-in review, the process stays
        straightforward.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {SERVICES.map((service) => (
          <article key={service.slug} className="surface-card p-8">
            <h2 className="font-display text-2xl text-white">{service.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{service.description}</p>
          </article>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/vehicles" className="bg-gold px-6 py-3 text-xs uppercase tracking-[0.16em] text-dark">
          Browse Vehicles
        </Link>
        <Link href="/contact" className="border border-gold px-6 py-3 text-xs uppercase tracking-[0.16em] text-gold">
          Contact Us
        </Link>
      </div>
    </div>
  );
}
