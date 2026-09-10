import { describe, expect, it } from "vitest";
import { toWhatsAppHref, vehicleInterestMessage } from "@/utils/whatsapp";

describe("WhatsApp helpers", () => {
  it("builds a wa.me link with a dynamic message", () => {
    const message = vehicleInterestMessage({
      businessName: "Hansagiri Auto Traders",
      title: "Toyota Premio 2022",
      stockId: "HT-001",
    });
    expect(message).toContain("Toyota Premio 2022");
    expect(message).toContain("HT-001");
    const href = toWhatsAppHref("0771234567", message);
    expect(href.startsWith("https://wa.me/94771234567")).toBe(true);
    expect(href).toContain("text=");
  });

  it("returns an empty href when the number is missing", () => {
    expect(toWhatsAppHref("")).toBe("");
  });
});
