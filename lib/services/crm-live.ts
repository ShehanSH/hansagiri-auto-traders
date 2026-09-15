import { FirebaseError } from "firebase/app";
import { doc, setDoc, updateDoc, type DocumentData } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { ensureDemoCrmLoaded, persistDemoCrm } from "@/lib/demo/sync-crm";
import { ensureFirebaseConfigured, isDemoMode, isFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { nowIso } from "@/lib/firebase/timestamps";
import { AppError } from "@/utils/errors";

export function mergeCrmById<T extends { id: string }>(demo: T[], live: T[]): T[] {
  const liveIds = new Set(live.map((item) => item.id));
  return [...live, ...demo.filter((item) => !liveIds.has(item.id))];
}

export function sortByCreatedAtDesc<T extends { createdAt?: string; updatedAt?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const left = Date.parse(a.createdAt || a.updatedAt || "") || 0;
    const right = Date.parse(b.createdAt || b.updatedAt || "") || 0;
    return right - left;
  });
}

export async function loadCrmRecords<T extends { id: string; createdAt?: string }>(
  getDemoItems: () => T[],
  fetchLive: () => Promise<T[]>,
): Promise<T[]> {
  await ensureFirebaseConfigured();

  if (isMemoryCatalog() || !isFirebaseConfigured()) {
    if (isDemoMode()) await ensureDemoCrmLoaded();
    return [...getDemoItems()];
  }

  const live = await fetchLive();
  if (!isDemoMode()) return live;

  await ensureDemoCrmLoaded();
  return sortByCreatedAtDesc(mergeCrmById(getDemoItems(), live));
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof FirebaseError && error.code === "not-found";
}

function compactPatch(patch: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
}

export async function saveCrmRecord<T extends { id: string }>(
  collectionName: string,
  id: string,
  patch: Record<string, unknown>,
  demoItems: T[],
  fallback?: T | null,
): Promise<void> {
  await ensureFirebaseConfigured();
  const data = compactPatch({ ...patch, updatedAt: nowIso() });
  const demoItem = demoItems.find((item) => item.id === id);

  if (isMemoryCatalog()) {
    if (!demoItem) throw new AppError("Record not found", "not_found");
    Object.assign(demoItem, data);
    await persistDemoCrm();
    return;
  }

  const ref = doc(getDb(), collectionName, id);
  try {
    await updateDoc(ref, data);
  } catch (error) {
    if (!isNotFoundError(error)) throw error;
    const source = fallback ?? demoItem;
    if (source) {
      try {
        await setDoc(ref, compactPatch({ ...source, ...data, id }) as DocumentData);
      } catch (createError) {
        if (!demoItem) throw createError;
        Object.assign(demoItem, data);
        await persistDemoCrm();
        return;
      }
    } else if (demoItem) {
      Object.assign(demoItem, data);
      await persistDemoCrm();
      return;
    } else {
      throw error;
    }
  }

  if (demoItem) Object.assign(demoItem, data);
}
