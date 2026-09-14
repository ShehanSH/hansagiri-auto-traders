"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/services/crm";
import { deleteVehicle, listAdminVehicles } from "@/lib/services/vehicles";
import { formatPrice, vehicleTitle } from "@/utils/format";
import type { PaginatedResult, Vehicle, VehicleStatus } from "@/types";

export default function AdminVehiclesPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const canWrite = hasRole(admin?.role, "vehicles:write") || hasRole(admin?.role, "*");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [result, setResult] = useState<PaginatedResult<Vehicle> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    listAdminVehicles({
      page,
      filters: { keyword: search, status },
    }).then(setResult);
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

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
                {canWrite ? <th className="px-3 py-3">Actions</th> : null}
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
                  {canWrite ? (
                    <td className="px-3 py-3">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setPendingDelete(item)}
                      >
                        Delete
                      </Button>
                    </td>
                  ) : null}
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
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this vehicle?"
        description="This permanently removes the listing from the admin dashboard and the public website. This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onClose={() => {
          if (deleting) return;
          setPendingDelete(null);
        }}
        onConfirm={() => {
          void (async () => {
            if (!pendingDelete || !admin) return;
            setDeleting(true);
            try {
              await deleteVehicle(pendingDelete.id, pendingDelete.stockId);
              await logActivity({
                userId: admin.uid,
                userEmail: admin.email,
                action: "Vehicle deleted",
                entityType: "vehicle",
                entityId: pendingDelete.id,
              });
              toast.push("Vehicle deleted");
              setPendingDelete(null);
              load();
            } finally {
              setDeleting(false);
            }
          })();
        }}
      />
    </div>
  );
}
