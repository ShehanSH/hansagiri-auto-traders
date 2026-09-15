"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CUSTOMER_STATUSES } from "@/config/constants";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { listCustomers, deleteCustomer, type CustomerActivityFilter } from "@/lib/services/crm";
import { statusLabel } from "@/utils/format";
import type { Customer, CustomerStatus, PaginatedResult } from "@/types";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CustomerStatus | "">("");
  const [activity, setActivity] = useState<CustomerActivityFilter>("");
  const [result, setResult] = useState<PaginatedResult<Customer> | null>(null);
  const [reload, setReload] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    listCustomers({ page, search: debouncedSearch, status, activity }).then(setResult);
  }, [page, debouncedSearch, status, activity, reload]);

  const filtered = Boolean(debouncedSearch || status || activity);

  return (
    <div>
      <h1 className="font-display text-3xl">Customers</h1>
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
            setStatus(event.target.value as CustomerStatus | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {CUSTOMER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
        </Select>
        <Select
          label="Activity"
          value={activity}
          onChange={(event) => {
            setActivity(event.target.value as CustomerActivityFilter);
            setPage(1);
          }}
        >
          <option value="">All customers</option>
          <option value="inquiry">Has inquiry</option>
          <option value="test_drive">Has test drive</option>
          <option value="trade_in">Has trade-in</option>
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
                <th className="px-3 py-3">Actions</th>
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
                  <td className="px-3 py-3">
                    <DeleteRecordButton
                      title="Delete this customer?"
                      onDelete={async () => {
                        await deleteCustomer(item.id);
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
            title={filtered ? "No customers match these filters." : "No customers yet."}
            description={
              filtered ? "Try another status or activity." : "Customers appear when enquiries are submitted."
            }
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
