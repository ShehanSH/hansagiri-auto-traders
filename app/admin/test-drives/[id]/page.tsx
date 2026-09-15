"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TEST_DRIVE_STATUSES } from "@/config/constants";
import { Button } from "@/components/ui/Button";
import { Select, Textarea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { addTestDriveNote, deleteTestDrive, getTestDrive, updateTestDriveStatus } from "@/lib/services/test-drives";
import { logActivity } from "@/lib/services/crm";
import { formatDateTime, statusLabel } from "@/utils/format";
import { toUserMessage } from "@/utils/errors";
import type { TestDriveRequest, TestDriveStatus } from "@/types";

export default function TestDriveDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { admin } = useAdminAuth();
  const [item, setItem] = useState<TestDriveRequest | null>(null);
  const [status, setStatus] = useState<TestDriveStatus>("pending");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTestDrive(params.id).then((next) => {
      setItem(next);
      if (next) setStatus(next.status);
    });
  }, [params.id]);

  if (!item) return <p className="text-muted">Loading…</p>;

  async function onSave() {
    if (!item || saving) return;
    setSaving(true);
    try {
      await updateTestDriveStatus(item.id, status);
      if (admin && status !== item.status) {
        await logActivity({
          userId: admin.uid,
          userEmail: admin.email,
          action: `Test drive ${status}`,
          entityType: "testDrive",
          entityId: item.id,
        }).catch(() => undefined);
      }
      if (note.trim() && admin) {
        await addTestDriveNote(item.id, {
          body: note.trim(),
          createdAt: new Date().toISOString(),
          createdBy: admin.uid,
          createdByName: admin.displayName || admin.email,
        });
        setNote("");
      }
      const next = await getTestDrive(item.id);
      if (next) {
        setItem(next);
        setStatus(next.status);
      } else {
        setItem({ ...item, status });
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
        <h1 className="font-display text-3xl">{item.name}</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <DeleteRecordButton
            title="Delete this test drive?"
            onDelete={async () => {
              await deleteTestDrive(item.id);
              router.push("/admin/test-drives");
            }}
          />
        </div>
      </div>
      <p className="text-sm text-muted">
        {item.vehicleLabel} · {item.preferredDate} {item.preferredTime}
      </p>
      <p className="text-sm">{item.phone} · {item.email}</p>
      <p className="text-sm">{item.message}</p>
      <Select
        label="Status"
        value={status}
        onChange={(event) => setStatus(event.target.value as TestDriveStatus)}
      >
        {TEST_DRIVE_STATUSES.map((value) => (
          <option key={value} value={value}>
            {statusLabel(value)}
          </option>
        ))}
      </Select>
      <Textarea label="Internal note" value={note} onChange={(event) => setNote(event.target.value)} />
      <Button type="button" loading={saving} onClick={() => void onSave()}>
        Save
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
