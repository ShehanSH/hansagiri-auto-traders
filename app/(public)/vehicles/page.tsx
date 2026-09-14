import type { Metadata } from "next";
import { Suspense } from "react";
import { VehicleFilters } from "@/components/public/VehicleFilters";
import { VehicleGrid } from "@/components/public/VehicleCard";
import { VehiclePagination, VehicleToolbar } from "@/components/public/VehicleToolbar";
import { EmptyState } from "@/components/ui/Feedback";
import { PAGE_SIZE } from "@/config/constants";
import { getSettings } from "@/lib/services/settings.server";
import { getFilterOptions, listPublicVehicles } from "@/lib/services/vehicles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata, clipSeo } from "@/lib/seo/content";
import { vehicleListJsonLd } from "@/lib/seo/jsonld";
import type { BodyType, FuelType, Transmission, VehicleSort, VehicleType } from "@/types";

type Search = Promise<{
  q?: string;
  type?: string;
  make?: string;
  fuel?: string;
  transmission?: string;
  body?: string;
  yearMin?: string;
  yearMax?: string;
  priceMin?: string;
  priceMax?: string;
  mileageMax?: string;
  sort?: string;
  page?: string;
}>;

export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const params = await searchParams;
  const settings = await getSettings();
  const focus = [params.make, params.q].filter(Boolean).join(" ");
  const title = focus
    ? clipSeo(`${focus} cars for sale | ${settings.businessName}`, 70)
    : clipSeo(`Vehicles for sale | ${settings.businessName}`, 70);
  const description = clipSeo(
    focus
      ? `Browse ${focus} new and pre-owned vehicles at ${settings.businessName}.`
      : `Browse new and pre-owned vehicles at ${settings.businessName}. Transparent pricing, test drives, and trade-in assistance.`,
    180,
  );
  return buildPageMetadata({
    title,
    description,
    path: "/vehicles",
    businessName: settings.businessName,
  });
}

export default async function VehiclesPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const settings = await getSettings();
  const page = Number(params.page || "1") || 1;
  const result = await listPublicVehicles({
    page,
    pageSize: PAGE_SIZE,
    sort: (params.sort as VehicleSort) || "newest",
    filters: {
      keyword: params.q,
      vehicleType: (params.type as VehicleType) || "",
      make: params.make,
      fuelType: (params.fuel as FuelType) || "",
      transmission: (params.transmission as Transmission) || "",
      bodyType: (params.body as BodyType) || "",
      yearMin: params.yearMin ? Number(params.yearMin) : undefined,
      yearMax: params.yearMax ? Number(params.yearMax) : undefined,
      priceMin: params.priceMin ? Number(params.priceMin) : undefined,
      priceMax: params.priceMax ? Number(params.priceMax) : undefined,
      mileageMax: params.mileageMax ? Number(params.mileageMax) : undefined,
    },
  });
  const { makes: allMakes } = await getFilterOptions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
      <JsonLd data={vehicleListJsonLd(result.items, settings)} />
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Showroom</p>
        <h1 className="mt-3 font-display text-4xl text-white sm:text-5xl">Vehicles</h1>
        <p className="mt-4 text-muted">
          New and pre-owned cars available now. Availability can change — contact us to confirm.
        </p>
      </header>
      <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-start">
        <Suspense>
          <VehicleFilters makes={allMakes} />
        </Suspense>
        <section className="min-w-0 flex-1">
          <Suspense>
            <VehicleToolbar total={result.total} />
          </Suspense>
          {result.items.length ? (
            <VehicleGrid vehicles={result.items} settings={settings} columns={2} />
          ) : (
            <EmptyState
              title="No vehicles match your search."
              description="Try clearing filters or browse all vehicles."
            />
          )}
          <div className="mt-10">
            <Suspense>
              <VehiclePagination page={result.page} pageSize={result.pageSize} total={result.total} />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  );
}
