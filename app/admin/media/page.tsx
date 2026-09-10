"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { useToast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { hasRole } from "@/lib/auth/permissions";
import { listMedia, uploadAdminImage } from "@/lib/services/media";
import { toUserMessage } from "@/utils/errors";
import type { MediaAsset } from "@/types";

export default function MediaPage() {
  const toast = useToast();
  const { admin } = useAdminAuth();
  const canWrite = hasRole(admin?.role, "media") || hasRole(admin?.role, "*");
  const [items, setItems] = useState<MediaAsset[]>([]);

  useEffect(() => {
    listMedia().then(setItems);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Media</h1>
        {canWrite ? (
          <label>
            <span className="sr-only">Upload</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file || !admin) return;
                try {
                  const asset = await uploadAdminImage(file, "media", admin.uid);
                  setItems((current) => [asset, ...current]);
                  toast.push("Uploaded");
                } catch (error) {
                  toast.push(toUserMessage(error), "error");
                }
              }}
            />
            <Button type="button" onClick={(event) => event.currentTarget.parentElement?.querySelector("input")?.click()}>
              Upload
            </Button>
          </label>
        ) : null}
      </div>
      {items.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item) => (
            <figure key={item.id} className="surface-card overflow-hidden">
              <img src={item.url} alt={item.name} className="h-36 w-full object-cover" />
              <figcaption className="truncate p-2 text-xs text-muted">{item.name}</figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="No media yet." />
        </div>
      )}
    </div>
  );
}
