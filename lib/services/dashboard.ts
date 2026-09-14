import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { demoStore } from "@/lib/demo/store";
import { ensureDemoCrmLoaded } from "@/lib/demo/sync-crm";
import { isDemoAuth, isDemoMode } from "@/lib/env";
import { listActivity } from "@/lib/services/crm";
import type { ActivityLog, DashboardStats, Inquiry, Vehicle } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    return demoStore.stats();
  }

  const db = getDb();
  const [vehicles, inquiries, testDrives, tradeIns, messages] = await Promise.all([
    getDocs(query(collection(db, COLLECTIONS.vehicles), limit(400))),
    getDocs(query(collection(db, COLLECTIONS.inquiries), limit(400))),
    getDocs(query(collection(db, COLLECTIONS.testDrives), limit(400))),
    getDocs(query(collection(db, COLLECTIONS.tradeIns), limit(400))),
    getDocs(query(collection(db, COLLECTIONS.contactMessages), limit(400))),
  ]);

  const vehicleDocs = vehicles.docs.map((item) => item.data() as Vehicle);
  const inquiryDocs = inquiries.docs.map((item) => item.data() as Inquiry);

  return {
    totalVehicles: vehicleDocs.filter((item) => item.status !== "archived").length,
    availableVehicles: vehicleDocs.filter((item) => item.status === "available").length,
    reservedVehicles: vehicleDocs.filter((item) => item.status === "reserved").length,
    soldVehicles: vehicleDocs.filter((item) => item.status === "sold").length,
    newInquiries: inquiryDocs.filter((item) => item.status === "new" && !item.archived).length,
    pendingTestDrives: testDrives.docs.filter((item) => item.data().status === "pending").length,
    tradeInRequests: tradeIns.docs.filter((item) => item.data().status === "new").length,
    unreadMessages: messages.docs.filter((item) => item.data().status === "new").length,
  };
}

export async function getRecentActivity(): Promise<ActivityLog[]> {
  const result = await listActivity(1);
  return result.items.slice(0, 8);
}

export async function getRecentInquiries(): Promise<Inquiry[]> {
  if (isDemoMode()) {
    await ensureDemoCrmLoaded();
    return [...demoStore.inquiries]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 6);
  }

  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.inquiries),
      orderBy("createdAt", "desc"),
      limit(6),
    ),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Inquiry);
}

export async function getRecentVehicles(): Promise<Vehicle[]> {
  if (isDemoMode()) {
    return [...demoStore.vehicles]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 6);
  }
  const snapshot = await getDocs(
    query(
      collection(getDb(), COLLECTIONS.vehicles),
      orderBy("createdAt", "desc"),
      limit(6),
    ),
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Vehicle);
}

export async function getAdminProfile(uid: string) {
  if (isDemoAuth()) return demoStore.demoUser;
  const snapshot = await getDoc(doc(getDb(), COLLECTIONS.admins, uid));
  if (!snapshot.exists()) return null;
  return snapshot.data();
}
