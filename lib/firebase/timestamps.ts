import { Timestamp } from "firebase/firestore";

export function nowIso(): string {
  return new Date().toISOString();
}

export function fromTimestamp(value: unknown): string {
  if (!value) return nowIso();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value && "toDate" in value) {
    try {
      return (value as Timestamp).toDate().toISOString();
    } catch {
      return nowIso();
    }
  }
  return nowIso();
}

export function toTimestamp(iso: string): Timestamp {
  return Timestamp.fromDate(new Date(iso));
}
