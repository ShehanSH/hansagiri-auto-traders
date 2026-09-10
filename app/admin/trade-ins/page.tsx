"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRADE_IN_STATUSES } from "@/config/constants";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { listTradeIns } from "@/lib/services/trade-ins";
import { formatDate } from "@/utils/format";
import type { PaginatedResult, TradeInRequest, TradeInStatus } from "@/types";

export default function TradeInsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TradeInStatus | "">("");
  const [result, setResult] = useState<PaginatedResult<TradeInRequest> | null>(null);

  useEffect(() => {
    listTradeIns({ page, search, status }).then(setResult);
  }, [page, search, status]);

  return (
    <div>
      <h1 className="font-display text-3xl">Trade-ins</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value as TradeInStatus | ""); setPage(1); }}>
          <option value="">All</option>
          {TRADE_IN_STATUSES.map((item) => (
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
                <th className="px-3 py-3">Submitted</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <Link href={`/admin/trade-ins/${item.id}`} className="hover:text-gold">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    {item.year} {item.make} {item.model}
                  </td>
                  <td className="px-3 py-3">{formatDate(item.createdAt)}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No trade-in requests yet." />
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
