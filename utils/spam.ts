const WINDOW_MS = 30_000;
const submissions = new Map<string, number>();

export function isHoneypotFilled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function canSubmit(key: string, windowMs = WINDOW_MS): boolean {
  const last = submissions.get(key) ?? 0;
  const now = Date.now();
  if (now - last < windowMs) return false;
  submissions.set(key, now);
  return true;
}

export function clientCooldownKey(form: string): string {
  return `hat_submit_${form}`;
}

export function hasClientCooldown(form: string, windowMs = WINDOW_MS): boolean {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(clientCooldownKey(form));
  if (!raw) return false;
  const last = Number(raw);
  return Number.isFinite(last) && Date.now() - last < windowMs;
}

export function markClientCooldown(form: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(clientCooldownKey(form), String(Date.now()));
}
