export function toDirectionsHref(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(trimmed)}`;
}

export function toMapsEmbedSrc(address: string, mapsUrl = ""): string {
  if (mapsUrl.trim()) return mapsUrl.trim();
  const trimmed = address.trim();
  if (!trimmed) return "";
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
}
