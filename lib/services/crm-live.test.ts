import { describe, expect, it } from "vitest";
import { mergeCrmById, sortByCreatedAtDesc } from "@/lib/services/crm-live";
import { normalizeCustomer } from "@/lib/services/customers-shared";

describe("CRM live merge", () => {
  it("keeps live records and demo records that are not already live", () => {
    const merged = mergeCrmById(
      [
        { id: "demo-1", createdAt: "2026-01-01T00:00:00.000Z" },
        { id: "shared", createdAt: "2026-01-02T00:00:00.000Z" },
      ],
      [{ id: "live-1", createdAt: "2026-02-01T00:00:00.000Z" }, { id: "shared", createdAt: "2026-02-02T00:00:00.000Z" }],
    );

    expect(merged.map((item) => item.id)).toEqual(["live-1", "shared", "demo-1"]);
  });

  it("sorts newest first", () => {
    const sorted = sortByCreatedAtDesc([
      { id: "old", createdAt: "2026-01-01T00:00:00.000Z" },
      { id: "new", createdAt: "2026-03-01T00:00:00.000Z" },
    ]);
    expect(sorted.map((item) => item.id)).toEqual(["new", "old"]);
  });
});

describe("normalizeCustomer", () => {
  it("fills missing arrays so the admin customer page can render", () => {
    const customer = normalizeCustomer({
      id: "c_0771234567",
      name: "Shehan Hashen",
      phone: "0766650952",
    });

    expect(customer.inquiryIds).toEqual([]);
    expect(customer.testDriveIds).toEqual([]);
    expect(customer.tradeInIds).toEqual([]);
    expect(customer.notes).toEqual([]);
    expect(customer.status).toBe("new");
  });
});
