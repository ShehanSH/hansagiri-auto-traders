import Link from "next/link";
import { ContactPreview } from "@/components/public/ContactPreview";
import { Hero } from "@/components/public/Hero";
import { CtaSection, NewPreownedSplit, WhyChooseUs } from "@/components/public/Sections";
import { VehicleGrid } from "@/components/public/VehicleCard";
import { EmptyState } from "@/components/ui/Feedback";
import { getSettings } from "@/lib/services/settings.server";
import { getFeaturedVehicles } from "@/lib/services/vehicles";
import { JsonLd } from "@/components/seo/JsonLd";
import { dealerJsonLd } from "@/lib/seo/jsonld";

export default async function HomePage() {
  const [settings, featured] = await Promise.all([getSettings(), getFeaturedVehicles()]);

  return (
    <>
      <JsonLd data={dealerJsonLd(settings)} />
      <Hero settings={settings} />
      <section className="bg-dark py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-gold">Featured vehicles</p>
              <h2 className="mt-3 font-display text-3xl text-white">Selected vehicles</h2>
            </div>
            <Link href="/vehicles" className="text-xs uppercase tracking-[0.16em] text-gold">
              View all vehicles
            </Link>
          </div>
          <div className="mt-10">
            {featured.length ? (
              <VehicleGrid vehicles={featured} settings={settings} />
            ) : (
              <EmptyState
                title="No featured vehicles yet"
                description="Published featured vehicles will appear here."
              />
            )}
          </div>
        </div>
      </section>
      <WhyChooseUs />
      <NewPreownedSplit />
      <CtaSection />
      <ContactPreview settings={settings} />
    </>
  );
}
