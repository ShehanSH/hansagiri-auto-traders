"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { INQUIRY_STATUSES } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addInquiryNote, getInquiry, updateInquiry } from "@/lib/services/inquiries";
import { logActivity } from "@/lib/services/crm";
import { formatDateTime } from "@/utils/format";
import { toTelHref } from "@/utils/phone";
import { toWhatsAppHref } from "@/utils/whatsapp";
import type { Inquiry, InquiryStatus } from "@/types";

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    getInquiry(params.id).then(setInquiry);
  }, [params.id]);

  if (!inquiry) return <p className="text-muted">Loading…</p>;

  const tel = toTelHref(inquiry.phone);
  const wa = toWhatsAppHref(inquiry.whatsapp || inquiry.phone);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">{inquiry.name}</h1>
        <StatusBadge status={inquiry.status} />
      </div>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>Phone: {tel ? <a href={tel}>{inquiry.phone}</a> : inquiry.phone}</div>
        <div>WhatsApp: {wa ? <a href={wa}>Open</a> : "—"}</div>
        <div>Email: <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></div>
        <div>Vehicle: {inquiry.vehicleLabel || "—"}</div>
        <div>Source: {inquiry.source}</div>
        <div>Created: {formatDateTime(inquiry.createdAt)}</div>
      </dl>
      <p className="text-sm text-white/80">{inquiry.message}</p>
      <p className="text-xs text-muted">Internal notes are never shown to customers.</p>
      <Select
        label="Status"
        value={inquiry.status}
        onChange={async (event) => {
          const status = event.target.value as InquiryStatus;
          await updateInquiry(inquiry.id, { status, lastContact: new Date().toISOString() });
          if (admin) {
            await logActivity({
              userId: admin.uid,
              userEmail: admin.email,
              action: `Inquiry status changed to ${status}`,
              entityType: "inquiry",
              entityId: inquiry.id,
            });
          }
          setInquiry({ ...inquiry, status });
          toast.push("Status updated");
        }}
      >
        {INQUIRY_STATUSES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button
        type="button"
        onClick={async () => {
          if (!note.trim() || !admin) return;
          await addInquiryNote(inquiry.id, {
            body: note.trim(),
            createdAt: new Date().toISOString(),
            createdBy: admin.uid,
            createdByName: admin.displayName || admin.email,
          });
          setNote("");
          setInquiry(await getInquiry(inquiry.id));
        }}
      >
        Add note
      </Button>
      <ul className="space-y-3 text-sm">
        {inquiry.notes.map((item) => (
          <li key={item.id} className="border border-white/10 p-3">
            <p>{item.body}</p>
            <p className="mt-1 text-xs text-muted">
              {item.createdByName} · {formatDateTime(item.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
