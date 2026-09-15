export function toDirectionsHref(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trimmed)}`;
}

function isGoogleMapsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return (
      (host === "google.com" || host === "maps.google.com" || host.endsWith(".google.com")) &&
      (parsed.pathname.includes("/maps") || parsed.searchParams.get("output") === "embed")
    );
  } catch {
    return false;
  }
}

export function toMapsEmbedSrc(address: string, mapsUrl = ""): string {
  const trimmedUrl = mapsUrl.trim();
  if (trimmedUrl && isGoogleMapsUrl(trimmedUrl)) return trimmedUrl;
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}
