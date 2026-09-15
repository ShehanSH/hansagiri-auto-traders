import { collection, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { clipMessage, createDocument, mapDocs } from "@/lib/firebase/documents";
import { demoStore } from "@/lib/demo/store";
import { ensureFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { customerDocId, upsertDemoCustomer, upsertPublicCustomer } from "@/lib/services/customers-shared";
import { loadCrmRecords } from "@/lib/services/crm-live";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { TradeInInput } from "@/lib/validation/trade-in";
import type {
  AdminNote,
  Inquiry,
  PaginatedResult,
  TradeInRequest,
  TradeInStatus,
  VehicleImage,
} from "@/types";

function tradeInToInquiry(id: string, input: TradeInInput, customerId: string): Inquiry {
  const timestamp = nowIso();
  const label = `${input.year} ${input.make} ${input.model}`.trim();
  return {
    id,
    name: input.name,
    phone: input.phone,
    whatsapp: input.phone,
    email: input.email,
    vehicleId: null,
    vehicleLabel: label,
    message: clipMessage(input.notes?.trim() || `Trade-in request for ${label}.`),
    preferredContact: "phone",
    preferredDate: "",
    preferredTime: "",
    source: "trade_in",
    status: "new",
    assignedStaff: "",
    lastContact: "",
    followUpDate: "",
    notes: [],
    customerId,
    createdAt: timestamp,
    updatedAt: timestamp,
    archived: false,
  };
}

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

  await ensureFirebaseConfigured();
  const customerId = customerDocId(input.phone, input.email);
  const persistableImages = images.filter((image) => Boolean(image.url) && !image.url.startsWith("blob:"));

  if (isMemoryCatalog()) {
    const request = toTradeIn(demoStore.id("ti"), input, customerId, images);
    demoStore.tradeIns.unshift(request);
    const inquiry = tradeInToInquiry(demoStore.id("inq"), input, customerId);
    demoStore.inquiries.unshift(inquiry);
    upsertDemoCustomer({
      name: input.name,
      phone: input.phone,
      email: input.email,
      tradeInId: request.id,
      inquiryId: inquiry.id,
    });
    await notifyNewRecord("tradeIn", request.id);
    await notifyNewRecord("inquiry", inquiry.id);
    return request.id;
  }

  const tradeInId = await createDocument(
    COLLECTIONS.tradeIns,
    toTradeIn("", input, customerId, persistableImages),
  );
  let inquiryId = "";
  try {
    inquiryId = await createDocument(
      COLLECTIONS.inquiries,
      tradeInToInquiry("", input, customerId),
    );
  } catch (error) {
    console.error("Could not copy trade-in into inquiries", error);
  }
  await upsertPublicCustomer({
    name: input.name,
    phone: input.phone,
    email: input.email,
    tradeInId,
    inquiryId: inquiryId || undefined,
  });
  await notifyNewRecord("tradeIn", tradeInId);
  if (inquiryId) await notifyNewRecord("inquiry", inquiryId);
  return tradeInId;
}

async function fetchLiveTradeIns(): Promise<TradeInRequest[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.tradeIns),
      orderBy("createdAt", "desc"),
      limit(200),
    ),
  );
  return mapDocs<TradeInRequest>(snapshot);
}

async function loadTradeIns(): Promise<TradeInRequest[]> {
  return loadCrmRecords(() => demoStore.tradeIns, fetchLiveTradeIns);
}

export async function listTradeIns(options: {
  status?: TradeInStatus | "";
  make?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<TradeInRequest>> {
  const items = await loadTradeIns();
  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (options.make && item.make !== options.make) return false;
    if (!search) return true;
    return [item.name, item.phone, item.make, item.model].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, options.pageSize ?? 20);
}

export async function getTradeInFilterOptions(): Promise<{ makes: string[] }> {
  const items = await loadTradeIns();
  return {
    makes: [...new Set(items.map((item) => item.make).filter(Boolean))].sort(),
  };
}

export async function getTradeIn(id: string): Promise<TradeInRequest | null> {
  const items = await loadTradeIns();
  return items.find((item) => item.id === id) ?? null;
}

export async function updateTradeIn(
  id: string,
  patch: Partial<
    Pick<TradeInRequest, "status" | "valuationNotes" | "estimatedValuation">
  >,
): Promise<void> {
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
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
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
    item.adminNotes = adminNotes;
    item.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.tradeIns, id), {
    adminNotes,
    updatedAt: nowIso(),
  });
}
