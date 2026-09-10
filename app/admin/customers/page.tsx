"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { listCustomers } from "@/lib/services/crm";
import type { Customer, CustomerStatus, PaginatedResult } from "@/types";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "">("");
  const [result, setResult] = useState<PaginatedResult<Customer> | null>(null);

  useEffect(() => {
    listCustomers({ page, search, status }).then(setResult);
  }, [page, search, status]);

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value as CustomerStatus | ""); setPage(1); }}>
          <option value="">All</option>
          {["new", "active", "interested", "converted", "lost"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
      </div>
      <div className="mt-6 overflow-x-auto">
        {result?.items.length ? (
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-3 py-3">
                    <Link href={`/admin/customers/${item.id}`} className="hover:text-gold">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3">{item.phone}</td>
                  <td className="px-3 py-3">{item.email}</td>
                  <td className="px-3 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState title="No customers yet." description="Customers appear when enquiries are submitted." />
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
