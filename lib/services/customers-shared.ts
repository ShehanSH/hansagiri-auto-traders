import { arrayUnion, doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { nowIso } from "@/lib/firebase/timestamps";
import { normalizePhoneKey } from "@/utils/phone";
import type { AdminNote, Customer, CustomerStatus } from "@/types";

export function customerDocId(phone: string, email: string): string {
  const phoneKey = normalizePhoneKey(phone);
  if (phoneKey !== "unknown") return `c_${phoneKey}`;
  return `c_${email.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

export function normalizeCustomer(item: Partial<Customer> & { id: string }): Customer {
  return {
    id: item.id,
    name: item.name ?? "",
    phone: item.phone ?? "",
    email: item.email ?? "",
    whatsapp: item.whatsapp ?? item.phone ?? "",
    interestedVehicles: item.interestedVehicles ?? [],
    inquiryIds: item.inquiryIds ?? [],
    testDriveIds: item.testDriveIds ?? [],
    tradeInIds: item.tradeInIds ?? [],
    notes: item.notes ?? [],
    lastContact: item.lastContact ?? item.updatedAt ?? item.createdAt ?? "",
    status: item.status ?? "new",
    createdAt: item.createdAt ?? item.updatedAt ?? "",
    updatedAt: item.updatedAt ?? item.createdAt ?? "",
  };
}

export function upsertDemoCustomer(input: {
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  vehicleId?: string | null;
  inquiryId?: string;
  testDriveId?: string;
  tradeInId?: string;
}): Customer {
  const id = customerDocId(input.phone, input.email);
  const existing = demoStore.customers.find((item) => item.id === id);
  const timestamp = nowIso();

  if (!existing) {
    const created: Customer = {
      id,
      name: input.name,
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp || input.phone,
      interestedVehicles: input.vehicleId ? [input.vehicleId] : [],
      inquiryIds: input.inquiryId ? [input.inquiryId] : [],
      testDriveIds: input.testDriveId ? [input.testDriveId] : [],
      tradeInIds: input.tradeInId ? [input.tradeInId] : [],
      notes: [],
      lastContact: timestamp,
      status: "new",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    demoStore.customers.unshift(created);
    return created;
  }

  if (input.vehicleId && !existing.interestedVehicles.includes(input.vehicleId)) {
    existing.interestedVehicles.push(input.vehicleId);
  }
  if (input.inquiryId && !existing.inquiryIds.includes(input.inquiryId)) {
    existing.inquiryIds.push(input.inquiryId);
  }
  if (input.testDriveId && !existing.testDriveIds.includes(input.testDriveId)) {
    existing.testDriveIds.push(input.testDriveId);
  }
  if (input.tradeInId && !existing.tradeInIds.includes(input.tradeInId)) {
    existing.tradeInIds.push(input.tradeInId);
  }
  existing.lastContact = timestamp;
  existing.updatedAt = timestamp;
  if (existing.status === "new") existing.status = "active";
  return existing;
}

export async function upsertPublicCustomer(input: {
  name: string;
  phone: string;
  email: string;
  whatsapp?: string;
  inquiryId?: string;
  testDriveId?: string;
  tradeInId?: string;
}): Promise<string> {
  const id = customerDocId(input.phone, input.email);
  const timestamp = nowIso();
  try {
    await setDoc(
      doc(getDb(), COLLECTIONS.customers, id),
      {
        id,
        name: input.name,
        phone: input.phone,
        email: input.email,
        whatsapp: input.whatsapp || input.phone,
        lastContact: timestamp,
        status: "new",
        updatedAt: timestamp,
        ...(input.inquiryId ? { inquiryIds: arrayUnion(input.inquiryId) } : {}),
        ...(input.testDriveId ? { testDriveIds: arrayUnion(input.testDriveId) } : {}),
        ...(input.tradeInId ? { tradeInIds: arrayUnion(input.tradeInId) } : {}),
      },
      { merge: true },
    );
  } catch (error) {
    console.error("Could not save customer lead", error);
  }
  return id;
}

export function appendNote(
  notes: AdminNote[],
  body: string,
  userId: string,
  userName: string,
): AdminNote[] {
  return [
    {
      id: `n_${Math.random().toString(36).slice(2, 8)}`,
      body,
      createdAt: nowIso(),
      createdBy: userId,
      createdByName: userName,
    },
    ...notes,
  ];
}

export function nextCustomerStatus(
  current: CustomerStatus,
  event: "inquiry" | "converted" | "lost",
): CustomerStatus {
  if (event === "converted") return "converted";
  if (event === "lost") return "lost";
  if (current === "converted" || current === "lost") return current;
  if (current === "new") return "active";
  return current;
}
