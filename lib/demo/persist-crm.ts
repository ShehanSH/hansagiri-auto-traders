import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { demoStore } from "@/lib/demo/store";
import type {
  ActivityLog,
  ContactMessage,
  Customer,
  FinancingInquiry,
  Inquiry,
  TestDriveRequest,
  TradeInRequest,
} from "@/types";

const FILE = path.join(process.cwd(), ".demo", "crm.json");

export type DemoCrmSnapshot = {
  messages: ContactMessage[];
  inquiries: Inquiry[];
  customers: Customer[];
  testDrives: TestDriveRequest[];
  tradeIns: TradeInRequest[];
  financing: FinancingInquiry[];
  activity: ActivityLog[];
};

const EMPTY: DemoCrmSnapshot = {
  messages: [],
  inquiries: [],
  customers: [],
  testDrives: [],
  tradeIns: [],
  financing: [],
  activity: [],
};

export function snapshotDemoCrm(): DemoCrmSnapshot {
  return {
    messages: structuredClone(demoStore.messages),
    inquiries: structuredClone(demoStore.inquiries),
    customers: structuredClone(demoStore.customers),
    testDrives: structuredClone(demoStore.testDrives),
    tradeIns: structuredClone(demoStore.tradeIns),
    financing: structuredClone(demoStore.financing),
    activity: structuredClone(demoStore.activity),
  };
}

export function applyDemoCrm(data: DemoCrmSnapshot): void {
  demoStore.messages = structuredClone(data.messages);
  demoStore.inquiries = structuredClone(data.inquiries);
  demoStore.customers = structuredClone(data.customers);
  demoStore.testDrives = structuredClone(data.testDrives);
  demoStore.tradeIns = structuredClone(data.tradeIns);
  demoStore.financing = structuredClone(data.financing);
  demoStore.activity = structuredClone(data.activity);
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
      applyDemoCrm(data);
      return data;
    }
  } catch {
    // Fall back to an empty CRM snapshot.
  }

  applyDemoCrm(EMPTY);
  return EMPTY;
}

export function persistDemoCrmToDisk(data: DemoCrmSnapshot = snapshotDemoCrm()): DemoCrmSnapshot {
  const next = structuredClone(data);
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(next, null, 2), "utf8");
  applyDemoCrm(next);
  return next;
}
