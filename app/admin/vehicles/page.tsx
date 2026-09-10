"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
import { listAdminVehicles } from "@/lib/services/vehicles";
import { formatPrice, vehicleTitle } from "@/utils/format";
import type { PaginatedResult, Vehicle, VehicleStatus } from "@/types";

export default function AdminVehiclesPage() {
  const { admin } = useAdminAuth();
  const canWrite = hasRole(admin?.role, "vehicles:write") || hasRole(admin?.role, "*");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [result, setResult] = useState<PaginatedResult<Vehicle> | null>(null);

  useEffect(() => {
    listAdminVehicles({
      page,
      filters: { keyword: search, status },
    }).then(setResult);
  }, [page, search, status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Vehicles</h1>
        {canWrite ? (
          <Link href="/admin/vehicles/new">
            <Button>Add vehicle</Button>
          </Link>
        ) : null}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as VehicleStatus | "");
            setPage(1);
          }}
        >
          <option value="">All</option>
          {["draft", "available", "reserved", "sold", "archived"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>
      <div className="mt-6 overflow-x-auto">
        {result?.items.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Price</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Featured</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <Link href={`/admin/vehicles/${item.id}`} className="hover:text-gold">
                      {vehicleTitle(item)}
                      <span className="block text-xs text-muted">{item.stockId}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3">{formatPrice(item.price, item.currency)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-3">{item.featured ? "Yes" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No vehicles yet." description="Add a vehicle as a draft, then publish it." />
        )}
      </div>
      {result ? (
        <div className="mt-6">
          <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={setPage} />
        </div>
      ) : null}
    </div>
  );
}
