"use client";

type Props = {
  label?: string;
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  formatValue: (value: number) => string;
};

export function PriceRangeSlider({
  label = "Price range",
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  formatValue,
}: Props) {
  const span = Math.max(max - min, 1);
  const left = ((valueMin - min) / span) * 100;
  const right = ((valueMax - min) / span) * 100;
  const minNearEnd = valueMin > min + span * 0.5;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs uppercase tracking-[0.18em] text-gold-champagne/80">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs tabular-nums text-white">
        <span>{formatValue(valueMin)}</span>
        <span className="text-muted">—</span>
        <span className="text-right">{formatValue(valueMax)}</span>
      </div>
      <div className="dual-range">
        <div className="dual-range-track" />
        <div
          className="dual-range-fill"
          style={{ left: `${left}%`, width: `${Math.max(right - left, 0)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMin}
          aria-label="Minimum price"
          aria-valuetext={formatValue(valueMin)}
          className={minNearEnd ? "z-30" : "z-20"}
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange(Math.min(next, valueMax), valueMax);
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={valueMax}
          aria-label="Maximum price"
          aria-valuetext={formatValue(valueMax)}
          className="z-20"
          onChange={(event) => {
            const next = Number(event.target.value);
            onChange(valueMin, Math.max(next, valueMin));
          }}
        />
      </div>
    </div>
  );
}
