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
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ensureDemoCrmLoaded, persistDemoCrm } from "@/lib/demo/sync-crm";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import {
  customerDocId,
  upsertDemoCustomer,
} from "@/lib/services/customers-shared";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { InquiryInput } from "@/lib/validation/inquiry";
import type { AdminNote, Inquiry, InquiryStatus, PaginatedResult } from "@/types";

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

  const customerId = customerDocId(input.phone, input.email);

  if (isDemoMode()) {
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

  const db = getDb();
  const inquiryRef = await addDoc(collection(db, COLLECTIONS.inquiries), {
    ...toInquiry("", input, customerId),
    id: "",
  });
  await updateDoc(inquiryRef, { id: inquiryRef.id });
  await setDoc(
    doc(db, COLLECTIONS.customers, customerId),
    {
      id: customerId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp || input.phone,
      lastContact: nowIso(),
      status: "new",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    { merge: true },
  );
  await notifyNewRecord("inquiry", inquiryRef.id);
  return inquiryRef.id;
}

export async function listInquiries(options: {
  status?: InquiryStatus | "";
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Inquiry>> {
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 20;

  let items: Inquiry[] = [];
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    items = [...demoStore.inquiries];
  } else {
    const snapshot = await getDocs(
      query(
        collection(getDb(), COLLECTIONS.inquiries),
        orderBy("createdAt", "desc"),
        limit(200),
      ),
    );
    items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Inquiry);
  }

  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (item.archived) return false;
    if (options.status && item.status !== options.status) return false;
    if (!search) return true;
    return [item.name, item.phone, item.email, item.vehicleLabel]
      .join(" ")
      .toLowerCase()
      .includes(search);
  });

  return paginate(filtered, page, pageSize);
}

export async function getInquiry(id: string): Promise<Inquiry | null> {
  if (isDemoMode()) return demoStore.inquiries.find((item) => item.id === id) ?? null;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.inquiries, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Inquiry;
}

export async function updateInquiry(
  id: string,
  patch: Partial<Pick<Inquiry, "status" | "assignedStaff" | "followUpDate" | "lastContact" | "archived">>,
): Promise<void> {
  if (isDemoMode()) {
    const inquiry = demoStore.inquiries.find((item) => item.id === id);
    if (!inquiry) throw new AppError("Enquiry not found", "not_found");
    Object.assign(inquiry, patch, { updatedAt: nowIso() });
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.inquiries, id), {
    ...patch,
    updatedAt: nowIso(),
  });
}

export async function addInquiryNote(
  id: string,
  note: Omit<AdminNote, "id">,
): Promise<void> {
  const inquiry = await getInquiry(id);
  if (!inquiry) throw new AppError("Enquiry not found", "not_found");
  const next = [{ ...note, id: `n_${Date.now()}` }, ...inquiry.notes];
  if (isDemoMode()) {
    inquiry.notes = next;
    inquiry.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.inquiries, id), {
    notes: next,
    updatedAt: nowIso(),
  });
}

export async function deleteInquiry(id: string): Promise<void> {
  if (isDemoMode()) {
    demoStore.inquiries = demoStore.inquiries.filter((item) => item.id !== id);
    return;
  }
  await deleteDoc(doc(getDb(), COLLECTIONS.inquiries, id));
}

export async function getInquiryByVehicle(vehicleId: string): Promise<Inquiry[]> {
  if (isDemoMode()) {
    return demoStore.inquiries.filter((item) => item.vehicleId === vehicleId);
  }
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.inquiries),
      where("vehicleId", "==", vehicleId),
      orderBy("createdAt", "desc"),
      limit(50),
    ),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Inquiry);
}
