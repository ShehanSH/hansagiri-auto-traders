export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function vehicleSlug(input: {
  make: string;
  model: string;
  year: number;
  stockId: string;
}): string {
  return slugify(`${input.make} ${input.model} ${input.year} ${input.stockId}`);
}

export function buildSearchKeywords(input: {
  name?: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  stockId: string;
}): string[] {
  const parts = [
    input.name,
    input.make,
    input.model,
    input.variant,
    String(input.year),
    input.stockId,
    `${input.make} ${input.model}`,
  ]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2);

  return [...new Set(parts)];
}
