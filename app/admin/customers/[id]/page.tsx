"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addCustomerNote, getCustomer, updateCustomer } from "@/lib/services/crm";
import { formatDateTime } from "@/utils/format";
import type { Customer, CustomerStatus } from "@/types";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const { admin } = useAdminAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    getCustomer(params.id).then(setCustomer);
  }, [params.id]);

  if (!customer) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{customer.name}</h1>
        <StatusBadge status={customer.status} />
      </div>
      <p className="text-sm">
        {customer.phone} · {customer.email} · WhatsApp {customer.whatsapp || "—"}
      </p>
      <p className="text-xs text-muted">Last contact {formatDateTime(customer.lastContact)}</p>
      <Select
        label="Status"
        value={customer.status}
        onChange={async (event) => {
          const status = event.target.value as CustomerStatus;
          await updateCustomer(customer.id, { status });
          setCustomer({ ...customer, status });
        }}
      >
        {["new", "active", "interested", "converted", "lost"].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <p className="text-sm text-muted">
        Inquiries {customer.inquiryIds.length} · Test drives {customer.testDriveIds.length} ·
        Trade-ins {customer.tradeInIds.length}
      </p>
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button
        type="button"
        onClick={async () => {
          if (!admin || !note.trim()) return;
          await addCustomerNote(customer.id, note.trim(), admin.uid, admin.displayName || admin.email);
          setNote("");
          setCustomer(await getCustomer(customer.id));
        }}
      >
        Add note
      </Button>
    </div>
  );
}
