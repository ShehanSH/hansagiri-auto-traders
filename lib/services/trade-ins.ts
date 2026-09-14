import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { ensureDemoCrmLoaded } from "@/lib/demo/sync-crm";
import { isDemoMode } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { customerDocId, upsertDemoCustomer } from "@/lib/services/customers-shared";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { TradeInInput } from "@/lib/validation/trade-in";
import type {
  AdminNote,
  PaginatedResult,
  TradeInRequest,
  TradeInStatus,
  VehicleImage,
} from "@/types";

function toTradeIn(
  id: string,
  input: TradeInInput,
  customerId: string,
  images: VehicleImage[],
): TradeInRequest {
  const timestamp = nowIso();
  return {
    id,
    name: input.name,
    phone: input.phone,
    email: input.email,
    make: input.make,
    model: input.model,
    year: input.year,
    mileage: input.mileage,
    fuelType: input.fuelType || "",
    transmission: input.transmission || "",
    condition: input.condition,
    registrationStatus: input.registrationStatus,
    expectedPrice: input.expectedPrice ?? null,
    notes: input.notes || "",
    images,
    status: "new",
    valuationNotes: "",
    estimatedValuation: null,
    adminNotes: [],
    customerId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function submitTradeIn(
  input: TradeInInput,
  images: VehicleImage[],
): Promise<string> {
  if (!canSubmit(`tradein:${input.phone}`)) {
    throw new AppError("Please wait a moment before sending another request.", "rate_limited");
  }
  const customerId = customerDocId(input.phone, input.email);

  if (isDemoMode()) {
    const request = toTradeIn(demoStore.id("ti"), input, customerId, images);
    demoStore.tradeIns.unshift(request);
    upsertDemoCustomer({
      name: input.name,
      phone: input.phone,
      email: input.email,
      tradeInId: request.id,
    });
    await notifyNewRecord("tradeIn", request.id);
    return request.id;
  }

  const ref = await addDoc(collection(getDb(), COLLECTIONS.tradeIns), {
    ...toTradeIn("", input, customerId, images),
    id: "",
  });
  await updateDoc(ref, { id: ref.id });
  await setDoc(
    doc(getDb(), COLLECTIONS.customers, customerId),
    {
      id: customerId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      lastContact: nowIso(),
      updatedAt: nowIso(),
    },
    { merge: true },
  );
  await notifyNewRecord("tradeIn", ref.id);
  return ref.id;
}

async function loadTradeIns(): Promise<TradeInRequest[]> {
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    return [...demoStore.tradeIns];
  }
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.tradeIns),
      orderBy("createdAt", "desc"),
      limit(200),
    ),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as TradeInRequest);
}

export async function listTradeIns(options: {
  status?: TradeInStatus | "";
  make?: string;
  search?: string;
  page?: number;
}): Promise<PaginatedResult<TradeInRequest>> {
  const items = await loadTradeIns();
  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (options.make && item.make !== options.make) return false;
    if (!search) return true;
    return [item.name, item.phone, item.make, item.model].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, 20);
}

export async function getTradeInFilterOptions(): Promise<{ makes: string[] }> {
  const items = await loadTradeIns();
  return {
    makes: [...new Set(items.map((item) => item.make).filter(Boolean))].sort(),
  };
}

export async function getTradeIn(id: string): Promise<TradeInRequest | null> {
  if (isDemoMode()) return demoStore.tradeIns.find((item) => item.id === id) ?? null;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.tradeIns, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as TradeInRequest;
}

export async function updateTradeIn(
  id: string,
  patch: Partial<
    Pick<TradeInRequest, "status" | "valuationNotes" | "estimatedValuation">
  >,
): Promise<void> {
  if (isDemoMode()) {
    const item = demoStore.tradeIns.find((entry) => entry.id === id);
    if (!item) throw new AppError("Trade-in not found", "not_found");
    Object.assign(item, patch, { updatedAt: nowIso() });
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.tradeIns, id), {
    ...patch,
    updatedAt: nowIso(),
  });
}

export async function addTradeInNote(
  id: string,
  note: Omit<AdminNote, "id">,
): Promise<void> {
  const item = await getTradeIn(id);
  if (!item) throw new AppError("Trade-in not found", "not_found");
  const adminNotes = [{ ...note, id: `n_${Date.now()}` }, ...item.adminNotes];
  if (isDemoMode()) {
    item.adminNotes = adminNotes;
    item.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.tradeIns, id), {
    adminNotes,
    updatedAt: nowIso(),
  });
}
