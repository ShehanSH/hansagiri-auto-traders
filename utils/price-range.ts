export const DEFAULT_PRICE_BOUNDS = {
  min: 0,
  max: 50_000_000,
  step: 100_000,
};

export function catalogPriceBounds(prices: number[]): {
  min: number;
  max: number;
  step: number;
} {
  const valid = prices.filter((price) => Number.isFinite(price) && price > 0);
  if (!valid.length) return { ...DEFAULT_PRICE_BOUNDS };

  const rawMin = Math.min(...valid);
  const rawMax = Math.max(...valid);
  const span = Math.max(rawMax - rawMin, rawMin);
  const step = span > 20_000_000 ? 250_000 : 100_000;
  const min = Math.max(0, Math.floor(rawMin / step) * step);
  let max = Math.ceil(rawMax / step) * step;
  if (max <= min) max = min + step;
  return { min, max, step };
}

export function clampPrice(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function snapPrice(value: number, min: number, max: number, step: number): number {
  const clamped = clampPrice(value, min, max);
  if (step <= 0) return clamped;
  return clampPrice(min + Math.round((clamped - min) / step) * step, min, max);
}
