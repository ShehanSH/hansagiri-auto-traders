import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ensureDemoCrmLoaded } from "@/lib/demo/sync-crm";
import { demoStore } from "@/lib/demo/store";
import { ensureFirebaseConfigured, isDemoMode } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { paginate } from "@/utils/vehicle-query";
import type { ActivityLog, Customer, CustomerStatus, PaginatedResult } from "@/types";
import { appendNote } from "@/lib/services/customers-shared";

export async function logActivity(input: Omit<ActivityLog, "id" | "timestamp">): Promise<void> {
  const entry: ActivityLog = {
    ...input,
    id: "",
    timestamp: nowIso(),
  };

  if (isDemoMode()) {
    entry.id = demoStore.id("log");
    demoStore.activity.unshift(entry);
    demoStore.activity = demoStore.activity.slice(0, 200);
    return;
  }

  const ref = await addDoc(collection(getDb(), COLLECTIONS.activityLogs), entry);
  await updateDoc(ref, { id: ref.id });
}

export async function listActivity(page = 1): Promise<PaginatedResult<ActivityLog>> {
  await ensureFirebaseConfigured();
  if (isDemoMode()) {
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
  const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as ActivityLog);
  return paginate(items, page, 30);
}

export type CustomerActivityFilter = "" | "inquiry" | "test_drive" | "trade_in";

export async function listCustomers(options: {
  search?: string;
  status?: CustomerStatus | "";
  activity?: CustomerActivityFilter;
  page?: number;
}): Promise<PaginatedResult<Customer>> {
  let items: Customer[] = [];
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    items = [...demoStore.customers];
  } else {
    const snapshot = await getDocs(
      query(
        collection(getDb(), COLLECTIONS.customers),
        orderBy("updatedAt", "desc"),
        limit(200),
      ),
    );
    items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Customer);
  }
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
  if (isDemoMode()) return demoStore.customers.find((item) => item.id === id) ?? null;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.customers, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Customer;
}

export async function updateCustomer(
  id: string,
  patch: Partial<Pick<Customer, "status" | "name" | "email" | "whatsapp">>,
): Promise<void> {
  if (isDemoMode()) {
    const item = demoStore.customers.find((entry) => entry.id === id);
    if (!item) return;
    Object.assign(item, patch, { updatedAt: nowIso() });
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.customers, id), {
    ...patch,
    updatedAt: nowIso(),
  });
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
  if (isDemoMode()) {
    customer.notes = notes;
    customer.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.customers, id), {
    notes,
    updatedAt: nowIso(),
  });
}
