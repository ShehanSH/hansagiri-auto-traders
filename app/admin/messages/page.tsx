"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState, Pagination } from "@/components/ui/Feedback";
import { Button } from "@/components/ui/Button";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { deleteMessage, listMessages, markMessageRead } from "@/lib/services/contact";
import { formatDateTime, statusLabel } from "@/utils/format";
import { toTelHref } from "@/utils/phone";
import type { ContactMessage, PaginatedResult } from "@/types";

const MESSAGE_STATUSES: ContactMessage["status"][] = ["new", "read", "archived"];

export default function MessagesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ContactMessage["status"] | "">("");
  const [result, setResult] = useState<PaginatedResult<ContactMessage> | null>(null);
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const [reload, setReload] = useState(0);
  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    listMessages({ page, search: debouncedSearch, status }).then(setResult);
  }, [page, debouncedSearch, status, reload]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = Boolean(debouncedSearch || status);
  const tel = open ? toTelHref(open.phone) : "";

  async function openMessage(item: ContactMessage) {
    setOpen({ ...item, status: item.status === "new" ? "read" : item.status });
    if (item.status !== "new") return;
    try {
      await markMessageRead(item.id);
      setResult((current) =>
        current
          ? {
              ...current,
              items: current.items.map((entry) =>
                entry.id === item.id ? { ...entry, status: "read" } : entry,
              ),
            }
          : current,
      );
    } catch {
      setOpen(item);
    }
  }

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
            <div key={item.id} className="flex items-start gap-3 border border-white/10 p-4 hover:border-gold/30">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => void openMessage(item)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{item.subject}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {item.name} · {formatDateTime(item.createdAt)}
                </p>
              </button>
              <DeleteRecordButton
                title="Delete this message?"
                onDelete={async () => {
                  await deleteMessage(item.id);
                  if (open?.id === item.id) setOpen(null);
                  setReload((value) => value + 1);
                }}
              />
            </div>
          ))
        ) : (
          <EmptyState
            title={filtered ? "No messages match these filters." : "No messages yet."}
            description={filtered ? "Try another status or search." : undefined}
          />
        )}
      </div>
      {result ? (
        <div className="mt-6">
          <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={setPage} />
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close message"
            onClick={() => setOpen(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-title"
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto border border-gold/20 bg-dark-secondary p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gold-champagne/80">Contact message</p>
                <h2 id="message-title" className="mt-2 font-display text-2xl text-white">
                  {open.subject}
                </h2>
              </div>
              <StatusBadge status={open.status} />
            </div>
            <dl className="mt-5 grid gap-2 text-sm">
              <div>Name: {open.name}</div>
              <div>
                Phone: {tel ? <a href={tel}>{open.phone}</a> : open.phone || "—"}
              </div>
              <div>
                Email: {open.email ? <a href={`mailto:${open.email}`}>{open.email}</a> : "—"}
              </div>
              <div className="text-muted">Received: {formatDateTime(open.createdAt)}</div>
            </dl>
            <p className="mt-5 whitespace-pre-line text-sm text-white/85">{open.message}</p>
            <div className="mt-6 flex justify-end">
              <Button type="button" variant="secondary" onClick={() => setOpen(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
