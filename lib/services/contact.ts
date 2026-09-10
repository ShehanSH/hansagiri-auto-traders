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
import { ensureDemoCrmLoaded, persistDemoCrm } from "@/lib/demo/sync-crm";
import { submitContactToDemoStore } from "@/lib/demo/submit-contact";
import { demoStore } from "@/lib/demo/store";
import { isDemoMode } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { customerDocId, upsertDemoCustomer } from "@/lib/services/customers-shared";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { ContactInput } from "@/lib/validation/contact";
import type { FinancingInput } from "@/lib/validation/financing";
import type { ContactMessage, FinancingInquiry, Inquiry, PaginatedResult } from "@/types";

function contactToInquiry(id: string, input: ContactInput, customerId: string): Inquiry {
  const timestamp = nowIso();
  return {
    id,
    name: input.name,
    phone: input.phone,
    whatsapp: input.phone,
    email: input.email,
    vehicleId: null,
    vehicleLabel: input.subject,
    message: input.message,
    preferredContact: "phone",
    preferredDate: "",
    preferredTime: "",
    source: "contact",
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

async function linkContactLead(input: ContactInput, inquiryId: string): Promise<void> {
  const customerId = customerDocId(input.phone, input.email);
  const timestamp = nowIso();

  await setDoc(
    doc(getDb(), COLLECTIONS.customers, customerId),
    {
      id: customerId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      whatsapp: input.phone,
      lastContact: timestamp,
      status: "new",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    { merge: true },
  );
}

export async function submitContact(input: ContactInput): Promise<string> {
  if (!canSubmit(`contact:${input.phone}`)) {
    throw new AppError("Please wait a moment before sending another message.", "rate_limited");
  }

  if (isDemoMode()) {
    if (typeof window !== "undefined") {
      const response = await fetch("/api/demo-crm/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new AppError(payload?.error ?? "Could not send your message.", "demo_sync_failed");
      }
      const payload = (await response.json()) as { id: string };
      return payload.id;
    }

    const messageId = submitContactToDemoStore(input);
    await persistDemoCrm();
    await notifyNewRecord("contact", messageId);
    await notifyNewRecord("inquiry", demoStore.inquiries[0]?.id ?? messageId);
    return messageId;
  }

  const timestamp = nowIso();
  const message: ContactMessage = {
    id: "",
    name: input.name,
    phone: input.phone,
    email: input.email,
    subject: input.subject,
    message: input.message,
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const customerId = customerDocId(input.phone, input.email);

  const ref = await addDoc(collection(getDb(), COLLECTIONS.contactMessages), message);
  await updateDoc(ref, { id: ref.id });
  const inquiryRef = await addDoc(
    collection(getDb(), COLLECTIONS.inquiries),
    contactToInquiry("", input, customerId),
  );
  await updateDoc(inquiryRef, { id: inquiryRef.id });
  await linkContactLead(input, inquiryRef.id);
  await notifyNewRecord("contact", ref.id);
  await notifyNewRecord("inquiry", inquiryRef.id);
  return ref.id;
}

export async function listMessages(options: {
  status?: ContactMessage["status"] | "";
  search?: string;
  page?: number;
}): Promise<PaginatedResult<ContactMessage>> {
  let items: ContactMessage[] = [];
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    items = [...demoStore.messages];
  } else {
    const snapshot = await getDocs(
      query(
        collection(getDb(), COLLECTIONS.contactMessages),
        orderBy("createdAt", "desc"),
        limit(200),
      ),
    );
    items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ContactMessage);
  }
  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (!search) return true;
    return [item.name, item.email, item.subject].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, 20);
}

export async function getMessage(id: string): Promise<ContactMessage | null> {
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    return demoStore.messages.find((item) => item.id === id) ?? null;
  }
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.contactMessages, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as ContactMessage;
}

export async function markMessageRead(id: string): Promise<void> {
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    const item = demoStore.messages.find((entry) => entry.id === id);
    if (item) {
      item.status = "read";
      item.updatedAt = nowIso();
      await persistDemoCrm();
    }
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.contactMessages, id), {
    status: "read",
    updatedAt: nowIso(),
  });
}

export async function submitFinancing(input: FinancingInput): Promise<string> {
  if (!canSubmit(`financing:${input.phone}`)) {
    throw new AppError("Please wait a moment before sending another request.", "rate_limited");
  }
  const timestamp = nowIso();
  const record: FinancingInquiry = {
    id: "",
    name: input.name,
    phone: input.phone,
    vehicleLabel: input.vehicleLabel || "",
    estimatedBudget: input.estimatedBudget,
    employmentType: input.employmentType,
    message: input.message,
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    record.id = demoStore.id("fin");
    demoStore.financing.unshift(record);
    await persistDemoCrm();
    await notifyNewRecord("financing", record.id);
    return record.id;
  }

  const ref = await addDoc(collection(getDb(), COLLECTIONS.financingInquiries), record);
  await updateDoc(ref, { id: ref.id });
  await notifyNewRecord("financing", ref.id);
  return ref.id;
}
