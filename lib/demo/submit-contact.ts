import { demoStore } from "@/lib/demo/store";
import { customerDocId, upsertDemoCustomer } from "@/lib/services/customers-shared";
import { nowIso } from "@/lib/firebase/timestamps";
import type { ContactInput } from "@/lib/validation/contact";
import type { ContactMessage, Inquiry } from "@/types";

function contactToInquiry(id: string, input: ContactInput, customerId: string): Inquiry {
  const timestamp = nowIso();
  return {
    id,
    name: input.name,
    phone: input.phone,
    whatsapp: input.phone,
    email: input.email,
    vehicleId: null,
    vehicleLabel: input.subject,
    message: input.message,
    preferredContact: "phone",
    preferredDate: "",
    preferredTime: "",
    source: "contact",
    status: "new",
    assignedStaff: "",
    lastContact: "",
    followUpDate: "",
    notes: [],
    customerId,
    createdAt: timestamp,
    updatedAt: timestamp,
    archived: false,
  };
}

export function submitContactToDemoStore(input: ContactInput): string {
  const timestamp = nowIso();
  const customerId = customerDocId(input.phone, input.email);
  const message: ContactMessage = {
    id: demoStore.id("msg"),
    name: input.name,
    phone: input.phone,
    email: input.email,
    subject: input.subject,
    message: input.message,
    status: "new",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  const inquiry = contactToInquiry(demoStore.id("inq"), input, customerId);

  demoStore.messages.unshift(message);
  demoStore.inquiries.unshift(inquiry);
  upsertDemoCustomer({
    name: input.name,
    phone: input.phone,
    email: input.email,
    whatsapp: input.phone,
    inquiryId: inquiry.id,
  });

  return message.id;
}
