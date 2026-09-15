import { DEMO_CRM_SEED } from "@/lib/demo/crm-seed";
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

export type DemoCrmSnapshot = {
  messages: ContactMessage[];
  inquiries: Inquiry[];
  customers: Customer[];
  testDrives: TestDriveRequest[];
  tradeIns: TradeInRequest[];
  financing: FinancingInquiry[];
  activity: ActivityLog[];
};

export const EMPTY_DEMO_CRM: DemoCrmSnapshot = {
  messages: [],
  inquiries: [],
  customers: [],
  testDrives: [],
  tradeIns: [],
  financing: [],
  activity: [],
};

export function isEmptyDemoCrm(data: DemoCrmSnapshot): boolean {
  return (
    data.messages.length === 0 &&
    data.inquiries.length === 0 &&
    data.customers.length === 0 &&
    data.testDrives.length === 0 &&
    data.tradeIns.length === 0 &&
    data.financing.length === 0 &&
    data.activity.length === 0
  );
}

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

function mergeById<T extends { id: string }>(seed: T[], persisted: T[]): T[] {
  const ids = new Set(persisted.map((item) => item.id));
  return [...persisted, ...seed.filter((item) => !ids.has(item.id))];
}

export function mergeDemoCrmSeed(data: DemoCrmSnapshot): DemoCrmSnapshot {
  return {
    messages: mergeById(DEMO_CRM_SEED.messages, data.messages),
    inquiries: mergeById(DEMO_CRM_SEED.inquiries, data.inquiries),
    customers: mergeById(DEMO_CRM_SEED.customers, data.customers),
    testDrives: mergeById(DEMO_CRM_SEED.testDrives, data.testDrives),
    tradeIns: mergeById(DEMO_CRM_SEED.tradeIns, data.tradeIns),
    financing: mergeById(DEMO_CRM_SEED.financing, data.financing),
    activity: mergeById(DEMO_CRM_SEED.activity, data.activity),
  };
}
