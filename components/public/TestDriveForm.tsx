"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Honeypot, Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { testDriveSchema } from "@/lib/validation/test-drive";
import { submitTestDrive } from "@/lib/services/test-drives";
import { toUserMessage } from "@/utils/errors";
import { hasClientCooldown, isHoneypotFilled, markClientCooldown } from "@/utils/spam";

export function TestDriveForm({
  vehicleId = "",
  vehicleLabel = "",
}: {
  vehicleId?: string;
  vehicleLabel?: string;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (isHoneypotFilled(data.company) || hasClientCooldown("testdrive")) {
      toast.push("Request received. This is a request only — our team will confirm.");
      return;
    }
    const parsed = testDriveSchema.safeParse({ ...data, vehicleId, vehicleLabel });
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
      await submitTestDrive(parsed.data);
      markClientCooldown("testdrive");
      toast.push("Test drive requested. Our team will confirm the appointment.");
      form.reset();
    } catch (error) {
      toast.push(toUserMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-4">
      <Honeypot />
      <p className="text-sm text-muted">
        This is a request, not an automatic booking. A team member will confirm date and time.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Customer name" required error={errors.name} />
        <Input name="phone" label="Phone" required error={errors.phone} />
        <Input name="whatsapp" label="WhatsApp" error={errors.whatsapp} />
        <Input name="email" type="email" label="Email" required error={errors.email} />
      </div>
      <Input name="vehicleLabel" label="Vehicle" defaultValue={vehicleLabel} />
      <input type="hidden" name="vehicleId" defaultValue={vehicleId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="preferredDate" type="date" label="Preferred date" required error={errors.preferredDate} />
        <Input name="preferredTime" type="time" label="Preferred time" required error={errors.preferredTime} />
      </div>
      <Textarea name="message" label="Message" error={errors.message} />
      <Button type="submit" loading={loading} className="w-full">
        Request Test Drive
      </Button>
    </form>
  );
}
