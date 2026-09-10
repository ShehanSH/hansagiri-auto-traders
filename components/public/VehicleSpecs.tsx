import type { Vehicle } from "@/types";
import { formatMileage } from "@/utils/format";

export function VehicleSpecs({ vehicle }: { vehicle: Vehicle }) {
  const rows = [
    ["Make", vehicle.make],
    ["Model", vehicle.model],
    ["Variant", vehicle.variant],
    ["Year", String(vehicle.year)],
    ["Mileage", formatMileage(vehicle.mileage)],
    ["Fuel", vehicle.fuelType],
    ["Transmission", vehicle.transmission],
    ["Body type", vehicle.bodyType],
    ["Engine", vehicle.engine],
    ["Color", vehicle.color],
    ["Condition", vehicle.condition],
    ["Registration", vehicle.registrationStatus],
    ["Location", vehicle.location],
    ["Stock ID", vehicle.stockId],
  ].filter(([, value]) => value);

  return (
    <dl className="grid gap-px bg-white/10 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 bg-dark-secondary px-4 py-3">
          <dt className="text-xs uppercase tracking-[0.14em] text-muted">{label}</dt>
          <dd className="text-sm text-white">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
