import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ensureDemoCrmLoaded } from "@/lib/demo/sync-crm";
import { demoStore } from "@/lib/demo/store";
import { ensureFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { paginate } from "@/utils/vehicle-query";
import type { ActivityLog, Customer, CustomerStatus, PaginatedResult } from "@/types";
import { appendNote, normalizeCustomer } from "@/lib/services/customers-shared";
import { loadCrmRecords, saveCrmRecord } from "@/lib/services/crm-live";
import { createDocument } from "@/lib/firebase/documents";

export async function logActivity(input: Omit<ActivityLog, "id" | "timestamp">): Promise<void> {
  const entry: ActivityLog = {
    ...input,
    id: "",
    timestamp: nowIso(),
  };

  if (isMemoryCatalog()) {
    entry.id = demoStore.id("log");
    demoStore.activity.unshift(entry);
    demoStore.activity = demoStore.activity.slice(0, 200);
    return;
  }

  await createDocument(COLLECTIONS.activityLogs, entry);
}

export async function listActivity(page = 1): Promise<PaginatedResult<ActivityLog>> {
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
    await ensureDemoCrmLoaded();
    const items = [...demoStore.activity].sort(
      (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp),
    );
    return paginate(items, page, 30);
  }

  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.activityLogs),
      orderBy("timestamp", "desc"),
      limit(100),
    ),
  );
  const items = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as ActivityLog);
  return paginate(items, page, 30);
}

export type CustomerActivityFilter = "" | "inquiry" | "test_drive" | "trade_in";

async function fetchLiveCustomers(): Promise<Customer[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.customers),
      orderBy("updatedAt", "desc"),
      limit(200),
    ),
  );
  return snapshot.docs.map((item) =>
    normalizeCustomer({ ...item.data(), id: item.id } as Partial<Customer> & { id: string }),
  );
}

export async function listCustomers(options: {
  search?: string;
  status?: CustomerStatus | "";
  activity?: CustomerActivityFilter;
  page?: number;
}): Promise<PaginatedResult<Customer>> {
  const items = (await loadCrmRecords(() => demoStore.customers, fetchLiveCustomers)).map(
    normalizeCustomer,
  );
  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (options.activity === "inquiry" && !(item.inquiryIds?.length > 0)) return false;
    if (options.activity === "test_drive" && !(item.testDriveIds?.length > 0)) return false;
    if (options.activity === "trade_in" && !(item.tradeInIds?.length > 0)) return false;
    if (!search) return true;
    return [item.name, item.phone, item.email].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, 20);
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const items = await loadCrmRecords(() => demoStore.customers, fetchLiveCustomers);
  const found = items.find((item) => item.id === id);
  if (found) return normalizeCustomer(found);

  if (isMemoryCatalog()) return null;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.customers, id));
  if (!snapshot.exists()) return null;
  return normalizeCustomer({ ...snapshot.data(), id: snapshot.id } as Partial<Customer> & { id: string });
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<Customer, "status" | "name" | "email" | "whatsapp" | "notes">>,
): Promise<void> {
  const current = await getCustomer(id);
  await saveCrmRecord(COLLECTIONS.customers, id, patch, demoStore.customers, current);
}

export async function addCustomerNote(
  id: string,
  body: string,
  userId: string,
  userName: string,
): Promise<void> {
  const customer = await getCustomer(id);
  if (!customer) return;
  const notes = appendNote(customer.notes ?? [], body, userId, userName);
  await updateCustomer(id, { notes });
}
