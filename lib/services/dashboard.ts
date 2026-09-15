import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { ensureDemoCrmLoaded } from "@/lib/demo/sync-crm";
import { ensureFirebaseConfigured, isDemoAuth, isMemoryCatalog } from "@/lib/env";
import { listActivity } from "@/lib/services/crm";
import { listMessages } from "@/lib/services/contact";
import { listInquiries } from "@/lib/services/inquiries";
import { listTestDrives } from "@/lib/services/test-drives";
import { listTradeIns } from "@/lib/services/trade-ins";
import { listAdminVehicles } from "@/lib/services/vehicles";
import type { ActivityLog, DashboardStats, Inquiry, Vehicle } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await ensureFirebaseConfigured();
  if (isMemoryCatalog()) {
    await ensureDemoCrmLoaded();
    return demoStore.stats();
  }

  const [vehiclesResult, inquiriesResult, testDrivesResult, tradeInsResult, messagesResult] = await Promise.all([
    listAdminVehicles({ page: 1, pageSize: 400 }),
    listInquiries({ page: 1, pageSize: 400 }),
    listTestDrives({ page: 1, pageSize: 400 }),
    listTradeIns({ page: 1, pageSize: 400 }),
    listMessages({ page: 1, pageSize: 400 }),
  ]);

  const vehicles = vehiclesResult.items;
  return {
    totalVehicles: vehicles.filter((item) => item.status !== "archived").length,
    availableVehicles: vehicles.filter((item) => item.status === "available").length,
    reservedVehicles: vehicles.filter((item) => item.status === "reserved").length,
    soldVehicles: vehicles.filter((item) => item.status === "sold").length,
    newInquiries: inquiriesResult.items.filter((item) => item.status === "new" && !item.archived).length,
    pendingTestDrives: testDrivesResult.items.filter((item) => item.status === "pending").length,
    tradeInRequests: tradeInsResult.items.filter((item) => item.status === "new").length,
    unreadMessages: messagesResult.items.filter((item) => item.status === "new").length,
  };
}

export async function getRecentActivity(): Promise<ActivityLog[]> {
  const result = await listActivity(1);
  return result.items.slice(0, 8);
}

export async function getRecentInquiries(): Promise<Inquiry[]> {
  const result = await listInquiries({ page: 1, pageSize: 6 });
  return result.items;
}

export async function getRecentVehicles(): Promise<Vehicle[]> {
  await ensureFirebaseConfigured();
  const result = await listAdminVehicles({ page: 1, pageSize: 6, sort: "newest" });
  return result.items;
}

export async function getAdminProfile(uid: string) {
  if (isDemoAuth()) return demoStore.demoUser;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.admins, uid));
  if (!snapshot.exists()) return null;
  return snapshot.data();
}
