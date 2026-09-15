"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input, Select } from "@/components/ui/Field";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { listInquiries, deleteInquiry } from "@/lib/services/inquiries";
import { INQUIRY_SOURCES, INQUIRY_STATUSES } from "@/config/constants";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDate, statusLabel } from "@/utils/format";
import type { Inquiry, InquirySource, InquiryStatus, PaginatedResult } from "@/types";

export default function InquiriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InquiryStatus | "">("");
  const [source, setSource] = useState<InquirySource | "">("");
  const [result, setResult] = useState<PaginatedResult<Inquiry> | null>(null);
  const [reload, setReload] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    listInquiries({ page, search: debouncedSearch, status, source }).then(setResult);
  }, [page, debouncedSearch, status, source, reload]);

  const filtered = Boolean(debouncedSearch || status || source);

  return (
    <div>
      <h1 className="font-display text-3xl">Inquiries</h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          value={search}
          placeholder="Name or phone"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as InquiryStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {INQUIRY_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </Select>
        <Select
          label="Source"
          value={source}
          onChange={(event) => {
            setSource(event.target.value as InquirySource | "");
            setPage(1);
          }}
        >
          <option value="">All sources</option>
          {INQUIRY_SOURCES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
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
                <th className="px-3 py-3">Actions</th>
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
                  <td className="px-3 py-3">{statusLabel(item.source)}</td>
                  <td className="px-3 py-3">
                    <DeleteRecordButton
                      title="Delete this enquiry?"
                      onDelete={async () => {
                        await deleteInquiry(item.id);
                        setReload((value) => value + 1);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            title={filtered ? "No inquiries match these filters." : "No customer inquiries yet."}
            description={filtered ? "Try another status or source." : undefined}
          />
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
