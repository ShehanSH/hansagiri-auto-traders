import { ensureFirebaseConfigured, isDemoMode, isFirebaseConfigured, isMemoryCatalog } from "@/lib/env";
import { ensureDemoCrmLoaded } from "@/lib/demo/sync-crm";

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
