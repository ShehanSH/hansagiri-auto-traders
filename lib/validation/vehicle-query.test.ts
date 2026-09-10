import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "@/config/defaults";
import { filterVehicles, isPubliclyVisible, sortVehicles } from "@/utils/vehicle-query";
import { buildSearchKeywords, slugify, vehicleSlug } from "@/utils/slug";
import type { Vehicle } from "@/types";
import { DEMO_VEHICLES } from "@/lib/demo/vehicles";

describe("slug helpers", () => {
  it("builds SEO-friendly vehicle slugs", () => {
    expect(vehicleSlug({ make: "Toyota", model: "Premio", year: 2022, stockId: "HT-001" })).toBe(
      "toyota-premio-2022-ht-001",
    );
  });

  it("strips extra characters", () => {
    expect(slugify("Honda  Vezel!")).toBe("honda-vezel");
  });

  it("collects search keywords", () => {
    const keywords = buildSearchKeywords({
      make: "Toyota",
      model: "Axio",
      variant: "Hybrid",
      year: 2021,
      stockId: "HT-002",
    });
    expect(keywords).toContain("toyota");
    expect(keywords).toContain("axio");
    expect(keywords).toContain("ht");
  });
});

describe("public vehicle visibility", () => {
  const draft = DEMO_VEHICLES.find((item) => item.status === "draft") as Vehicle;
  const sold = DEMO_VEHICLES.find((item) => item.status === "sold") as Vehicle;
  const available = DEMO_VEHICLES.find((item) => item.status === "available") as Vehicle;

  it("never shows draft vehicles", () => {
    expect(isPubliclyVisible(draft, DEFAULT_SETTINGS)).toBe(false);
  });

  it("hides sold vehicles unless enabled", () => {
    expect(isPubliclyVisible(sold, DEFAULT_SETTINGS)).toBe(false);
    expect(isPubliclyVisible(sold, { ...DEFAULT_SETTINGS, showSoldVehicles: true })).toBe(true);
  });

  it("shows available vehicles", () => {
    expect(isPubliclyVisible(available, DEFAULT_SETTINGS)).toBe(true);
  });

  it("filters by make and keyword", () => {
    const toyota = filterVehicles(DEMO_VEHICLES, { make: "Toyota", keyword: "premio" }, DEFAULT_SETTINGS);
    expect(toyota.every((item) => item.make === "Toyota")).toBe(true);
    expect(toyota.some((item) => item.model === "Premio")).toBe(true);
  });

  it("sorts by price ascending", () => {
    const sorted = sortVehicles(
      DEMO_VEHICLES.filter((item) => item.status === "available"),
      "price_asc",
    );
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i].price).toBeGreaterThanOrEqual(sorted[i - 1].price);
    }
  });
});
