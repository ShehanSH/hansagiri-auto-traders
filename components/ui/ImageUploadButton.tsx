"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";

type Props = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  uploading?: boolean;
  status?: string;
  buttonLabel?: string;
  hint?: string;
  onSelect: (files: FileList | null) => void;
};

export function ImageUploadButton({
  accept = "image/jpeg,image/png,image/webp,image/avif",
  multiple = true,
  disabled = false,
  uploading = false,
  status,
  buttonLabel = "Add images",
  hint = "JPG, PNG, WebP, or AVIF. You can select more than one.",
  onSelect,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled || uploading}
        className="sr-only"
        onChange={(event) => {
          onSelect(event.target.files);
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="secondary"
        loading={uploading}
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Uploading" : buttonLabel}
      </Button>
      {uploading ? (
        <p className="text-sm text-gold" role="status" aria-live="polite">
          {status || "Image uploading…"}
        </p>
      ) : (
        <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}
