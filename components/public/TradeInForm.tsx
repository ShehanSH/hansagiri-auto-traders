"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Honeypot, Input, Select, Textarea } from "@/components/ui/Field";
import { ImageUploadButton } from "@/components/ui/ImageUploadButton";
import { useToast } from "@/components/ui/Toast";
import { FUEL_TYPES, MAX_TRADE_IN_IMAGES, TRANSMISSIONS } from "@/config/constants";
import { tradeInSchema } from "@/lib/validation/trade-in";
import { submitTradeIn } from "@/lib/services/trade-ins";
import { uploadPublicTradeInImage } from "@/lib/services/media";
import { toUserMessage } from "@/utils/errors";
import { hasClientCooldown, isHoneypotFilled, markClientCooldown } from "@/utils/spam";
import type { VehicleImage } from "@/types";

export function TradeInForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<VehicleImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  async function onFiles(files: FileList | null) {
    if (!files?.length || uploading) return;
    const selected = Array.from(files).slice(0, Math.max(0, MAX_TRADE_IN_IMAGES - images.length));
    if (!selected.length) {
      toast.push(`You can add up to ${MAX_TRADE_IN_IMAGES} photos.`, "error");
      return;
    }

    setUploading(true);
    setUploadStatus(
      selected.length === 1 ? "Image uploading…" : `Image uploading… 1 of ${selected.length}`,
    );
    try {
      for (const [index, file] of selected.entries()) {
        setUploadStatus(
          selected.length === 1
            ? "Image uploading…"
            : `Image uploading… ${index + 1} of ${selected.length}`,
        );
        const image = await uploadPublicTradeInImage(file);
        setImages((current) => [...current, image].slice(0, MAX_TRADE_IN_IMAGES));
      }
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (isHoneypotFilled(data.company) || hasClientCooldown("tradein")) {
      toast.push("Trade-in request received.");
      return;
    }
    const parsed = tradeInSchema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    const form = event.currentTarget;
    try {
      await submitTradeIn(parsed.data, images);
      markClientCooldown("tradein");
      toast.push("Trade-in request sent. We will review the details and contact you.");
      form.reset();
      setImages([]);
    } catch (error) {
      toast.push(toUserMessage(error, "Could not send the trade-in request. Please try again."), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Name" required error={errors.name} />
        <Input name="phone" label="Phone" required error={errors.phone} />
        <Input name="email" type="email" label="Email" required error={errors.email} className="sm:col-span-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="make" label="Make" required error={errors.make} />
        <Input name="model" label="Model" required error={errors.model} />
        <Input name="year" type="number" label="Year" required error={errors.year} />
        <Input name="mileage" type="number" label="Mileage (km)" required error={errors.mileage} />
        <Select name="fuelType" label="Fuel" defaultValue="">
          <option value="">Select</option>
          {FUEL_TYPES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Select name="transmission" label="Transmission" defaultValue="">
          <option value="">Select</option>
          {TRANSMISSIONS.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </Select>
        <Input name="condition" label="Condition" required error={errors.condition} />
        <Input name="registrationStatus" label="Registration status" required error={errors.registrationStatus} />
        <Input name="expectedPrice" type="number" label="Expected price (optional)" />
      </div>
      <Textarea name="notes" label="Additional notes" />
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-champagne/80">Vehicle photos</p>
        <ImageUploadButton
          uploading={uploading}
          status={uploadStatus}
          buttonLabel="Add photos"
          hint={`JPG, PNG, WebP, or AVIF. Up to ${MAX_TRADE_IN_IMAGES} photos.`}
          onSelect={onFiles}
        />
      </div>
      {images.length ? (
        <p className="text-xs text-muted">{images.length} image(s) ready to send</p>
      ) : null}
      <Button type="submit" loading={loading} disabled={uploading} className="w-full">
        Submit Trade-In
      </Button>
    </form>
  );
}
