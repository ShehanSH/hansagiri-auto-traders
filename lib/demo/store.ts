import { DEFAULT_PRIVACY, DEFAULT_SETTINGS, DEFAULT_TERMS } from "@/config/defaults";
import { DEMO_CRM_SEED } from "@/lib/demo/crm-seed";
import { DEMO_VEHICLES } from "@/lib/demo/vehicles";
import type {
  ActivityLog,
  AdminUser,
  ContactMessage,
  Customer,
  DashboardStats,
  FinancingInquiry,
  Inquiry,
  MediaAsset,
  SiteSettings,
  TestDriveRequest,
  TradeInRequest,
  Vehicle,
} from "@/types";

function clone<T>(value: T): T {
  return structuredClone(value);
}

class DemoStore {
  vehicles: Vehicle[] = clone(DEMO_VEHICLES);
  inquiries: Inquiry[] = clone(DEMO_CRM_SEED.inquiries);
  testDrives: TestDriveRequest[] = clone(DEMO_CRM_SEED.testDrives);
  tradeIns: TradeInRequest[] = clone(DEMO_CRM_SEED.tradeIns);
  customers: Customer[] = clone(DEMO_CRM_SEED.customers);
  messages: ContactMessage[] = clone(DEMO_CRM_SEED.messages);
  financing: FinancingInquiry[] = clone(DEMO_CRM_SEED.financing);
  activity: ActivityLog[] = clone(DEMO_CRM_SEED.activity);
  media: MediaAsset[] = [];
  settings: SiteSettings = {
    ...clone(DEFAULT_SETTINGS),
    privacyPolicy: DEFAULT_PRIVACY,
    terms: DEFAULT_TERMS,
  };
  admins: AdminUser[] = [
    {
      uid: "demo-admin",
      email: "admin@local.dev",
      displayName: "Demo Admin",
      role: "super_admin",
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];
  demoUser = this.admins[0];

  now(): string {
    return new Date().toISOString();
  }

  id(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  stats(): DashboardStats {
    return {
      totalVehicles: this.vehicles.filter((item) => item.status !== "archived").length,
      availableVehicles: this.vehicles.filter((item) => item.status === "available").length,
      reservedVehicles: this.vehicles.filter((item) => item.status === "reserved").length,
      soldVehicles: this.vehicles.filter((item) => item.status === "sold").length,
      newInquiries: this.inquiries.filter((item) => item.status === "new" && !item.archived)
        .length,
      pendingTestDrives: this.testDrives.filter((item) => item.status === "pending").length,
      tradeInRequests: this.tradeIns.filter((item) => item.status === "new").length,
      unreadMessages: this.messages.filter((item) => item.status === "new").length,
    };
  }
}

export const demoStore = new DemoStore();
