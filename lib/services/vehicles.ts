import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { PAGE_SIZE } from "@/config/constants";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/env";
import { getSettings } from "@/lib/services/settings";
import { nowIso } from "@/lib/firebase/timestamps";
import { AppError } from "@/utils/errors";
import { buildSearchKeywords, vehicleSlug } from "@/utils/slug";
import {
  filterVehicles,
  isPubliclyVisible,
  paginate,
  publicStatuses,
  sortVehicles,
} from "@/utils/vehicle-query";
import type {
  PaginatedResult,
  Vehicle,
  VehicleFilters,
  VehicleImage,
  VehicleSort,
  VehicleStatus,
} from "@/types";
import type { VehicleInput } from "@/lib/validation/vehicle";

function decorateVehicle(
  input: VehicleInput,
  extras: {
    id?: string;
    images?: VehicleImage[];
    createdAt?: string;
    createdBy?: string;
    updatedBy?: string;
  },
): Vehicle {
  const timestamp = nowIso();
  const images = extras.images ?? [];
  return {
    id: extras.id ?? "",
    slug: vehicleSlug(input),
    stockId: input.stockId,
    make: input.make,
    model: input.model,
    variant: input.variant ?? "",
    year: input.year,
    price: input.price,
    currency: input.currency ?? "LKR",
    mileage: input.mileage,
    fuelType: input.fuelType,
    transmission: input.transmission,
    bodyType: input.bodyType,
    engine: input.engine ?? "",
    color: input.color ?? "",
    condition: input.condition ?? "",
    registrationStatus: input.registrationStatus ?? "",
    description: input.description ?? "",
    features: input.features ?? [],
    images,
    primaryImage: images[0]?.url ?? "",
    location: input.location ?? "",
    vehicleType: input.vehicleType,
    status: input.status,
    featured: input.featured ?? false,
    searchKeywords: buildSearchKeywords(input),
    createdAt: extras.createdAt ?? timestamp,
    updatedAt: timestamp,
    createdBy: extras.createdBy ?? "",
    updatedBy: extras.updatedBy ?? extras.createdBy ?? "",
  };
}

export async function listPublicVehicles(options: {
  filters?: VehicleFilters;
  sort?: VehicleSort;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Vehicle>> {
  const settings = await getSettings();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? PAGE_SIZE;
  const filters = options.filters ?? {};
  const sort = options.sort ?? "newest";

  if (isDemoMode()) {
    const visible = sortVehicles(
      filterVehicles(demoStore.vehicles, filters, settings),
      sort,
    );
    return paginate(visible, page, pageSize);
  }

  const statuses = publicStatuses(settings);
  const constraints = [where("status", "in", statuses.slice(0, 10))];

  if (filters.make) constraints.push(where("make", "==", filters.make));
  if (filters.model) constraints.push(where("model", "==", filters.model));
  if (filters.vehicleType) {
    constraints.push(where("vehicleType", "==", filters.vehicleType));
  }
  if (filters.fuelType) constraints.push(where("fuelType", "==", filters.fuelType));
  if (filters.transmission) {
    constraints.push(where("transmission", "==", filters.transmission));
  }
  if (filters.bodyType) constraints.push(where("bodyType", "==", filters.bodyType));

  const order =
    sort === "price_asc" || sort === "price_desc"
      ? orderBy("price", sort === "price_asc" ? "asc" : "desc")
      : sort === "year_desc"
        ? orderBy("year", "desc")
        : sort === "mileage_asc"
          ? orderBy("mileage", "asc")
          : orderBy("createdAt", "desc");

  const snapshot = await getDocs(
    query(collection(getDb(), COLLECTIONS.vehicles), ...constraints, order, limit(120)),
  );
  const vehicles = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Vehicle);
  const visible = sortVehicles(filterVehicles(vehicles, filters, settings), sort);
  return paginate(visible, page, pageSize);
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  const settings = await getSettings();
  const limitCount = settings.featuredLimit || 6;

  if (isDemoMode()) {
    return demoStore.vehicles
      .filter((item) => item.featured && isPubliclyVisible(item, settings))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, limitCount);
  }

  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.vehicles),
      where("featured", "==", true),
      where("status", "in", publicStatuses(settings)),
      orderBy("createdAt", "desc"),
      limit(limitCount),
    ),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Vehicle);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const settings = await getSettings();

  if (isDemoMode()) {
    const vehicle = demoStore.vehicles.find((item) => item.slug === slug) ?? null;
    if (!vehicle || !isPubliclyVisible(vehicle, settings)) return null;
    return vehicle;
  }

  const snapshot = await getDocs(
    query(collection(getDb(), COLLECTIONS.vehicles), where("slug", "==", slug), limit(1)),
  );
  const vehicle = snapshot.docs[0]
    ? ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Vehicle)
    : null;
  if (!vehicle || !isPubliclyVisible(vehicle, settings)) return null;
  return vehicle;
}

