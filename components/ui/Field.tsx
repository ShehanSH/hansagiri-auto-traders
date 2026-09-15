import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

const fieldClass =
  "w-full bg-dark border border-white/10 px-4 py-3 text-sm text-white placeholder:text-muted/70 focus:border-gold focus:outline-none disabled:opacity-50";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? props.name;
  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-xs uppercase tracking-[0.18em] text-gold-champagne/80">{label}</span>
      <input id={inputId} className={`${fieldClass} ${className}`} {...props} />
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className = "",
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? props.name;
  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-xs uppercase tracking-[0.18em] text-gold-champagne/80">{label}</span>
      <textarea id={inputId} className={`${fieldClass} min-h-32 resize-y ${className}`} {...props} />
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function Select({
  label,
  error,
  hint,
  id,
  children,
  className = "",
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const inputId = id ?? props.name;
  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-xs uppercase tracking-[0.18em] text-gold-champagne/80">{label}</span>
      <span className="relative block">
        <select
          id={inputId}
          className={`${fieldClass} appearance-none pr-10 scheme-dark cursor-pointer [&_option]:bg-dark [&_option]:text-white ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
        />
      </span>
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Company
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
