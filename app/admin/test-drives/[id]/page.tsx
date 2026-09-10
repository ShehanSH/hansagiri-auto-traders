"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TEST_DRIVE_STATUSES } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addTestDriveNote, getTestDrive, updateTestDriveStatus } from "@/lib/services/test-drives";
import { logActivity } from "@/lib/services/crm";
import { formatDateTime } from "@/utils/format";
import type { TestDriveRequest, TestDriveStatus } from "@/types";

export default function TestDriveDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [item, setItem] = useState<TestDriveRequest | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    getTestDrive(params.id).then(setItem);
  }, [params.id]);

  if (!item) return <p className="text-muted">Loading…</p>;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{item.name}</h1>
        <StatusBadge status={item.status} />
      </div>
      <p className="text-sm text-muted">
        {item.vehicleLabel} · {item.preferredDate} {item.preferredTime}
      </p>
      <p className="text-sm">{item.phone} · {item.email}</p>
      <p className="text-sm">{item.message}</p>
      <Select
        label="Status"
        value={item.status}
        onChange={async (event) => {
          const status = event.target.value as TestDriveStatus;
          await updateTestDriveStatus(item.id, status);
          if (admin) {
            await logActivity({
              userId: admin.uid,
              userEmail: admin.email,
              action: `Test drive ${status}`,
              entityType: "testDrive",
              entityId: item.id,
            });
          }
          setItem({ ...item, status });
          toast.push("Updated");
        }}
      >
        {TEST_DRIVE_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </Select>
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button
        type="button"
        onClick={async () => {
          if (!admin || !note.trim()) return;
          await addTestDriveNote(item.id, {
            body: note.trim(),
            createdAt: new Date().toISOString(),
            createdBy: admin.uid,
            createdByName: admin.displayName || admin.email,
          });
          setNote("");
          setItem(await getTestDrive(item.id));
        }}
      >
        Add note
      </Button>
      <ul className="space-y-3 text-sm">
        {item.notes.map((entry) => (
          <li key={entry.id} className="border border-white/10 p-3">
            {entry.body}
            <span className="mt-1 block text-xs text-muted">{formatDateTime(entry.createdAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
