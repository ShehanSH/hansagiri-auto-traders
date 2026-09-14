"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRADE_IN_STATUSES } from "@/config/constants";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getTradeInFilterOptions, listTradeIns } from "@/lib/services/trade-ins";
import { formatDate, statusLabel } from "@/utils/format";
import type { PaginatedResult, TradeInRequest, TradeInStatus } from "@/types";

export default function TradeInsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TradeInStatus | "">("");
  const [make, setMake] = useState("");
  const [makes, setMakes] = useState<string[]>([]);
  const [result, setResult] = useState<PaginatedResult<TradeInRequest> | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    getTradeInFilterOptions().then((options) => setMakes(options.makes));
  }, []);

  useEffect(() => {
    listTradeIns({ page, search: debouncedSearch, status, make }).then(setResult);
  }, [page, debouncedSearch, status, make]);

  const filtered = Boolean(debouncedSearch || status || make);

  return (
    <div>
      <h1 className="font-display text-3xl">Trade-ins</h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          value={search}
          placeholder="Name, phone, or model"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as TradeInStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {TRADE_IN_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </Select>
        <Select
          label="Make"
          value={make}
          onChange={(event) => {
            setMake(event.target.value);
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
          <EmptyState
            title={filtered ? "No trade-ins match these filters." : "No trade-in requests yet."}
            description={filtered ? "Try another status or make." : undefined}
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
