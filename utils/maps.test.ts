import { describe, expect, it } from "vitest";
import { toMapsEmbedSrc } from "@/utils/maps";

describe("toMapsEmbedSrc", () => {
  it("ignores site URLs so a 404 page is never embedded", () => {
    expect(
      toMapsEmbedSrc("", "https://hansagiri-auto-traders.vercel.app/contact"),
    ).toBe("");
  });

  it("keeps a Google Maps embed URL", () => {
    const src = "https://www.google.com/maps/embed?pb=abc";
    expect(toMapsEmbedSrc("", src)).toBe(src);
  });

  it("builds an embed from an address when no maps URL is set", () => {
    expect(toMapsEmbedSrc("Colombo")).toContain("maps.google.com/maps?q=Colombo");
  });
});
