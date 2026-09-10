import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  applyDemoCrm,
  EMPTY_DEMO_CRM,
  snapshotDemoCrm,
  type DemoCrmSnapshot,
} from "@/lib/demo/crm-state";

export type { DemoCrmSnapshot } from "@/lib/demo/crm-state";
export { applyDemoCrm, snapshotDemoCrm } from "@/lib/demo/crm-state";

const FILE = path.join(process.cwd(), ".demo", "crm.json");

export function hydrateDemoCrmFromDisk(): DemoCrmSnapshot {
  try {
    if (existsSync(FILE)) {
      const parsed = JSON.parse(readFileSync(FILE, "utf8")) as Partial<DemoCrmSnapshot>;
      const data: DemoCrmSnapshot = {
        messages: parsed.messages ?? [],
        inquiries: parsed.inquiries ?? [],
        customers: parsed.customers ?? [],
        testDrives: parsed.testDrives ?? [],
        tradeIns: parsed.tradeIns ?? [],
        financing: parsed.financing ?? [],
        activity: parsed.activity ?? [],
      };
      applyDemoCrm(data);
      return data;
    }
  } catch {
    // Fall back to an empty CRM snapshot.
  }

  applyDemoCrm(EMPTY_DEMO_CRM);
  return EMPTY_DEMO_CRM;
}

export function persistDemoCrmToDisk(data: DemoCrmSnapshot = snapshotDemoCrm()): DemoCrmSnapshot {
  const next = structuredClone(data);
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
  applyDemoCrm(next);
  return next;
}