export async function getVehicleById(
  id: string,
  options?: { admin?: boolean },
): Promise<Vehicle | null> {
  if (isDemoMode()) {
    const vehicle = demoStore.vehicles.find((item) => item.id === id) ?? null;
    if (!vehicle) return null;
    if (options?.admin) return vehicle;
    const settings = await getSettings();
    return isPubliclyVisible(vehicle, settings) ? vehicle : null;
  }

  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.vehicles, id));
  if (!snapshot.exists()) return null;
  const vehicle = { id: snapshot.id, ...snapshot.data() } as Vehicle;
  if (options?.admin) return vehicle;
  const settings = await getSettings();
  return isPubliclyVisible(vehicle, settings) ? vehicle : null;
}

export async function listAdminVehicles(options: {
  filters?: VehicleFilters;
  sort?: VehicleSort;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Vehicle>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const filters = options.filters ?? {};
  const sort = options.sort ?? "newest";

  if (isDemoMode()) {
    return paginate(
      sortVehicles(filterVehicles(demoStore.vehicles, filters), sort),
      page,
      pageSize,
    );
  }

  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.vehicles),
      orderBy("createdAt", "desc"),
      limit(200),
    ),
  );
  const vehicles = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Vehicle);
  return paginate(sortVehicles(filterVehicles(vehicles, filters), sort), page, pageSize);
}

export async function createVehicle(
  input: VehicleInput,
  userId: string,
): Promise<Vehicle> {
  const vehicle = decorateVehicle(input, { createdBy: userId, updatedBy: userId });

  if (isDemoMode()) {
    vehicle.id = demoStore.id("v");
    demoStore.vehicles.unshift(vehicle);
    return vehicle;
  }

  const ref = await addDoc(collection(getDb(), COLLECTIONS.vehicles), vehicle);
  await updateDoc(ref, { id: ref.id });
  return { ...vehicle, id: ref.id };
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleInput> & { images?: VehicleImage[]; primaryImage?: string },
  userId: string,
): Promise<Vehicle> {
  if (isDemoMode()) {
    const index = demoStore.vehicles.findIndex((item) => item.id === id);
    if (index < 0) throw new AppError("Vehicle not found", "not_found");
    const current = demoStore.vehicles[index];
    const merged = decorateVehicle(
      { ...current, ...input } as VehicleInput,
      {
        id,
        images: input.images ?? current.images,
        createdAt: current.createdAt,
        createdBy: current.createdBy,
        updatedBy: userId,
      },
    );
    if (input.primaryImage) merged.primaryImage = input.primaryImage;
    demoStore.vehicles[index] = merged;
    return merged;
  }

  const ref = doc(getDb(), COLLECTIONS.vehicles, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new AppError("Vehicle not found", "not_found");
  const current = { id, ...snapshot.data() } as Vehicle;
  const merged = decorateVehicle(
    { ...current, ...input } as VehicleInput,
    {
      id,
      images: input.images ?? current.images,
      createdAt: current.createdAt,
      createdBy: current.createdBy,
      updatedBy: userId,
    },
  );
  if (input.primaryImage) merged.primaryImage = input.primaryImage;
  await updateDoc(ref, { ...merged });
  return merged;
}

export async function setVehicleStatus(
  id: string,
  status: VehicleStatus,
  userId: string,
): Promise<void> {
  await updateVehicle(id, { status }, userId);
}

export async function archiveVehicle(id: string, userId: string): Promise<void> {
  await setVehicleStatus(id, "archived", userId);
}

export async function deleteVehicle(id: string): Promise<void> {
  if (isDemoMode()) {
    demoStore.vehicles = demoStore.vehicles.filter((item) => item.id !== id);
    return;
  }
  await deleteDoc(doc(getDb(), COLLECTIONS.vehicles, id));
}

export async function getFilterOptions(): Promise<{ makes: string[]; models: string[] }> {
  const result = await listPublicVehicles({ page: 1, pageSize: 120 });
  return {
    makes: [...new Set(result.items.map((item) => item.make))].sort(),
    models: [...new Set(result.items.map((item) => item.model))].sort(),
  };
}
