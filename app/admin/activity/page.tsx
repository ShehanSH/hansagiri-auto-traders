"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/ui/Feedback";
import { listActivity } from "@/lib/services/crm";
import { formatDateTime } from "@/utils/format";
import type { ActivityLog } from "@/types";

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityLog[]>([]);

  useEffect(() => {
    listActivity(1).then((result) => setItems(result.items));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Activity log</h1>
      <div className="mt-8 space-y-3">
        {items.length ? (
          items.map((item) => (
            <div key={item.id} className="border border-white/10 p-4 text-sm">
              <p>{item.action}</p>
              <p className="mt-1 text-xs text-muted">
                {item.userEmail} · {item.entityType} · {formatDateTime(item.timestamp)}
              </p>
            </div>
          ))
        ) : (
          <EmptyState title="No activity yet." />
        )}
      </div>
    </div>
  );
}
