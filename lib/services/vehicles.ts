import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { BRAND_NAME, PAGE_SIZE, PUBLIC_VEHICLE_STATUSES } from "@/config/constants";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode, isFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { getSettings } from "@/lib/services/settings";
import { nowIso } from "@/lib/firebase/timestamps";
import { buildVehicleSeo } from "@/lib/seo/content";
import { AppError } from "@/utils/errors";
import { composeVehicleName } from "@/utils/format";
import { buildSearchKeywords, vehicleSlug } from "@/utils/slug";
import { nextStockId } from "@/utils/stock-id";
import {
  filterVehicles,
  isPubliclyVisible,
  paginate,
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
  const name = input.name?.trim() || composeVehicleName(input);
  const seo = buildVehicleSeo({ ...input, name }, BRAND_NAME);
  const images = (extras.images ?? []).map((image, index) => {
    const weakAlt = !image.alt?.trim() || /\.(jpe?g|png|webp|avif|gif)$/i.test(image.alt.trim());
    return {
      ...image,
      alt: weakAlt ? `${name} photo ${index + 1}` : image.alt,
    };
  });
  return {
    id: extras.id ?? "",
    slug: vehicleSlug(input),
    stockId: input.stockId,
    name,
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
    seoTitle: input.seoTitle?.trim() || seo.title,
    seoDescription: input.seoDescription?.trim() || seo.description,
    searchKeywords: buildSearchKeywords({ ...input, name }),
    createdAt: extras.createdAt ?? timestamp,
    updatedAt: timestamp,
    createdBy: extras.createdBy ?? "",
    updatedBy: extras.updatedBy ?? extras.createdBy ?? "",
  };
}

function persistableImages(images: VehicleImage[] = []): VehicleImage[] {
  return images.filter((image) => Boolean(image.url) && !image.url.startsWith("blob:"));
}

function stockKey(item: Pick<Vehicle, "stockId">): string {
  return (item.stockId ?? "").trim().toUpperCase();
}

function mergeVehicleLists(demo: Vehicle[], live: Vehicle[]): Vehicle[] {
  const removed = live.filter((item) => item.deleted);
  const removedIds = new Set(removed.map((item) => item.id));
  const removedStock = new Set(removed.map(stockKey).filter(Boolean));
  const visibleLive = live.filter((item) => !item.deleted);
  const liveIds = new Set(visibleLive.map((item) => item.id));
  const liveStock = new Set(visibleLive.map(stockKey).filter(Boolean));
  const keptDemo = demo.filter((item) => {
    const stock = stockKey(item);
    return (
      !removedIds.has(item.id) &&
      !liveIds.has(item.id) &&
      !(stock && removedStock.has(stock)) &&
      !(stock && liveStock.has(stock))
    );
  });
  return [...keptDemo, ...visibleLive];
}

async function fetchFirestoreVehicles(options?: { admin?: boolean }): Promise<Vehicle[]> {
  const vehiclesRef = collection(getDb(), COLLECTIONS.vehicles);
  const snapshot = options?.admin
    ? await getDocs(query(vehiclesRef, limit(400)))
    : await getDocs(
        query(vehiclesRef, where("status", "in", [...PUBLIC_VEHICLE_STATUSES]), limit(400)),
      );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Vehicle);
}

async function loadVehicles(options?: { admin?: boolean }): Promise<Vehicle[]> {
  if (isMemoryCatalog()) return [...demoStore.vehicles];
  if (!isFirebaseConfigured()) return isDemoMode() ? [...demoStore.vehicles] : [];
  const live = await fetchFirestoreVehicles(options);
  const merged = isDemoMode() ? mergeVehicleLists(demoStore.vehicles, live) : live;
  return merged.filter((item) => !item.deleted);
}

