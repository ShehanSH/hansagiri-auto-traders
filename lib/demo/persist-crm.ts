import "server-only";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DEMO_CRM_SEED } from "@/lib/demo/crm-seed";
import {
  applyDemoCrm,
  isEmptyDemoCrm,
  snapshotDemoCrm,
  type DemoCrmSnapshot,
} from "@/lib/demo/crm-state";

export type { DemoCrmSnapshot } from "@/lib/demo/crm-state";
export { applyDemoCrm, snapshotDemoCrm } from "@/lib/demo/crm-state";

const FILE = path.join(process.cwd(), ".demo", "crm.json");

function seedSnapshot(): DemoCrmSnapshot {
  return structuredClone(DEMO_CRM_SEED);
}

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
      if (!isEmptyDemoCrm(data)) {
        applyDemoCrm(data);
        return data;
      }
    }
  } catch {
    // Fall back to the bundled demo CRM.
  }

  const seed = seedSnapshot();
  applyDemoCrm(seed);
  return seed;
}

export function persistDemoCrmToDisk(data: DemoCrmSnapshot = snapshotDemoCrm()): DemoCrmSnapshot {
  const next = structuredClone(data);
  applyDemoCrm(next);
  try {
    mkdirSync(path.dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
  } catch {
    // Vercel and other serverless hosts cannot write the project disk.
  }
  return next;
}
