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
import { isDemoMode } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { customerDocId, upsertDemoCustomer } from "@/lib/services/customers-shared";
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
  const customerId = customerDocId(input.phone, input.email);

  if (isDemoMode()) {
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

  const ref = await addDoc(collection(getDb(), COLLECTIONS.testDrives), {
    ...toRequest("", input, customerId),
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
      whatsapp: input.whatsapp || input.phone,
      lastContact: nowIso(),
      updatedAt: nowIso(),
    },
    { merge: true },
  );
  await notifyNewRecord("testDrive", ref.id);
  return ref.id;
}

export async function listTestDrives(options: {
  status?: TestDriveStatus | "";
  search?: string;
  page?: number;
}): Promise<PaginatedResult<TestDriveRequest>> {
  let items: TestDriveRequest[] = [];
  if (isDemoMode()) {
    items = [...demoStore.testDrives];
  } else {
    const snapshot = await getDocs(
      query(
        collection(getDb(), COLLECTIONS.testDrives),
        orderBy("createdAt", "desc"),
        limit(200),
      ),
    );
    items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as TestDriveRequest);
  }

  const search = options.search?.trim().toLowerCase() ?? "";
  const filtered = items.filter((item) => {
    if (options.status && item.status !== options.status) return false;
    if (!search) return true;
    return [item.name, item.phone, item.vehicleLabel].join(" ").toLowerCase().includes(search);
  });
  return paginate(filtered, options.page ?? 1, 20);
}

export async function getTestDrive(id: string): Promise<TestDriveRequest | null> {
  if (isDemoMode()) return demoStore.testDrives.find((item) => item.id === id) ?? null;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.testDrives, id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as TestDriveRequest;
}

export async function updateTestDriveStatus(
  id: string,
  status: TestDriveStatus,
): Promise<void> {
  if (isDemoMode()) {
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
  if (isDemoMode()) {
    item.notes = notes;
    item.updatedAt = nowIso();
    return;
  }
  await updateDoc(doc(getDb(), COLLECTIONS.testDrives, id), {
    notes,
    updatedAt: nowIso(),
  });
}
