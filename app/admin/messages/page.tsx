"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { listMessages, markMessageRead } from "@/lib/services/contact";
import { formatDateTime, statusLabel } from "@/utils/format";
import type { ContactMessage, PaginatedResult } from "@/types";

const MESSAGE_STATUSES: ContactMessage["status"][] = ["new", "read", "archived"];

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactMessage["status"] | "">("");
  const [result, setResult] = useState<PaginatedResult<ContactMessage> | null>(null);
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    listMessages({ page, search: debouncedSearch, status }).then(setResult);
  }, [page, debouncedSearch, status]);

  const filtered = Boolean(debouncedSearch || status);

  return (
    <div>
      <h1 className="font-display text-3xl">Messages</h1>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search"
          value={search}
          placeholder="Name or subject"
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ContactMessage["status"] | "");
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {MESSAGE_STATUSES.map((item) => (
            <option key={item} value={item}>
              {statusLabel(item)}
            </option>
          ))}
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
          <EmptyState
            title={filtered ? "No messages match these filters." : "No messages yet."}
            description={filtered ? "Try another status or search." : undefined}
          />
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
