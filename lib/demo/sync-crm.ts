import {
  applyDemoCrm,
  hydrateDemoCrmFromDisk,
  persistDemoCrmToDisk,
  snapshotDemoCrm,
  type DemoCrmSnapshot,
} from "@/lib/demo/persist-crm";
import { isDemoMode } from "@/lib/env";
import { AppError } from "@/utils/errors";

export async function ensureDemoCrmLoaded(): Promise<void> {
  if (!isDemoMode()) return;

  if (typeof window !== "undefined") {
    const response = await fetch("/api/demo-crm", { cache: "no-store" });
    if (!response.ok) {
      throw new AppError("Could not load demo records.", "demo_sync_failed");
    }
    applyDemoCrm((await response.json()) as DemoCrmSnapshot);
    return;
  }

  hydrateDemoCrmFromDisk();
}

export async function persistDemoCrm(): Promise<void> {
  if (!isDemoMode()) return;

  const snapshot = snapshotDemoCrm();
  if (typeof window !== "undefined") {
    const response = await fetch("/api/demo-crm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (!response.ok) {
      throw new AppError("Could not save demo records.", "demo_sync_failed");
    }
    return;
  }

  persistDemoCrmToDisk(snapshot);
}
