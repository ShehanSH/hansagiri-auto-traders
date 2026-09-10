"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { listMessages, markMessageRead } from "@/lib/services/contact";
import { formatDateTime } from "@/utils/format";
import type { ContactMessage, PaginatedResult } from "@/types";

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactMessage["status"] | "">("");
  const [result, setResult] = useState<PaginatedResult<ContactMessage> | null>(null);
  const [open, setOpen] = useState<ContactMessage | null>(null);

  useEffect(() => {
    listMessages({ page, search, status }).then(setResult);
  }, [page, search, status]);

  return (
    <div>
      <h1 className="font-display text-3xl">Messages</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ContactMessage["status"] | "");
            setPage(1);
          }}
        >
          <option value="">All</option>
          <option value="new">new</option>
          <option value="read">read</option>
          <option value="archived">archived</option>
        </Select>
      </div>
      <div className="mt-6 space-y-3">
        {result?.items.length ? (
          result.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className="block w-full border border-white/10 p-4 text-left hover:border-gold/30"
              onClick={async () => {
                setOpen(item);
                if (item.status === "new") await markMessageRead(item.id);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{item.subject}</p>
                <StatusBadge status={item.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {item.name} · {formatDateTime(item.createdAt)}
              </p>
            </button>
          ))
        ) : (
          <EmptyState title="No messages yet." />
        )}
      </div>
      {open ? (
        <div className="mt-8 surface-card p-5 text-sm">
          <h2 className="font-display text-xl">{open.subject}</h2>
          <p className="mt-2 text-muted">
            {open.name} · {open.phone} · {open.email}
          </p>
          <p className="mt-4 whitespace-pre-line">{open.message}</p>
        </div>
      ) : null}
      {result ? (
        <div className="mt-6">
          <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={setPage} />
        </div>
      ) : null}
    </div>
  );
}
