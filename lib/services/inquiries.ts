import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { createDocument, mapDocs } from "@/lib/firebase/documents";
import { ensureDemoCrmLoaded, persistDemoCrm } from "@/lib/demo/sync-crm";
import { demoStore } from "@/lib/demo/store";
import { ensureFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import {
  customerDocId,
  upsertDemoCustomer,
  upsertPublicCustomer,
} from "@/lib/services/customers-shared";
import { loadCrmRecords, saveCrmRecord, deleteCrmRecord } from "@/lib/services/crm-live";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { InquiryInput } from "@/lib/validation/inquiry";
import type { AdminNote, Inquiry, InquirySource, InquiryStatus, PaginatedResult } from "@/types";

function toInquiry(id: string, input: InquiryInput, customerId: string): Inquiry {
  const timestamp = nowIso();
  return {
    id,
    name: input.name,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    email: input.email,
    vehicleId: input.vehicleId || null,
    vehicleLabel: input.vehicleLabel || "",
    message: input.message,
    preferredContact: input.preferredContact,
    preferredDate: input.preferredDate || "",
    preferredTime: input.preferredTime || "",
    source: input.source,
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

export async function submitInquiry(input: InquiryInput): Promise<string> {
  if (!canSubmit(`inquiry:${input.phone}`)) {
    throw new AppError("Please wait a moment before sending another enquiry.", "rate_limited");
  }

  await ensureFirebaseConfigured();
  const customerId = customerDocId(input.phone, input.email);

  if (isMemoryCatalog()) {
    await ensureDemoCrmLoaded();
    const inquiry = toInquiry(demoStore.id("inq"), input, customerId);
    demoStore.inquiries.unshift(inquiry);
    upsertDemoCustomer({
      name: input.name,
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp,
      vehicleId: input.vehicleId,
      inquiryId: inquiry.id,
    });
    await persistDemoCrm();
    await notifyNewRecord("inquiry", inquiry.id);
    return inquiry.id;
  }

  const inquiryId = await createDocument(COLLECTIONS.inquiries, toInquiry("", input, customerId));
  await upsertPublicCustomer({
    name: input.name,
    phone: input.phone,
    email: input.email,
    whatsapp: input.whatsapp || input.phone,
    inquiryId,
  });
  await notifyNewRecord("inquiry", inquiryId);
  return inquiryId;
}

async function fetchLiveInquiries(): Promise<Inquiry[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.inquiries),
      orderBy("createdAt", "desc"),
      limit(200),
    ),
  );
  return mapDocs<Inquiry>(snapshot);
}

export async function listInquiries(options: {
  status?: InquiryStatus | "";
  source?: InquirySource | "";
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Inquiry>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;
  const items = await loadCrmRecords(() => demoStore.inquiries, fetchLiveInquiries);

  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (item.archived) return false;
    if (options.status && item.status !== options.status) return false;
    if (options.source && item.source !== options.source) return false;
    if (!search) return true;
    return [item.name, item.phone, item.email, item.vehicleLabel]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  return paginate(filtered, page, pageSize);
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
  const items = await loadCrmRecords(() => demoStore.inquiries, fetchLiveInquiries);
  return items.find((item) => item.id === id) ?? null;
}

export async function updateInquiry(
  id: string,
  patch: Partial<Pick<Inquiry, "status" | "assignedStaff" | "followUpDate" | "lastContact" | "archived" | "notes">>,
): Promise<void> {
  const current = await getInquiry(id);
  await saveCrmRecord(COLLECTIONS.inquiries, id, patch, demoStore.inquiries, current);
}

export async function addInquiryNote(
  id: string,
  note: Omit<AdminNote, "id">,
): Promise<void> {
  const inquiry = await getInquiry(id);
  if (!inquiry) throw new AppError("Enquiry not found", "not_found");
  const notes = [{ ...note, id: `n_${Date.now()}` }, ...(inquiry.notes ?? [])];
  await updateInquiry(id, { notes });
}

export async function deleteInquiry(id: string): Promise<void> {
  await deleteCrmRecord(COLLECTIONS.inquiries, id, () => {
    demoStore.inquiries = demoStore.inquiries.filter((item) => item.id !== id);
  });
}

export async function getInquiryByVehicle(vehicleId: string): Promise<Inquiry[]> {
  const items = await loadCrmRecords(() => demoStore.inquiries, fetchLiveInquiries);
  return items.filter((item) => item.vehicleId === vehicleId);
}
