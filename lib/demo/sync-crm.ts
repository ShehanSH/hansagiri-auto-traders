import { applyDemoCrm, isEmptyDemoCrm, snapshotDemoCrm, type DemoCrmSnapshot } from "@/lib/demo/crm-state";
import { isDemoMode } from "@/lib/env";
import { AppError } from "@/utils/errors";

export async function ensureDemoCrmLoaded(): Promise<void> {
  if (!isDemoMode()) return;

  if (typeof window === "undefined") return;

  const response = await fetch("/api/demo-crm", { cache: "no-store" });
  if (!response.ok) {
    throw new AppError("Could not load demo records.", "demo_sync_failed");
  }
  const data = (await response.json()) as DemoCrmSnapshot;
  if (!isEmptyDemoCrm(data)) applyDemoCrm(data);
}

export async function persistDemoCrm(): Promise<void> {
  if (!isDemoMode()) return;
  if (typeof window === "undefined") return;

  const response = await fetch("/api/demo-crm", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshotDemoCrm()),
  });
  if (!response.ok) {
    throw new AppError("Could not save demo records.", "demo_sync_failed");
  }
}
