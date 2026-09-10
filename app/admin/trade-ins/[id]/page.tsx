"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TRADE_IN_STATUSES } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addTradeInNote, getTradeIn, updateTradeIn } from "@/lib/services/trade-ins";
import { logActivity } from "@/lib/services/crm";
import { formatMileage, formatPrice } from "@/utils/format";
import { toTelHref } from "@/utils/phone";
import type { TradeInRequest, TradeInStatus } from "@/types";

export default function TradeInDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [item, setItem] = useState<TradeInRequest | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    getTradeIn(params.id).then(setItem);
  }, [params.id]);

  if (!item) return <p className="text-muted">Loading…</p>;
  const tel = toTelHref(item.phone);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{item.name}</h1>
        <StatusBadge status={item.status} />
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
            <img key={image.path} src={image.url} alt="" className="h-32 w-full object-cover" />
          ))}
        </div>
      ) : null}
      <Select
        label="Status"
        value={item.status}
        onChange={async (event) => {
          const status = event.target.value as TradeInStatus;
          await updateTradeIn(item.id, { status });
          setItem({ ...item, status });
        }}
      >
        {TRADE_IN_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </Select>
      <Input
        label="Estimated valuation"
        type="number"
        defaultValue={item.estimatedValuation ?? ""}
        onBlur={async (event) => {
          const estimatedValuation = Number(event.target.value) || null;
          await updateTradeIn(item.id, { estimatedValuation });
          toast.push("Valuation saved");
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
      <Button
        type="button"
        onClick={async () => {
          if (!admin || !note.trim()) return;
          await addTradeInNote(item.id, {
            body: note.trim(),
            createdAt: new Date().toISOString(),
            createdBy: admin.uid,
            createdByName: admin.displayName || admin.email,
          });
          if (admin) {
            await logActivity({
              userId: admin.uid,
              userEmail: admin.email,
              action: "Trade-in note added",
              entityType: "tradeIn",
              entityId: item.id,
            });
          }
          setNote("");
          setItem(await getTradeIn(item.id));
        }}
      >
        Add note
      </Button>
    </div>
  );
}
