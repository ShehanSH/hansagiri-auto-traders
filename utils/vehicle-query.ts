import { PUBLIC_VEHICLE_STATUSES } from "@/config/constants";
import type {
  SiteSettings,
  Vehicle,
  VehicleFilters,
  VehicleSort,
  VehicleStatus,
} from "@/types";

export function publicStatuses(settings: SiteSettings): VehicleStatus[] {
  const statuses: VehicleStatus[] = ["available"];
  if (settings.showReservedVehicles) statuses.push("reserved");
  if (settings.showSoldVehicles) statuses.push("sold");
  return statuses;
}

export function isPubliclyVisible(
  vehicle: Vehicle,
  settings: SiteSettings,
): boolean {
  if (vehicle.status === "draft" || vehicle.status === "archived") return false;
  return publicStatuses(settings).includes(vehicle.status);
}

export function matchesKeyword(vehicle: Vehicle, keyword: string): boolean {
  const q = keyword.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    vehicle.name,
    vehicle.make,
    vehicle.model,
    vehicle.variant,
    vehicle.stockId,
    String(vehicle.year),
    vehicle.searchKeywords.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function filterVehicles(
  vehicles: Vehicle[],
  filters: VehicleFilters,
  settings?: SiteSettings,
): Vehicle[] {
  return vehicles.filter((vehicle) => {
    if (settings && !isPubliclyVisible(vehicle, settings)) return false;
    if (!settings && vehicle.status === "draft") return false;

    if (filters.keyword && !matchesKeyword(vehicle, filters.keyword)) {
      return false;
    }
    if (filters.make && vehicle.make !== filters.make) return false;
    if (filters.model && vehicle.model !== filters.model) return false;
    if (filters.vehicleType && vehicle.vehicleType !== filters.vehicleType) {
      return false;
    }
    if (filters.fuelType && vehicle.fuelType !== filters.fuelType) return false;
    if (filters.transmission && vehicle.transmission !== filters.transmission) {
      return false;
    }
    if (filters.bodyType && vehicle.bodyType !== filters.bodyType) return false;
    if (filters.status && vehicle.status !== filters.status) return false;
    if (filters.featured !== undefined && vehicle.featured !== filters.featured) {
      return false;
    }
    if (filters.yearMin && vehicle.year < filters.yearMin) return false;
    if (filters.yearMax && vehicle.year > filters.yearMax) return false;
    if (filters.priceMin && vehicle.price < filters.priceMin) return false;
    if (filters.priceMax && vehicle.price > filters.priceMax) return false;
    if (filters.mileageMax && vehicle.mileage > filters.mileageMax) return false;
    return true;
  });
}

export function sortVehicles(
  vehicles: Vehicle[],
  sort: VehicleSort = "newest",
): Vehicle[] {
  const copy = [...vehicles];
  copy.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "year_desc":
        return b.year - a.year;
      case "mileage_asc":
        return a.mileage - b.mileage;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
  return copy;
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; page: number; pageSize: number; hasMore: boolean } {
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    total: items.length,
    page: safePage,
    pageSize,
    hasMore: start + pageSize < items.length,
  };
}

export function uniqueMakes(vehicles: Vehicle[]): string[] {
  return [...new Set(vehicles.map((item) => item.make))].sort();
}

export function uniqueModels(vehicles: Vehicle[], make?: string): string[] {
  return [
    ...new Set(
      vehicles
        .filter((item) => !make || item.make === make)
        .map((item) => item.model),
    ),
  ].sort();
}

export function assertPublicStatus(status: VehicleStatus): boolean {
  return PUBLIC_VEHICLE_STATUSES.includes(status);
}
