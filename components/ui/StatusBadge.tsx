import { statusLabel } from "@/utils/format";

const overlayTones: Record<string, string> = {
  available: "border-success bg-success text-white shadow-lg",
  reserved: "border-gold bg-gold text-dark shadow-lg",
  sold: "border-white/30 bg-black/85 text-white shadow-lg",
  draft: "border-white/20 bg-black/75 text-white/80 shadow-lg",
  archived: "border-white/15 bg-black/70 text-white/70 shadow-lg",
};

const tones: Record<string, string> = {
  available: "border-success/40 text-success",
  reserved: "border-gold/50 text-gold",
  sold: "border-white/20 text-muted",
  draft: "border-white/15 text-muted",
  archived: "border-white/10 text-muted",
  new: "border-gold/50 text-gold",
  pending: "border-gold/50 text-gold",
  confirmed: "border-success/40 text-success",
  completed: "border-success/40 text-success",
  contacted: "border-gold-light/40 text-gold-light",
  converted: "border-success/40 text-success",
  lost: "border-danger/40 text-danger",
  cancelled: "border-danger/40 text-danger",
  no_show: "border-danger/40 text-danger",
  interested: "border-gold/50 text-gold",
  follow_up: "border-gold-champagne/40 text-gold-champagne",
  negotiation: "border-gold-light/40 text-gold-light",
  closed: "border-white/20 text-muted",
  reviewing: "border-gold/50 text-gold",
  valuation: "border-gold-light/40 text-gold-light",
  offer_sent: "border-gold-champagne/40 text-gold-champagne",
  accepted: "border-success/40 text-success",
  rejected: "border-danger/40 text-danger",
  read: "border-white/20 text-muted",
  active: "border-success/40 text-success",
};

export function StatusBadge({
  status,
  overlay = false,
}: {
  status: string;
  overlay?: boolean;
}) {
  const palette = overlay ? overlayTones : tones;
  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
        palette[status] ?? (overlay ? "border-white/30 bg-black/85 text-white shadow-lg" : "border-white/20 text-white")
      } ${overlay ? "px-3 py-1.5 text-[11px]" : ""}`}
    >
      {statusLabel(status)}
    </span>
  );
}
