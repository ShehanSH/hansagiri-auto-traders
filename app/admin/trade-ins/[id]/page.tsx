"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TRADE_IN_STATUSES } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addTradeInNote, deleteTradeIn, getTradeIn, updateTradeIn } from "@/lib/services/trade-ins";
import { logActivity } from "@/lib/services/crm";
import { formatDateTime, formatMileage, formatPrice, statusLabel } from "@/utils/format";
import { toUserMessage } from "@/utils/errors";
import { toTelHref } from "@/utils/phone";
import type { TradeInRequest, TradeInStatus } from "@/types";

export default function TradeInDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [item, setItem] = useState<TradeInRequest | null>(null);
  const [status, setStatus] = useState<TradeInStatus>("new");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTradeIn(params.id).then((next) => {
      setItem(next);
      if (next) setStatus(next.status);
    });
  }, [params.id]);

  if (!item) return <p className="text-muted">Loading…</p>;
  const tel = toTelHref(item.phone);

  async function onSave() {
    if (!item || saving) return;
    setSaving(true);
    try {
      await updateTradeIn(item.id, { status });
      if (admin && status !== item.status) {
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: `Trade-in status changed to ${status}`,
          entityType: "tradeIn",
          entityId: item.id,
        }).catch(() => undefined);
      }
      if (note.trim() && admin) {
        await addTradeInNote(item.id, {
          body: note.trim(),
          createdAt: new Date().toISOString(),
          createdBy: admin.uid,
          createdByName: admin.displayName || admin.email,
        });
        setNote("");
      }
      const next = await getTradeIn(item.id);
      if (next) {
        setItem(next);
        setStatus(next.status);
      } else {
        setItem({ ...item, status });
      }
      toast.push("Trade-in request has been saved.");
    } catch (error) {
      toast.push(toUserMessage(error, "Could not save this trade-in. Please try again."), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{item.name}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <DeleteRecordButton
            title="Delete this trade-in?"
            onDelete={async () => {
              await deleteTradeIn(item.id);
              router.push("/admin/trade-ins");
            }}
          />
        </div>
      </div>
      <p className="text-sm">
        {item.year} {item.make} {item.model} · {formatMileage(item.mileage)}
      </p>
      <p className="text-sm">
        {tel ? <a href={tel}>{item.phone}</a> : item.phone} · {item.email}
      </p>
      <p className="text-sm text-muted">{item.notes}</p>
      {item.images.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {item.images.map((image) => (
            <img key={image.path || image.url} src={image.url} alt="" className="h-32 w-full object-cover" />
          ))}
        </div>
      ) : null}
      <Select
        label="Status"
        value={status}
        onChange={(event) => setStatus(event.target.value as TradeInStatus)}
      >
        {TRADE_IN_STATUSES.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </Select>
      <Input
        label="Estimated valuation"
        type="number"
        defaultValue={item.estimatedValuation ?? ""}
        onBlur={async (event) => {
          const estimatedValuation = Number(event.target.value) || null;
          await updateTradeIn(item.id, { estimatedValuation });
          toast.push("Estimated valuation has been saved.");
        }}
      />
      {item.estimatedValuation ? (
        <p className="text-sm text-gold">{formatPrice(item.estimatedValuation)}</p>
      ) : null}
      <Textarea
        label="Valuation notes"
        defaultValue={item.valuationNotes}
        onBlur={async (event) => {
          await updateTradeIn(item.id, { valuationNotes: event.target.value });
        }}
      />
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button type="button" loading={saving} onClick={() => void onSave()}>
        Save
      </Button>
      <ul className="space-y-3 text-sm">
        {item.adminNotes.map((entry) => (
          <li key={entry.id} className="border border-white/10 p-3">
            <p>{entry.body}</p>
            <p className="mt-1 text-xs text-muted">
              {entry.createdByName} · {formatDateTime(entry.createdAt)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
