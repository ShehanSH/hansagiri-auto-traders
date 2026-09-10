"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getDashboardStats, getRecentInquiries, getRecentVehicles } from "@/lib/services/dashboard";
import { listActivity } from "@/lib/services/crm";
import { formatDate, formatPrice, vehicleTitle } from "@/utils/format";
import type { ActivityLog, DashboardStats, Inquiry, Vehicle } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentInquiries(),
      getRecentVehicles(),
      listActivity(1),
    ]).then(([nextStats, nextInquiries, nextVehicles, nextActivity]) => {
      setStats(nextStats);
      setInquiries(nextInquiries);
      setVehicles(nextVehicles);
      setActivity(nextActivity.items);
    });
  }, []);

  const cards = stats
    ? [
        ["Total vehicles", stats.totalVehicles],
        ["Available", stats.availableVehicles],
        ["Reserved", stats.reservedVehicles],
        ["Sold", stats.soldVehicles],
        ["New inquiries", stats.newInquiries],
        ["Pending test drives", stats.pendingTestDrives],
        ["Trade-in requests", stats.tradeInRequests],
        ["Unread messages", stats.unreadMessages],
      ]
    : [];

  const max = Math.max(...cards.map(([, value]) => Number(value)), 1);

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="surface-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
            <p className="mt-3 font-display text-3xl text-gold">{value}</p>
            <div className="mt-4 h-1 bg-white/5">
              <div className="h-1 bg-gold" style={{ width: `${(Number(value) / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-3">
        <section className="surface-card p-5 xl:col-span-1">
          <h2 className="font-display text-xl">Recent inquiries</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {inquiries.length ? (
              inquiries.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3">
                  <Link href={`/admin/inquiries/${item.id}`} className="hover:text-gold">
                    {item.name}
                    <span className="block text-xs text-muted">{item.vehicleLabel || "General"}</span>
                  </Link>
                  <StatusBadge status={item.status} />
                </li>
              ))
            ) : (
              <li className="text-muted">No customer inquiries yet.</li>
            )}
          </ul>
        </section>
        <section className="surface-card p-5">
          <h2 className="font-display text-xl">Recent vehicles</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {vehicles.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3">
                <Link href={`/admin/vehicles/${item.id}`} className="hover:text-gold">
                  {vehicleTitle(item)}
                  <span className="block text-xs text-muted">
                    {formatPrice(item.price, item.currency)}
                  </span>
                </Link>
                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        </section>
        <section className="surface-card p-5">
          <h2 className="font-display text-xl">Activity</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {activity.length ? (
              activity.map((item) => (
                <li key={item.id}>
                  {item.action}
                  <span className="block text-xs">{formatDate(item.timestamp)}</span>
                </li>
              ))
            ) : (
              <li>No recent activity.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
