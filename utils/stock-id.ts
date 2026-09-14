export const STOCK_ID_PREFIX = "HT";

export function parseStockNumber(stockId: string): number | null {
  const match = stockId.trim().toUpperCase().match(/^(?:HT[-\s]?)?(\d+)$/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function formatStockId(sequence: number): string {
  const safe = Math.max(1, Math.floor(sequence));
  return `${STOCK_ID_PREFIX}-${String(safe).padStart(3, "0")}`;
}

export function nextStockId(existing: string[]): string {
  let max = 0;
  for (const stockId of existing) {
    const value = parseStockNumber(stockId);
    if (value != null && value > max) max = value;
  }
  return formatStockId(max + 1);
}
