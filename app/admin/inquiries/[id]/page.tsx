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
import { formatDateTime, statusLabel } from "@/utils/format";
import { toUserMessage } from "@/utils/errors";
import { toTelHref } from "@/utils/phone";
import { toWhatsAppHref } from "@/utils/whatsapp";
import type { Inquiry, InquiryStatus } from "@/types";

export default function InquiryDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [status, setStatus] = useState<InquiryStatus>("new");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInquiry(params.id).then((item) => {
      setInquiry(item);
      if (item) setStatus(item.status);
    });
  }, [params.id]);

  if (!inquiry) return <p className="text-muted">Loading…</p>;

  const tel = toTelHref(inquiry.phone);
  const wa = toWhatsAppHref(inquiry.whatsapp || inquiry.phone);

  async function onSave() {
    if (!inquiry || saving) return;
    setSaving(true);
    try {
      await updateInquiry(inquiry.id, { status, lastContact: new Date().toISOString() });
      if (admin && status !== inquiry.status) {
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: `Inquiry status changed to ${status}`,
          entityType: "inquiry",
          entityId: inquiry.id,
        }).catch(() => undefined);
      }
      if (note.trim() && admin) {
        await addInquiryNote(inquiry.id, {
          body: note.trim(),
          createdAt: new Date().toISOString(),
          createdBy: admin.uid,
          createdByName: admin.displayName || admin.email,
        });
        setNote("");
      }
      const next = await getInquiry(inquiry.id);
      if (next) {
        setInquiry(next);
        setStatus(next.status);
      } else {
        setInquiry({ ...inquiry, status });
      }
      toast.push("Saved");
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">{inquiry.name}</h1>
        <StatusBadge status={status} />
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
        value={status}
        onChange={(event) => setStatus(event.target.value as InquiryStatus)}
      >
        {INQUIRY_STATUSES.map((item) => (
          <option key={item} value={item}>
            {statusLabel(item)}
          </option>
        ))}
      </Select>
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button type="button" loading={saving} onClick={() => void onSave()}>
        Save
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
