import Image from "next/image";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { SiteSettings, Vehicle } from "@/types";
import { formatMileage, formatPrice, vehicleTitle } from "@/utils/format";

export function VehicleCard({
  vehicle,
  settings,
}: {
  vehicle: Vehicle;
  settings: SiteSettings;
}) {
  const title = vehicleTitle(vehicle);
  const href = `/vehicles/${vehicle.slug}`;
  const specs = [
    formatMileage(vehicle.mileage),
    vehicle.fuelType,
    vehicle.transmission,
    vehicle.location || "Showroom",
  ];

  return (
    <article className="surface-card group flex h-full min-w-0 flex-col overflow-hidden">
      <Link href={href} className="relative block aspect-[16/10] w-full overflow-hidden bg-charcoal">
        {vehicle.primaryImage ? (
          <Image
            src={vehicle.primaryImage}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
        <div className="absolute left-3 top-3">
          <StatusBadge status={vehicle.status} overlay />
        </div>
        <span className="absolute bottom-3 left-3 bg-black/70 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-gold">
          {vehicle.vehicleType === "new" ? "New" : "Pre-owned"}
        </span>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{vehicle.year}</p>
        <h3 className="mt-2 font-display text-xl leading-snug text-white">
          <Link href={href} className="line-clamp-2">
            {title}
          </Link>
        </h3>
        <p className="mt-3 text-xl text-gold-champagne">
          {formatPrice(vehicle.price, vehicle.currency || settings.currency)}
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {specs.map((item) => (
            <li
              key={item}
              className="border border-white/10 px-2.5 py-1 text-xs whitespace-nowrap text-white/80"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
          <Link
            href={href}
            className="flex flex-1 items-center justify-center bg-gold px-3 py-2.5 text-center text-[11px] uppercase tracking-[0.16em] text-dark"
          >
            View Details
          </Link>
          <Link
            href={`/contact?vehicle=${encodeURIComponent(title)}`}
            className="flex flex-1 items-center justify-center border border-gold px-3 py-2.5 text-center text-[11px] uppercase tracking-[0.16em] text-gold transition-all duration-300 hover:bg-gold hover:text-dark"
          >
            Enquire
          </Link>
        </div>
        <Link
          href={`/test-drive?vehicle=${vehicle.id}`}
          className="mt-3 block py-2.5 text-center text-[11px] uppercase tracking-[0.16em] text-gold-champagne transition-all duration-300 hover:bg-gold/10 hover:text-gold"
        >
          Book Test Drive
        </Link>
      </div>
    </article>
  );
}

export function VehicleGrid({
  vehicles,
  settings,
  columns = 3,
}: {
  vehicles: Vehicle[];
  settings: SiteSettings;
  columns?: 2 | 3;
}) {
  const layout =
    columns === 2
      ? "grid grid-cols-1 gap-6 sm:grid-cols-2"
      : "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={layout}>
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} settings={settings} />
      ))}
    </div>
  );
}
