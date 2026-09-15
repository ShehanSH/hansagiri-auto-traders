import { Check } from "lucide-react";

export function VehicleFeatures({ features }: { features: string[] }) {
  if (!features.length) return null;

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl">Features</h2>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {features.length} included
        </p>
      </div>
      <div className="gold-rule mt-4" />
      <ul className="mt-6 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 border border-gold/15 bg-dark-secondary px-4 py-3 text-sm text-white/90 transition-colors duration-200 hover:border-gold/40 hover:bg-gold/10 hover:text-white"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-gold/15 text-gold">
              <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
            </span>
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
