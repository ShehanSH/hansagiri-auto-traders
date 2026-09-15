"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Honeypot, Input, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { contactSchema } from "@/lib/validation/contact";
import { financingSchema } from "@/lib/validation/financing";
import { submitContact, submitFinancing } from "@/lib/services/contact";
import { toUserMessage } from "@/utils/errors";
import { hasClientCooldown, isHoneypotFilled, markClientCooldown } from "@/utils/spam";

export function ContactForm({ subject = "" }: { subject?: string }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (isHoneypotFilled(data.company) || hasClientCooldown("contact")) {
      toast.push("Message received. Thank you.");
      return;
    }
    const parsed = contactSchema.safeParse(data);
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
      await submitContact(parsed.data);
      markClientCooldown("contact");
      toast.push("Your message was sent. Our team will get back to you shortly.");
      form.reset();
    } catch (error) {
      toast.push(toUserMessage(error, "Could not send your message. Please try again."), "error");
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
      </div>
      <Input name="email" type="email" label="Email" required error={errors.email} />
      <Input name="subject" label="Subject" defaultValue={subject} required error={errors.subject} />
      <Textarea name="message" label="Message" required error={errors.message} />
      <Button type="submit" loading={loading} className="w-full">
        Send Message
      </Button>
    </form>
  );
}

export function FinancingForm() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (isHoneypotFilled(data.company) || hasClientCooldown("financing")) {
      toast.push("Financing enquiry received.");
      return;
    }
    const parsed = financingSchema.safeParse(data);
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
      await submitFinancing(parsed.data);
      markClientCooldown("financing");
      toast.push("Financing enquiry sent. Final terms depend on institution and dealership approval.");
      form.reset();
    } catch (error) {
      toast.push(toUserMessage(error, "Could not send the financing enquiry. Please try again."), "error");
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
      </div>
      <Input name="vehicleLabel" label="Vehicle of interest" />
      <Input name="estimatedBudget" label="Estimated budget" required error={errors.estimatedBudget} />
      <Input name="employmentType" label="Employment type" required error={errors.employmentType} />
      <Textarea name="message" label="Message" required error={errors.message} />
      <Button type="submit" loading={loading} className="w-full">
        Send Financing Enquiry
      </Button>
    </form>
  );
}
