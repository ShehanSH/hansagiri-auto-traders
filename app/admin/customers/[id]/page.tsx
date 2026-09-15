"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CUSTOMER_STATUSES } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addCustomerNote, deleteCustomer, getCustomer, updateCustomer } from "@/lib/services/crm";
import { formatDateTime, statusLabel } from "@/utils/format";
import { toUserMessage } from "@/utils/errors";
import type { Customer, CustomerStatus } from "@/types";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [missing, setMissing] = useState(false);
  const [status, setStatus] = useState<CustomerStatus>("new");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCustomer(params.id).then((item) => {
      if (!item) {
        setMissing(true);
        return;
      }
      setCustomer(item);
      setStatus(item.status);
    });
  }, [params.id]);

  if (missing) return <p className="text-muted">Customer not found.</p>;
  if (!customer) return <p className="text-muted">Loading…</p>;

  async function onSave() {
    if (!customer || saving) return;
    setSaving(true);
    try {
      await updateCustomer(customer.id, { status });
      if (admin && note.trim()) {
        await addCustomerNote(customer.id, note.trim(), admin.uid, admin.displayName || admin.email);
        setNote("");
      }
      const next = await getCustomer(customer.id);
      if (next) {
        setCustomer(next);
        setStatus(next.status);
      } else {
        setCustomer({ ...customer, status });
      }
      toast.push("Saved");
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{customer.name}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <DeleteRecordButton
            title="Delete this customer?"
            onDelete={async () => {
              await deleteCustomer(customer.id);
              router.push("/admin/customers");
            }}
          />
        </div>
      </div>
      <p className="text-sm">
        {customer.phone} · {customer.email || "—"} · WhatsApp {customer.whatsapp || "—"}
      </p>
      <p className="text-xs text-muted">Last contact {formatDateTime(customer.lastContact)}</p>
      <Select
        label="Status"
        value={status}
        onChange={(event) => setStatus(event.target.value as CustomerStatus)}
      >
        {CUSTOMER_STATUSES.map((item) => (
          <option key={item} value={item}>
            {statusLabel(item)}
          </option>
        ))}
      </Select>
      <p className="text-sm text-muted">
        Inquiries {customer.inquiryIds.length} · Test drives {customer.testDriveIds.length} ·
        Trade-ins {customer.tradeInIds.length}
      </p>
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button type="button" loading={saving} onClick={() => void onSave()}>
        Save
      </Button>
      <ul className="space-y-3 text-sm">
        {customer.notes.map((item) => (
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
