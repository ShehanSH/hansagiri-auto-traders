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
