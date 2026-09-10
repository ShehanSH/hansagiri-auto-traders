"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TEST_DRIVE_STATUSES } from "@/config/constants";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { listTestDrives } from "@/lib/services/test-drives";
import { formatDate } from "@/utils/format";
import type { PaginatedResult, TestDriveRequest, TestDriveStatus } from "@/types";

export default function TestDrivesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TestDriveStatus | "">("");
  const [result, setResult] = useState<PaginatedResult<TestDriveRequest> | null>(null);

  useEffect(() => {
    listTestDrives({ page, search, status }).then(setResult);
  }, [page, search, status]);

  return (
    <div>
      <h1 className="font-display text-3xl">Test drives</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value as TestDriveStatus | ""); setPage(1); }}>
          <option value="">All</option>
          {TEST_DRIVE_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </div>
      <div className="mt-6 overflow-x-auto">
        {result?.items.length ? (
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Preferred</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <Link href={`/admin/test-drives/${item.id}`} className="hover:text-gold">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{item.vehicleLabel || "—"}</td>
                  <td className="px-3 py-3">
                    {formatDate(item.preferredDate)} {item.preferredTime}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No test drive requests yet." />
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
