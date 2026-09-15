"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { VEHICLE_STATUSES, VEHICLE_TYPES } from "@/config/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { hasRole } from "@/lib/auth/permissions";
import { logActivity } from "@/lib/services/crm";
import { deleteVehicle, getAdminFilterOptions, listAdminVehicles } from "@/lib/services/vehicles";
import { formatPrice, statusLabel, vehicleTitle } from "@/utils/format";
import type { PaginatedResult, Vehicle, VehicleStatus, VehicleType } from "@/types";

export default function AdminVehiclesPage() {
  const { admin } = useAdminAuth();
  const toast = useToast();
  const canWrite = hasRole(admin?.role, "vehicles:write") || hasRole(admin?.role, "*");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [result, setResult] = useState<PaginatedResult<Vehicle> | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const load = useCallback(() => {
    listAdminVehicles({
      page,
      filters: {
        keyword: debouncedSearch,
        vehicleType,
        make,
        model,
        status,
      },
    }).then(setResult);
  }, [page, debouncedSearch, vehicleType, make, model, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getAdminFilterOptions(make).then((options) => {
      setMakes(options.makes);
      setModels(options.models);
      setModel((current) => (current && !options.models.includes(current) ? "" : current));
    });
  }, [make]);

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
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          label="Search"
          value={search}
          placeholder="Name or stock ID"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Type"
          value={vehicleType}
          onChange={(event) => {
            setVehicleType(event.target.value as VehicleType | "");
            setPage(1);
          }}
        >
          <option value="">All types</option>
          {VEHICLE_TYPES.map((item) => (
            <option key={item} value={item}>
              {item === "used" ? "Pre-owned" : "New"}
            </option>
          ))}
        </Select>
        <Select
          label="Make"
          value={make}
          onChange={(event) => {
            setMake(event.target.value);
            setModel("");
            setPage(1);
          }}
        >
          <option value="">All makes</option>
          {makes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="Model"
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All models</option>
          {models.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as VehicleStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {VEHICLE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
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
          <EmptyState
            title={debouncedSearch || vehicleType || make || model || status ? "No vehicles match these filters." : "No vehicles yet."}
            description={
              debouncedSearch || vehicleType || make || model || status
                ? "Try another type, make, or model."
                : "Add a vehicle as a draft, then publish it."
            }
          />
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
              toast.push("The vehicle listing was deleted successfully.");
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
