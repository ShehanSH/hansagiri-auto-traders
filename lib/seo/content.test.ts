import { describe, expect, it } from "vitest";
import { buildSiteSeo, buildVehicleSeo, clipSeo } from "@/lib/seo/content";
import { composeVehicleName } from "@/utils/format";

describe("SEO helpers", () => {
  it("clips long text and keeps the limit", () => {
    const clipped = clipSeo("Quality new and pre-owned vehicles in Colombo", 24);
    expect(clipped.endsWith("…")).toBe(true);
    expect(clipped.length).toBeLessThanOrEqual(24);
  });

  it("builds site SEO from business details", () => {
    const seo = buildSiteSeo({
      businessName: "Hansagiri Auto Traders",
      businessDescription: "Quality new and pre-owned vehicles with honest pricing.",
      address: "Colombo",
    });
    expect(seo.title).toContain("Hansagiri Auto Traders");
    expect(seo.description).toContain("honest pricing");
  });

  it("builds vehicle SEO from listing data", () => {
    const name = composeVehicleName({
      year: 2022,
      make: "Toyota",
      model: "Premio",
      variant: "G Superior",
    });
    const seo = buildVehicleSeo({
      name,
      year: 2022,
      make: "Toyota",
      model: "Premio",
      price: 12750000,
      currency: "LKR",
      fuelType: "Petrol",
      mileage: 18500,
      vehicleType: "used",
    });
    expect(name).toBe("2022 Toyota Premio G Superior");
    expect(seo.title).toContain("2022 Toyota Premio");
    expect(seo.description.length).toBeGreaterThan(40);
    expect(seo.description.length).toBeLessThanOrEqual(180);
  });
});
