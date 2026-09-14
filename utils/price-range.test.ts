import { describe, expect, it } from "vitest";
import { catalogPriceBounds, clampPrice, snapPrice, DEFAULT_PRICE_BOUNDS } from "@/utils/price-range";

describe("catalogPriceBounds", () => {
  it("falls back when there are no prices", () => {
    expect(catalogPriceBounds([])).toEqual(DEFAULT_PRICE_BOUNDS);
    expect(catalogPriceBounds([0, Number.NaN])).toEqual(DEFAULT_PRICE_BOUNDS);
  });

  it("rounds inventory prices to slider-friendly steps", () => {
    const bounds = catalogPriceBounds([3_650_000, 12_750_000, 32_500_000]);
    expect(bounds.min).toBeLessThanOrEqual(3_650_000);
    expect(bounds.max).toBeGreaterThanOrEqual(32_500_000);
    expect(bounds.step).toBe(250_000);
    expect(bounds.min % bounds.step).toBe(0);
    expect(bounds.max % bounds.step).toBe(0);
  });

  it("keeps a usable span when every vehicle costs the same", () => {
    const bounds = catalogPriceBounds([8_450_000, 8_450_000]);
    expect(bounds.max).toBeGreaterThan(bounds.min);
  });
});

describe("clampPrice", () => {
  it("keeps values inside the slider bounds", () => {
    expect(clampPrice(1_000, 3_500_000, 32_500_000)).toBe(3_500_000);
    expect(clampPrice(40_000_000, 3_500_000, 32_500_000)).toBe(32_500_000);
    expect(clampPrice(10_000_000, 3_500_000, 32_500_000)).toBe(10_000_000);
  });
});

describe("snapPrice", () => {
  it("snaps to the nearest step inside the bounds", () => {
    expect(snapPrice(3_620_000, 3_500_000, 32_500_000, 250_000)).toBe(3_500_000);
    expect(snapPrice(3_700_000, 3_500_000, 32_500_000, 250_000)).toBe(3_750_000);
  });
});
