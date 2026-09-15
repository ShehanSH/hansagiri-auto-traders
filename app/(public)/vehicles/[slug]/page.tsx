import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/public/InquiryForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { StickyMobileCta } from "@/components/public/StickyMobileCta";
import { VehicleActions } from "@/components/public/VehicleActions";
import { VehicleFeatures } from "@/components/public/VehicleFeatures";
import { VehicleGallery } from "@/components/public/VehicleGallery";
import { VehicleSpecs } from "@/components/public/VehicleSpecs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getSettings } from "@/lib/services/settings.server";
import { getVehicleBySlug } from "@/lib/services/vehicles";
import { buildPageMetadata, resolveVehicleSeo } from "@/lib/seo/content";
import { breadcrumbJsonLd, vehicleJsonLd } from "@/lib/seo/jsonld";
import { formatPrice, vehicleTitle } from "@/utils/format";
import { toTelHref } from "@/utils/phone";
import { toWhatsAppHref, vehicleInterestMessage } from "@/utils/whatsapp";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [vehicle, settings] = await Promise.all([getVehicleBySlug(slug), getSettings()]);
  if (!vehicle) return { title: "Vehicle" };
  const seo = resolveVehicleSeo(vehicle, settings.businessName);
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/vehicles/${vehicle.slug}`,
    image: vehicle.primaryImage || "/cover.jpg",
    businessName: settings.businessName,
  });
}

export default async function VehicleDetailPage({ params }: Props) {
  const { slug } = await params;
  const [vehicle, settings] = await Promise.all([getVehicleBySlug(slug), getSettings()]);
  if (!vehicle) notFound();

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 pb-28 lg:px-8 lg:pb-16">
      <JsonLd data={vehicleJsonLd(vehicle, settings)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Vehicles", path: "/vehicles" },
          { name: title, path: `/vehicles/${vehicle.slug}` },
        ])}
      />
      <p className="text-xs uppercase tracking-[0.2em] text-gold">
        <Link href="/vehicles">Vehicles</Link> / {vehicle.stockId}
      </p>
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <VehicleGallery images={vehicle.images} title={title} />
        <div className="min-w-0">
          <StatusBadge status={vehicle.status} />
          <h1 className="mt-4 font-display text-4xl text-white">{title}</h1>
          <p className="mt-4 text-3xl text-gold-champagne">
            {formatPrice(vehicle.price, vehicle.currency || settings.currency)}
          </p>
          <VehicleActions
            tel={tel}
            whatsapp={wa}
            testDriveHref={`/test-drive?vehicle=${vehicle.id}`}
          />
          <div className="mt-10">
            <VehicleSpecs vehicle={vehicle} />
          </div>
        </div>
      </div>

      {vehicle.description ? (
        <section className="mt-14 max-w-3xl">
          <h2 className="font-display text-2xl">Description</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-white/75">
            {vehicle.description}
          </p>
        </section>
      ) : null}

      <VehicleFeatures features={vehicle.features} />

      <section id="enquiry" className="mt-16 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl">Send Inquiry</h2>
          <p className="mt-3 text-sm text-muted">
            No account needed. Tell us how to reach you and we will follow up.
          </p>
        </div>
        <InquiryForm
          vehicleId={vehicle.id}
          vehicleLabel={title}
          source="vehicle_detail"
        />
      </section>
      <StickyMobileCta vehicle={vehicle} settings={settings} />
    </div>
  );
}
