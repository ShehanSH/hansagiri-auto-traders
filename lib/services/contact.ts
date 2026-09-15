import { collection, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { clipMessage, createDocument, mapDocs } from "@/lib/firebase/documents";
import { ensureDemoCrmLoaded, persistDemoCrm } from "@/lib/demo/sync-crm";
import { submitContactToDemoStore } from "@/lib/demo/submit-contact";
import { demoStore } from "@/lib/demo/store";
import { ensureFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import {
  customerDocId,
  upsertDemoCustomer,
  upsertPublicCustomer,
} from "@/lib/services/customers-shared";
import { loadCrmRecords } from "@/lib/services/crm-live";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { ContactInput } from "@/lib/validation/contact";
import type { FinancingInput } from "@/lib/validation/financing";
import type { ContactMessage, FinancingInquiry, Inquiry, PaginatedResult } from "@/types";

function financingToInquiry(id: string, input: FinancingInput, customerId: string): Inquiry {
  const timestamp = nowIso();
  const details = `${input.message}\n\nBudget: ${input.estimatedBudget}\nEmployment: ${input.employmentType}`;
  return {
    id,
    name: input.name,
    phone: input.phone,
    whatsapp: input.phone,
    email: "",
    vehicleId: null,
    vehicleLabel: input.vehicleLabel || "Financing enquiry",
    message: clipMessage(details),
    preferredContact: "phone",
    preferredDate: "",
    preferredTime: "",
    source: "financing",
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

export async function submitContact(input: ContactInput): Promise<string> {
  if (!canSubmit(`contact:${input.phone}`)) {
    throw new AppError("Please wait a moment before sending another message.", "rate_limited");
  }

  await ensureFirebaseConfigured();

  if (isMemoryCatalog()) {
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
  const customerId = customerDocId(input.phone, input.email);
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

  const messageId = await createDocument(COLLECTIONS.contactMessages, message);
  const inquiryId = await createDocument(
    COLLECTIONS.inquiries,
    contactToInquiry("", input, customerId),
  );
  await upsertPublicCustomer({
    name: input.name,
    phone: input.phone,
    email: input.email,
    whatsapp: input.phone,
    inquiryId,
  });
  await notifyNewRecord("contact", messageId);
  await notifyNewRecord("inquiry", inquiryId);
  return messageId;
}

async function fetchLiveMessages(): Promise<ContactMessage[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.contactMessages),
      orderBy("createdAt", "desc"),
      limit(200),
    ),
  );
  return mapDocs<ContactMessage>(snapshot);
}

export async function listMessages(options: {
  status?: ContactMessage["status"] | "";
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<ContactMessage>> {
  const items = await loadCrmRecords(() => demoStore.messages, fetchLiveMessages);
  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (!search) return true;
    return [item.name, item.email, item.subject].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, options.pageSize ?? 20);
}

export async function getMessage(id: string): Promise<ContactMessage | null> {
  const items = await loadCrmRecords(() => demoStore.messages, fetchLiveMessages);
  return items.find((item) => item.id === id) ?? null;
}

export async function markMessageRead(id: string): Promise<void> {
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
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

  await ensureFirebaseConfigured();
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

  const customerId = customerDocId(input.phone, "");

  if (isMemoryCatalog()) {
    await ensureDemoCrmLoaded();
    record.id = demoStore.id("fin");
    demoStore.financing.unshift(record);
    const inquiry = financingToInquiry(demoStore.id("inq"), input, customerId);
    demoStore.inquiries.unshift(inquiry);
    upsertDemoCustomer({
      name: input.name,
      phone: input.phone,
      email: "",
      whatsapp: input.phone,
      inquiryId: inquiry.id,
    });
    await persistDemoCrm();
    await notifyNewRecord("financing", record.id);
    await notifyNewRecord("inquiry", inquiry.id);
    return record.id;
  }

  const financingId = await createDocument(COLLECTIONS.financingInquiries, record);
  let inquiryId = "";
  try {
    inquiryId = await createDocument(
      COLLECTIONS.inquiries,
      financingToInquiry("", input, customerId),
    );
  } catch (error) {
    console.error("Could not copy financing enquiry into inquiries", error);
  }
  await upsertPublicCustomer({
    name: input.name,
    phone: input.phone,
    email: "",
    whatsapp: input.phone,
    inquiryId: inquiryId || undefined,
  });
  await notifyNewRecord("financing", financingId);
  if (inquiryId) await notifyNewRecord("inquiry", inquiryId);
  return financingId;
}
