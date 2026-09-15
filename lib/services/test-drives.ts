import { collection, doc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { createDocument, mapDocs } from "@/lib/firebase/documents";
import { demoStore } from "@/lib/demo/store";
import { ensureFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { customerDocId, upsertDemoCustomer, upsertPublicCustomer } from "@/lib/services/customers-shared";
import { loadCrmRecords } from "@/lib/services/crm-live";
import { notifyNewRecord } from "@/lib/services/notifications";
import { canSubmit } from "@/utils/spam";
import { AppError } from "@/utils/errors";
import { paginate } from "@/utils/vehicle-query";
import type { TestDriveInput } from "@/lib/validation/test-drive";
import type { AdminNote, PaginatedResult, TestDriveRequest, TestDriveStatus } from "@/types";

function toRequest(id: string, input: TestDriveInput, customerId: string): TestDriveRequest {
  const timestamp = nowIso();
  return {
    id,
    name: input.name,
    phone: input.phone,
    whatsapp: input.whatsapp || input.phone,
    email: input.email,
    vehicleId: input.vehicleId || null,
    vehicleLabel: input.vehicleLabel || "",
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    message: input.message || "",
    status: "pending",
    notes: [],
    customerId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export async function submitTestDrive(input: TestDriveInput): Promise<string> {
  if (!canSubmit(`testdrive:${input.phone}`)) {
    throw new AppError("Please wait a moment before sending another request.", "rate_limited");
  }

  await ensureFirebaseConfigured();
  const customerId = customerDocId(input.phone, input.email);

  if (isMemoryCatalog()) {
    const request = toRequest(demoStore.id("td"), input, customerId);
    demoStore.testDrives.unshift(request);
    upsertDemoCustomer({
      name: input.name,
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp,
      vehicleId: input.vehicleId,
      testDriveId: request.id,
    });
    await notifyNewRecord("testDrive", request.id);
    return request.id;
  }

  const testDriveId = await createDocument(COLLECTIONS.testDrives, toRequest("", input, customerId));
  await upsertPublicCustomer({
    name: input.name,
    phone: input.phone,
    email: input.email,
    whatsapp: input.whatsapp || input.phone,
    testDriveId,
  });
  await notifyNewRecord("testDrive", testDriveId);
  return testDriveId;
}

async function fetchLiveTestDrives(): Promise<TestDriveRequest[]> {
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.testDrives),
      orderBy("createdAt", "desc"),
      limit(200),
    ),
  );
  return mapDocs<TestDriveRequest>(snapshot);
}

async function loadTestDrives(): Promise<TestDriveRequest[]> {
  return loadCrmRecords(() => demoStore.testDrives, fetchLiveTestDrives);
}

export async function listTestDrives(options: {
  status?: TestDriveStatus | "";
  vehicle?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<TestDriveRequest>> {
  const items = await loadTestDrives();
  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (options.vehicle && item.vehicleLabel !== options.vehicle) return false;
    if (!search) return true;
    return [item.name, item.phone, item.vehicleLabel].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, options.pageSize ?? 20);
}

export async function getTestDriveFilterOptions(): Promise<{ vehicles: string[] }> {
  const items = await loadTestDrives();
  return {
    vehicles: [...new Set(items.map((item) => item.vehicleLabel).filter(Boolean))].sort(),
  };
}

export async function getTestDrive(id: string): Promise<TestDriveRequest | null> {
  const items = await loadTestDrives();
  return items.find((item) => item.id === id) ?? null;
}

export async function updateTestDriveStatus(
  id: string,
  status: TestDriveStatus,
): Promise<void> {
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
    const item = demoStore.testDrives.find((entry) => entry.id === id);
    if (!item) throw new AppError("Request not found", "not_found");
    item.status = status;
    item.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.testDrives, id), {
    status,
    updatedAt: nowIso(),
  });
}

export async function addTestDriveNote(
  id: string,
  note: Omit<AdminNote, "id">,
): Promise<void> {
  const item = await getTestDrive(id);
  if (!item) throw new AppError("Request not found", "not_found");
  const notes = [{ ...note, id: `n_${Date.now()}` }, ...item.notes];
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
    item.notes = notes;
    item.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.testDrives, id), {
    notes,
    updatedAt: nowIso(),
  });
}
