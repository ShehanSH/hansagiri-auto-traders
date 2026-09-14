import { describe, expect, it } from "vitest";
import { formatStockId, nextStockId, parseStockNumber } from "@/utils/stock-id";

describe("stock id helpers", () => {
  it("parses HT stock numbers", () => {
    expect(parseStockNumber("HT-001")).toBe(1);
    expect(parseStockNumber("ht-12")).toBe(12);
    expect(parseStockNumber("HT013")).toBe(13);
  });

  it("formats the next padded stock id", () => {
    expect(formatStockId(1)).toBe("HT-001");
    expect(nextStockId(["HT-001", "HT-012", "HT-007"])).toBe("HT-013");
    expect(nextStockId([])).toBe("HT-001");
  });
});