export async function listPublicVehicles(options: {
  filters?: VehicleFilters;
  sort?: VehicleSort;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Vehicle>> {
  try {
    const settings = await getSettings();
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? PAGE_SIZE;
    const filters = options.filters ?? {};
    const sort = options.sort ?? "newest";
    const vehicles = await loadVehicles();
    const visible = sortVehicles(filterVehicles(vehicles, filters, settings), sort);
    return paginate(visible, page, pageSize);
  } catch (error) {
    console.error("Failed to load vehicles", error);
    return paginate([], options.page ?? 1, options.pageSize ?? PAGE_SIZE);
  }
}

export async function getFeaturedVehicles(): Promise<Vehicle[]> {
  try {
    const settings = await getSettings();
    const limitCount = settings.featuredLimit || 6;

    const vehicles = await loadVehicles();
    return vehicles
      .filter((item) => item.featured && isPubliclyVisible(item, settings))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, limitCount);
  } catch (error) {
    console.error("Failed to load featured vehicles", error);
    return [];
  }
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  try {
    const settings = await getSettings();

    const vehicles = await loadVehicles();
    const vehicle = vehicles.find((item) => item.slug === slug) ?? null;
    if (!vehicle || !isPubliclyVisible(vehicle, settings)) return null;
    return vehicle;
  } catch (error) {
    console.error("Failed to load vehicle", error);
    return null;
  }
}

export async function getVehicleById(
  id: string,
  options?: { admin?: boolean },
): Promise<Vehicle | null> {
  const vehicles = await loadVehicles({ admin: options?.admin });
  const vehicle = vehicles.find((item) => item.id === id) ?? null;
  if (!vehicle) return null;
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

  const vehicles = await loadVehicles({ admin: true });
  return paginate(sortVehicles(filterVehicles(vehicles, filters), sort), page, pageSize);
}

export async function listStockIds(excludeId?: string): Promise<string[]> {
  return (await loadVehicles({ admin: true }))
    .filter((item) => item.id !== excludeId)
    .map((item) => item.stockId)
    .filter(Boolean);
}

export async function getNextStockId(excludeId?: string): Promise<string> {
  return nextStockId(await listStockIds(excludeId));
}

export async function createVehicle(
  input: VehicleInput,
  userId: string,
  images: VehicleImage[] = [],
): Promise<Vehicle> {
  const taken = (await listStockIds()).map((item) => item.toUpperCase());
  const requested = input.stockId?.trim().toUpperCase() ?? "";
  const stockId = requested && !taken.includes(requested) ? requested : nextStockId(taken);
  const vehicle = decorateVehicle(
    { ...input, stockId },
    { createdBy: userId, updatedBy: userId, images: persistableImages(images) },
  );

  if (isMemoryCatalog()) {
    vehicle.id = demoStore.id("v");
    demoStore.vehicles.unshift(vehicle);
    return vehicle;
  }

  const ref = await addDoc(collection(getDb(), COLLECTIONS.vehicles), vehicle);
  await updateDoc(ref, { id: ref.id });
  const saved = { ...vehicle, id: ref.id };
  demoStore.vehicles = mergeVehicleLists(demoStore.vehicles, [saved]);
  return saved;
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleInput> & { images?: VehicleImage[]; primaryImage?: string },
  userId: string,
): Promise<Vehicle> {
  const vehicles = await loadVehicles({ admin: true });
  const current = vehicles.find((item) => item.id === id);
  if (!current) throw new AppError("Vehicle not found", "not_found");

  const merged = decorateVehicle(
    { ...current, ...input, stockId: current.stockId } as VehicleInput,
    {
      id,
      images: persistableImages(input.images ?? current.images),
      createdAt: current.createdAt,
      createdBy: current.createdBy,
      updatedBy: userId,
    },
  );
  if (input.primaryImage && !input.primaryImage.startsWith("blob:")) {
    merged.primaryImage = input.primaryImage;
  }

  if (isMemoryCatalog()) {
    const index = demoStore.vehicles.findIndex((item) => item.id === id);
    if (index < 0) throw new AppError("Vehicle not found", "not_found");
    demoStore.vehicles[index] = merged;
    return merged;
  }

  await setDoc(doc(getDb(), COLLECTIONS.vehicles, id), { ...merged, id }, { merge: true });
  demoStore.vehicles = mergeVehicleLists(demoStore.vehicles, [merged]);
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

export async function deleteVehicle(id: string, stockId?: string): Promise<void> {
  const existing = demoStore.vehicles.find((item) => item.id === id);
  demoStore.vehicles = demoStore.vehicles.filter((item) => item.id !== id);
  if (isMemoryCatalog()) return;

  const ref = doc(getDb(), COLLECTIONS.vehicles, id);
  await setDoc(ref, {
    id,
    stockId: stockId || existing?.stockId || "",
    deleted: true,
    // Public reads only include available/reserved/sold. Keep this readable so
    // a deleted demo listing does not reappear from the seed catalog.
    status: "available" as VehicleStatus,
    updatedAt: nowIso(),
  });
}

export async function getFilterOptions(): Promise<{ makes: string[]; models: string[] }> {
  const result = await listPublicVehicles({ page: 1, pageSize: 400 });
  return {
    makes: [...new Set(result.items.map((item) => item.make).filter(Boolean))].sort(),
    models: [...new Set(result.items.map((item) => item.model).filter(Boolean))].sort(),
  };
}
