"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Honeypot, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { inquirySchema } from "@/lib/validation/inquiry";
import { submitInquiry } from "@/lib/services/inquiries";
import { toUserMessage } from "@/utils/errors";
import { hasClientCooldown, isHoneypotFilled, markClientCooldown } from "@/utils/spam";
import type { InquirySource } from "@/types";

export function InquiryForm({
  vehicleId = "",
  vehicleLabel = "",
  source = "other",
}: {
  vehicleId?: string;
  vehicleLabel?: string;
  source?: InquirySource;
}) {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const defaults = useMemo(
    () => ({ vehicleId, vehicleLabel, source }),
    [vehicleId, vehicleLabel, source],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (isHoneypotFilled(data.company) || hasClientCooldown("inquiry")) {
      toast.push("Thank you. We have received your enquiry.");
      return;
    }
    const parsed = inquirySchema.safeParse({ ...data, ...defaults });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    const form = event.currentTarget;
    try {
      await submitInquiry(parsed.data);
      markClientCooldown("inquiry");
      toast.push("Enquiry sent. Our team will contact you shortly.");
      router.refresh();
      form.reset();
    } catch (error) {
      toast.push(toUserMessage(error, "Could not send your enquiry. Please try again."), "error");
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
        <Input name="whatsapp" label="WhatsApp" error={errors.whatsapp} />
        <Input name="email" type="email" label="Email" required error={errors.email} />
      </div>
      <Input
        name="vehicleLabel"
        label="Vehicle"
        defaultValue={vehicleLabel}
        error={errors.vehicleLabel}
      />
      <input type="hidden" name="vehicleId" defaultValue={vehicleId} />
      <Select name="preferredContact" label="Preferred contact" defaultValue="whatsapp">
        <option value="phone">Phone</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="email">Email</option>
      </Select>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="preferredDate"
          type="date"
          label="Preferred date (optional)"
          hint="Open the calendar to choose a day"
        />
        <Input
          name="preferredTime"
          type="time"
          label="Preferred time (optional)"
          hint="Open the clock to choose a time"
        />
      </div>
      <Textarea name="message" label="Message" required error={errors.message} />
      <Button type="submit" loading={loading} className="w-full">
        Send Inquiry
      </Button>
    </form>
  );
}
