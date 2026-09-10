"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { listInquiries } from "@/lib/services/inquiries";
import { INQUIRY_STATUSES } from "@/config/constants";
import { formatDate } from "@/utils/format";
import type { Inquiry, InquiryStatus, PaginatedResult } from "@/types";

export default function InquiriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [result, setResult] = useState<PaginatedResult<Inquiry> | null>(null);

  useEffect(() => {
    listInquiries({ page, search, status }).then(setResult);
  }, [page, search, status]);

  return (
    <div>
      <h1 className="font-display text-3xl">Inquiries</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value as InquiryStatus | ""); setPage(1); }}>
          <option value="">All</option>
          {INQUIRY_STATUSES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </div>
      <div className="mt-6 overflow-x-auto">
        {result?.items.length ? (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3">Customer</th>
                <th className="px-3 py-3">Vehicle</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <Link href={`/admin/inquiries/${item.id}`} className="hover:text-gold">
                      {item.name}
                      <span className="block text-xs text-muted">{item.phone}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3">{item.vehicleLabel || "—"}</td>
                  <td className="px-3 py-3">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-3 py-3">{item.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No customer inquiries yet." />
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
