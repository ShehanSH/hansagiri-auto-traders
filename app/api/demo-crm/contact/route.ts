import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo/store";
import { persistDemoCrmToDisk } from "@/lib/demo/persist-crm";
import { submitContactToDemoStore } from "@/lib/demo/submit-contact";
import { isDemoMode } from "@/lib/env";
import { notifyNewRecord } from "@/lib/services/notifications";
import { contactSchema } from "@/lib/validation/contact";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json({ error: "Demo CRM is only available in demo mode." }, { status: 404 });
  }

  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid contact form data." },
      { status: 400 },
    );
  }

  const messageId = submitContactToDemoStore(parsed.data);
  const inquiryId = demoStore.inquiries[0]?.id ?? messageId;
  persistDemoCrmToDisk();
  await notifyNewRecord("contact", messageId);
  await notifyNewRecord("inquiry", inquiryId);

  return NextResponse.json({ id: messageId });
}
