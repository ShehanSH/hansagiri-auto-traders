"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { toUserMessage } from "@/utils/errors";

export function DeleteRecordButton({
  title,
  description = "This permanently removes the record. This cannot be undone.",
  onDelete,
  className = "",
  size = "sm",
}: {
  title: string;
  description?: string;
  onDelete: () => Promise<void>;
  className?: string;
  size?: "sm" | "md";
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size={size}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        title={title}
        description={description}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onClose={() => {
          if (!deleting) setOpen(false);
        }}
        onConfirm={() => {
          void (async () => {
            setDeleting(true);
            try {
              await onDelete();
              setOpen(false);
              toast.push("Deleted");
            } catch (error) {
              toast.push(toUserMessage(error), "error");
            } finally {
              setDeleting(false);
            }
          })();
        }}
      />
    </>
  );
}
